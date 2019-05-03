import {IMP3} from './mp3__types';
import {ReaderStream} from '../common/streams';
import {ID3v1Reader} from '../id3v1/id3v1_reader';
import {ID3v2Reader} from '../id3v2/id3v2_reader';
import {MPEGFrameReader} from './mp3_frame';
import {BufferUtils} from '../common/buffer';
import {getBestMPEGChain} from './mp3_frames';
import {Readable} from 'stream';

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
	private scanMpeg = true;
	private scanid3v1 = true;
	private scanid3v2 = true;
	private scanMPEGFrame = true;
	private hasMPEGHeadFrame = false;

	constructor() {
	}

	private async readID3V1(chunk: Buffer, i: number): Promise<boolean> {
		const tag = this.id3v1reader.readTag(chunk.slice(i, i + 128));
		if (!tag) {
			return false;
		}
		tag.start = this.stream.pos - chunk.length + i;
		tag.end = tag.start + 128;
		this.layout.tags.push(tag);
		if (!this.stream.end || chunk.length - 128 - i > 0) {
			// we need to rewind and scan, there are several unfortunate other tags which may be detected as valid td3v1, e.g. "APETAGEX", "TAG+", "CUSTOMTAG" or just a equal looking stream position
			this.stream.unshift(chunk.slice(i + 1));
		} else {
			this.stream.unshift(chunk.slice(i + 128));
		}
		return true;
	}

	private async readID3V2(chunk: Buffer, i: number): Promise<boolean> {
		const id3Header = this.id3v2reader.readID3v2Header(chunk, i);
		if (id3Header && id3Header.valid) {
			const start = this.stream.pos - chunk.length + i;
			this.stream.unshift(chunk.slice(i));
			const result = await this.id3v2reader.readTag(this.stream);
			if (result) {
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
				this.stream.unshift(rest);
				return true;
			}
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

	private async processChunk(chunk: Buffer): Promise<boolean> {
		let i = 0;
		const demandData = (): boolean => {
			if (!this.stream.end && (chunk.length - i) < 200) {
				// check if enough in chunk to read the frame header
				this.stream.unshift(chunk.slice(i));
				return true;
			}
			return false;
		};

		if (demandData()) {
			return true;
		}
		if (!this.scanMpeg && !this.scanid3v2 && !this.scanid3v1) {
			if (this.opts.streamSize !== undefined) {
				return false;
			}
			// we are done here, but scroll to end to get full stream size
			// TODO: better way to get the stream size?
			await this.stream.consumeToEnd();
			return false;
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
				if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71) {
					if (demandData()) {
						return true;
					}
					if (await this.readID3V1(chunk, i)) {
						return true;
					}
				}
				i++;
			}
		} else if (!this.scanMpeg) {
			while (chunk.length - i >= 4) {
				const c1 = chunk[i];
				const c2 = chunk[i + 1];
				const c3 = chunk[i + 2];
				if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51) {
					if (demandData()) {
						return true;
					}
					if (await this.readID3V2(chunk, i)) {
						return true;
					}
				} else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71) {
					if (demandData()) {
						return true;
					}
					if (await this.readID3V1(chunk, i)) {
						return true;
					}
				}
				i++;
			}
		} else {
			while (chunk.length - i >= 4) {
				const c1 = chunk[i];
				const c2 = chunk[i + 1];
				const c3 = chunk[i + 2];

				if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51) {
					if (demandData()) {
						return true;
					}
					if (await this.readID3V2(chunk, i)) {
						return true;
					}
				} else if (this.scanMpeg && c1 === 255) {
					if (demandData()) {
						return true;
					}
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
				} else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71) {
					if (demandData()) {
						return true;
					}
					if (await this.readID3V1(chunk, i)) {
						return true;
					}
				}
				i++;
			}
		}
		if (chunk.length > 3) {
			this.stream.unshift(chunk.slice(chunk.length - 3));
		}
		return true;
	}

	private async scan(): Promise<void> {
		if (this.stream.end) {
			return;
		}
		const requestChunkLength = 1800;
		let go = true;
		while (go) {
			const data = await this.stream.read(requestChunkLength);
			if (!data || (data.length === 0)) {
				go = false;
				break;
			}
			try {
				go = await this.processChunk(data);
			} catch (e) {
				return Promise.reject(e);
			}
		}
		if (this.opts.streamSize !== undefined) {
			this.layout.size = this.opts.streamSize;
		} else {
			this.layout.size = this.stream.pos;
		}
	}

	async read(filename: string, opts: MP3ReaderOptions): Promise<IMP3.Layout> {
		this.opts = opts || {};
		this.scanMpeg = opts.mpeg || opts.mpegQuick || false;
		this.scanid3v1 = opts.id3v1 || opts.id3v1IfNotid3v2 || false;
		this.scanid3v2 = opts.id3v2 || opts.id3v1IfNotid3v2 || false;
		this.layout = {
			frames: [],
			tags: [],
			size: 0
		};
		await this.stream.open(filename);
		try {
			await this.scan();
			this.stream.close();
		} catch (e) {
			this.stream.close();
			return Promise.reject(e);
		}
		return this.layout;
	}

	async readStream(stream: Readable, opts: MP3ReaderOptions): Promise<IMP3.Layout> {
		this.opts = opts;
		this.scanMpeg = opts.mpeg || opts.mpegQuick || false;
		this.scanid3v1 = opts.id3v1 || opts.id3v1IfNotid3v2 || false;
		this.scanid3v2 = opts.id3v2 || opts.id3v1IfNotid3v2 || false;
		this.layout = {
			frames: [],
			tags: [],
			size: 0
		};
		await this.stream.openStream(stream);
		await this.scan();
		return this.layout;
	}
}
