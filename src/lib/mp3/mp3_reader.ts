import {IMP3} from './mp3__types';
import {ReaderStream} from '../common/streams';
import {ID3v1Reader} from '../id3v1/id3v1_reader';
import {ID3v2Reader} from '../id3v2/id3v2_reader';
import {MPEGFrameReader} from './mp3_frame';
import {BufferUtils} from '../common/buffer';
import {getBestMPEGChain} from './mp3_frames';
import {Readable} from 'stream';

type ErrorCallback = (err?: Error) => void;
type DataCallback<T> = (err?: Error, data?: T) => void;

interface MP3ReaderOptions extends IMP3.ReadOptions {
	streamSize?: number;
}


export class MP3Reader {
	private opts: MP3ReaderOptions = {};
	private layout: IMP3.Layout = {
		frames: [],
		tags: [],
		size: 0
	};
	private id3v2reader = new ID3v2Reader();
	private id3v1reader = new ID3v1Reader();
	private mpegFramereader = new MPEGFrameReader();
	private stream: ReaderStream = new ReaderStream();
	private finished: DataCallback<IMP3.Layout>;
	private scanMpeg = true;
	private scanid3v1 = true;
	private scanid3v2 = true;
	private scanMPEGFrame = true;
	private hasMPEGHeadFrame = false;

	constructor() {
		this.finished = () => {
		};
	}

	private readID3V1(chunk: Buffer, i: number, readNext: (buffer?: Buffer) => void): boolean {
		const tag = this.id3v1reader.readTag(chunk.slice(i, i + 128));
		if (!tag) {
			return false;
		}
		tag.start = this.stream.pos - chunk.length + i;
		tag.end = tag.start + 128;
		this.layout.tags.push(tag);
		if (!this.stream.end || chunk.length - 128 - i > 0) {
			// we need to rewind and scan, there are several unfortunate other tags which may be detected as valid td3v1, e.g. "APETAGEX", "TAG+", "CUSTOMTAG" or just a equal looking stream position
			readNext(chunk.slice(i + 1));
		} else {
			readNext(chunk.slice(i + 128));
		}
		return true;
	}

	private readID3V2(chunk: Buffer, i: number, reader: ReaderStream, readNext: (buffer?: Buffer) => void, cb: ErrorCallback): boolean {
		const id3Header = this.id3v2reader.readID3v2Header(chunk, i);
		if (id3Header && id3Header.valid) {
			const start = this.stream.pos - chunk.length + i;
			this.stream.unshift(chunk.slice(i));
			this.id3v2reader.readTag(reader)
				.then((result) => {
					if (!result) {
						return cb();
					}
					let rest = result.rest || BufferUtils.zeroBuffer(0);
					if (result.tag && result.tag.head.valid) {
						this.layout.tags.push(result.tag);
						result.tag.start = start;
						result.tag.end = this.stream.pos;
						this.scanid3v2 = false;
						if (this.opts.id3v1IfNotid3v2) {
							this.scanid3v1 = false;
						}
					} else {
						rest = rest.slice(1);
					}
					readNext(rest);
				}).catch(e => {
				cb(e);
			});
			return true;
		}
		return false;
	}

	private readMPEGFrame(chunk: Buffer, i: number, header: IMP3.FrameRawHeader) {
		const a = this.mpegFramereader.readFrame(chunk, i, header);
		if (a.frame) {
			header.offset = this.stream.pos - chunk.length + i;
			this.layout.frames.push(a.frame);
			if (this.opts.mpegQuick) {
				this.hasMPEGHeadFrame = this.hasMPEGHeadFrame || !!a.frame.mode;
				if (this.layout.frames.length % 50 === 0) {
					if (this.hasMPEGHeadFrame) {
						this.scanMpeg = false;
						// console.log('win head');
					} else {
						const chain = getBestMPEGChain(this.layout.frames, 20);
						if (chain && chain.count >= 10) {
							this.scanMpeg = false;
						}
					}
				}
			}
		}
	}

	private processChunk(stackLevel: number, chunk: Buffer, cb: ErrorCallback) {
		let i = 0;
		const requestChunkLength = 1800;

		const readNext = (unwind?: Buffer) => {
			if (unwind && unwind.length > 0) {
				this.stream.unshift(unwind);
			}
			this.stream.read(requestChunkLength)
				.then(data => {
					if (!data || (data.length === 0)) {
						return cb();
					}
					// debug('next chunk', 'stream.pos', this.stream.pos, 'pos:', i, 'buf:', data.length);
					if (stackLevel > 1000) {
						// invalid audio or large files from other types exceed the stack, avoid that with process.nextTick
						process.nextTick(() => {
							this.processChunk(0, data, cb);
						});
					} else {
						this.processChunk(stackLevel + 1, data, cb);
					}
				})
				.catch(e => {
					cb(e);
				});
		};

		const demandData = (): boolean => {
			if (!this.stream.end && (chunk.length - i) < 200) {
				// check if enough in chunk to read the frame header
				readNext(chunk.slice(i));
				return true;
			}
			return false;
		};

		const readMPEGFrame = (): boolean => {
			const header = this.mpegFramereader.readMPEGFrameHeader(chunk, i);
			if (header) {
				if (!this.scanMPEGFrame) {
					header.offset = this.stream.pos - chunk.length + i;
					this.layout.frames.push({header});
				} else {
					if (demandData()) {
						return true;
					}
					this.readMPEGFrame(chunk, i, header);
				}
			}
			return false;
		};

		if (demandData()) {
			return;
		}
		if (!this.scanMpeg && !this.scanid3v2 && !this.scanid3v1) {
			if (this.opts.streamSize !== undefined) {
				return cb();
			}
			// we are done here, but scroll to end to get full stream size
			// TODO: better way to get the stream size?
			return this.stream.consumeToEnd().then(() => cb()).catch(e => cb(e));
		} else if (!this.scanMpeg && !this.scanid3v2) {
			if (!this.stream.end && this.stream.buffersLength > 200) {
				this.stream.skip(this.stream.buffersLength - 200);
				chunk = this.stream.get(200);
				i = 0;
			}
			while (chunk.length - i >= 4) {
				const c1 = chunk[i];
				const c2 = chunk[i + 1];
				const c3 = chunk[i + 2];
				if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
					return;
				}
				i++;
			}
		} else if (!this.scanMpeg) {
			while (chunk.length - i >= 4) {
				const c1 = chunk[i];
				const c2 = chunk[i + 1];
				const c3 = chunk[i + 2];
				if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
					return;
				} else if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51 && (demandData() || this.readID3V2(chunk, i, this.stream, readNext, cb))) {
					return;
				}
				i++;
			}
		} else {
			while (chunk.length - i >= 4) {
				const c1 = chunk[i];
				const c2 = chunk[i + 1];
				const c3 = chunk[i + 2];
				if (this.scanMpeg && c1 === 255 && readMPEGFrame()) {
					return;
				} else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
					return;
				} else if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51 && (demandData() || this.readID3V2(chunk, i, this.stream, readNext, cb))) {
					return;
				}
				i++;
			}
		}
		if (chunk.length > 3) {
			return readNext(chunk.slice(chunk.length - 3));
		}
		readNext();
	}

	private scan() {
		if (this.stream.end) {
			return this.finished(undefined, this.layout);
		}
		this.processChunk(0, BufferUtils.zeroBuffer(0), (err2) => {
			if (err2) {
				return this.finished(err2);
			}
			if (this.opts.streamSize !== undefined) {
				this.layout.size = this.opts.streamSize;
			} else {
				this.layout.size = this.stream.pos;
			}
			return this.finished(undefined, this.layout);
		});
	}

	async read(filename: string, opts: MP3ReaderOptions): Promise<IMP3.Layout> {
		this.opts = opts || {};
		this.scanMpeg = opts.mpeg || opts.mpegQuick || false;
		this.scanid3v1 = opts.id3v1 || opts.id3v1IfNotid3v2 || false;
		this.scanid3v2 = opts.id3v2 || opts.id3v1IfNotid3v2 || false;
		return new Promise<IMP3.Layout>((resolve, reject) => {
			this.finished = (err, layout) => {
				this.stream.close();
				if (err) {
					reject(err);
				} else {
					resolve(layout);
				}
			};
			this.stream.open(filename)
				.then(() => {
					this.scan();
				})
				.catch(e => {
					this.stream.close();
					reject(e);
				});
		});
	}

	async readStream(stream: Readable, opts: MP3ReaderOptions): Promise<IMP3.Layout> {
		this.opts = opts;
		this.scanMpeg = opts.mpeg || opts.mpegQuick || false;
		this.scanid3v1 = opts.id3v1 || opts.id3v1IfNotid3v2 || false;
		this.scanid3v2 = opts.id3v2 || opts.id3v1IfNotid3v2 || false;
		return new Promise<IMP3.Layout>((resolve, reject) => {
			this.finished = (err, layout) => {
				if (err) {
					reject(err);
				} else {
					resolve(layout);
				}
			};
			this.stream.openStream(stream)
				.then(() => {
					this.scan();
				})
				.catch(e => {
					reject(e);
				});
		});
	}
}
