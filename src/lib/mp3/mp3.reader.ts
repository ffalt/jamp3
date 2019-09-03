import {Readable} from 'stream';
import fse from 'fs-extra';

import {IMP3} from './mp3.types';
import {ID3v1Reader} from '../id3v1/id3v1.reader';
import {ID3v2Reader} from '../id3v2/id3v2.reader';
import {collapseRawHeader, MPEGFrameReader} from './mp3.mpeg.frame';
import {BufferUtils} from '../common/buffer';
import {getBestMPEGChain} from './mp3.mpeg.chain';
import {ReaderStream} from '../common/stream-reader';

export interface MP3ReaderOptions extends IMP3.ReadOptions {
	streamSize?: number;
}

export class MP3Reader {
	private options: MP3ReaderOptions = {};
	private layout: IMP3.RawLayout = {
		frameheaders: [],
		headframes: [],
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
		const id3Header = this.id3v2reader.headerReader.readID3v2Header(chunk, i);
		if (id3Header && id3Header.valid) {
			const start = this.stream.pos - chunk.length + i;
			this.stream.unshift(chunk.slice(i));
			const result = await this.id3v2reader.readReaderStream(this.stream);
			if (result) {
				let rest = result.rest || BufferUtils.zeroBuffer(0);
				if (result.tag && result.tag.head.valid) {
					this.layout.tags.push(result.tag);
					result.tag.start = start;
					result.tag.end = this.stream.pos - rest.length;
					if (!this.options.detectDuplicateID3v2) {
						this.scanid3v2 = false;
					}
					if (this.options.id3v1IfNotID3v2) {
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
		header.offset = this.stream.pos - chunk.length + i;
		const a = this.mpegFramereader.readFrame(chunk, i, header);
		if (a.frame) {
			if (a.frame.vbri || a.frame.xing) {
				this.layout.headframes.push(a.frame);
			}
			this.layout.frameheaders.push(a.frame.header);
			if (this.options.mpegQuick) {
				this.hasMPEGHeadFrame = this.hasMPEGHeadFrame || !!a.frame.mode;
				if (this.layout.frameheaders.length % 50 === 0) {
					if (this.hasMPEGHeadFrame) {
						this.scanMpeg = false;
					} else {
						const chain = getBestMPEGChain(this.layout.frameheaders, 20);
						if (chain && chain.count >= 10) {
							this.scanMpeg = false;
						}
					}
				}
			}
		}
	}

	private async processChunkToEnd(chunk: Buffer): Promise<boolean> {
		if (this.options.streamSize !== undefined) {
			return false;
		}
		// we are done here, but scroll to end to get full stream size
		// TODO: better way to get the stream size?
		await this.stream.consumeToEnd();
		return false;
	}

	private async processChunkID3v1(chunk: Buffer): Promise<boolean> {
		let pos = 0;
		if (!this.stream.end && this.stream.buffersLength > 200) {
			this.stream.skip(this.stream.buffersLength - 200);
			chunk = this.stream.get(200);
			pos = 0;
		}
		while (chunk.length - pos >= 4) {
			const c1 = chunk[pos];
			const c2 = chunk[pos + 1];
			const c3 = chunk[pos + 2];
			if (c1 === 84 && c2 === 65 && c3 === 71) {
				if (this.demandData(chunk, pos) || await this.readID3V1(chunk, pos)) {
					return true;
				}
			}
			pos++;
		}
		return false;
	}

	private async processChunkID3v1AndID3v2AndMpeg(chunk: Buffer): Promise<boolean> {
		let pos = 0;
		while (chunk.length - pos >= 4) {
			const c1 = chunk[pos];
			const c2 = chunk[pos + 1];
			const c3 = chunk[pos + 2];
			if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51) {
				if (this.demandData(chunk, pos) || await this.readID3V2(chunk, pos)) {
					return true;
				}
			} else if (this.scanMpeg && c1 === 255) {
				if (this.demandData(chunk, pos)) {
					return true;
				}
				const header = this.mpegFramereader.readMPEGFrameHeader(chunk, pos);
				if (header) {
					this.scanid3v2 = false; // no more scanning for id3v2 after audio start
					if (!this.scanMPEGFrame) {
						header.offset = this.stream.pos - chunk.length + pos;
						this.layout.frameheaders.push(collapseRawHeader(header));
					} else {
						if (this.demandData(chunk, pos)) {
							return true;
						}
						this.readMPEGFrame(chunk, pos, header);
					}
				}
			} else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71) {
				if (this.demandData(chunk, pos) || await this.readID3V1(chunk, pos)) {
					return true;
				}
			}
			pos++;
		}
		return false;
	}

	private async processChunkID3v1AndID3v2(chunk: Buffer): Promise<boolean> {
		let pos = 0;
		while (chunk.length - pos >= 4) {
			const c1 = chunk[pos];
			const c2 = chunk[pos + 1];
			const c3 = chunk[pos + 2];
			if (c1 === 73 && c2 === 68 && c3 === 51) {
				if (this.demandData(chunk, pos) || await this.readID3V2(chunk, pos)) {
					return true;
				}
			} else if (c1 === 84 && c2 === 65 && c3 === 71) {
				if (this.demandData(chunk, pos) || await this.readID3V1(chunk, pos)) {
					return true;
				}
			}
			pos++;
		}
		return false;
	}

	private demandData(chunk: Buffer, pos: number): boolean {
		if (!this.stream.end && (chunk.length - pos) < 200) {
			// check if enough in chunk to read the frame header
			this.stream.unshift(chunk.slice(pos));
			return true;
		}
		return false;
	}

	private async processChunk(chunk: Buffer): Promise<boolean> {
		if (this.demandData(chunk, 0)) {
			return true;
		}
		if (!this.scanMpeg && !this.scanid3v2 && !this.scanid3v1) {
			return this.processChunkToEnd(chunk);
		} else if (!this.scanMpeg && !this.scanid3v2) {
			if (await this.processChunkID3v1(chunk)) {
				return true;
			}
		} else if (!this.scanMpeg) {
			if (await this.processChunkID3v1AndID3v2(chunk)) {
				return true;
			}
		} else if (await this.processChunkID3v1AndID3v2AndMpeg(chunk)) {
			return true;
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
		const requestChunkLength = 20000;
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
		this.layout.size = (this.options.streamSize !== undefined) ? this.options.streamSize : this.stream.pos;
	}

	private setOptions(options: MP3ReaderOptions): void {
		this.options = options || {};
		this.scanMpeg = options.mpeg || options.mpegQuick || false;
		this.scanid3v1 = options.id3v1 || options.id3v1IfNotID3v2 || false;
		this.scanid3v2 = options.id3v2 || options.id3v1IfNotID3v2 || false;
		this.layout = {
			headframes: [],
			frameheaders: [],
			tags: [],
			size: 0
		};
	}

	async read(filename: string, options: MP3ReaderOptions): Promise<IMP3.RawLayout> {
		this.setOptions(options);
		if (!options.streamSize) {
			options.streamSize = (await fse.stat(filename)).size;
		}
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

	async readStream(stream: Readable, options: MP3ReaderOptions): Promise<IMP3.RawLayout> {
		this.setOptions(options);
		await this.stream.openStream(stream);
		await this.scan();
		return this.layout;
	}
}
