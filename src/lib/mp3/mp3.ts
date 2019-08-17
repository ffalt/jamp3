import {IMP3} from './mp3__types';
import {MP3Reader, MP3ReaderOptions} from './mp3_reader';
import {IID3V2} from '../id3v2/id3v2__types';
import {IID3V1} from '../id3v1/id3v1__types';
import {filterBestMPEGChain} from './mp3_frames';
import {expandRawHeader, expandRawHeaderArray, rawHeaderOffSet} from './mp3_frame';
import fse from 'fs-extra';
import {Readable} from 'stream';
import {ITagID} from '../..';
import {updateFile} from '../common/update-file';
import {analyzeBitrateMode} from './mp3_bitrate';
import {buildID3v2} from '../id3v2/id3v2_raw';

/**
 * Class for
 * - reading ID3v1/2 and MP3 information
 * - removing ID3v1/2
 *
 * Basic usage example:
 *
 * ```ts
 * [[include:snippet_mp3-read.ts]]
 * ```
 */
export class MP3 {

	private async prepareResult(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<IMP3.Result> {
		const id3v1s: Array<IID3V1.Tag> = <Array<IID3V1.Tag>>layout.tags.filter((o) => o.id === ITagID.ID3v1);
		const result: IMP3.Result = {size: layout.size};
		if (options.raw) {
			result.raw = layout;
		}
		if (options.id3v1 || options.id3v1IfNotID3v2) {
			const id3v1: IID3V1.Tag | undefined = id3v1s.length > 0 ? id3v1s[id3v1s.length - 1] : undefined;
			if (id3v1 && id3v1.end === layout.size) {
				result.id3v1 = id3v1;
			}
		}
		if (options.mpeg || options.mpegQuick) {
			const mpeg: IMP3.MPEG = {
				durationEstimate: 0,
				durationRead: 0,
				channels: 0,
				frameCount: 0,
				frameCountDeclared: 0,
				bitRate: 0,
				sampleRate: 0,
				sampleCount: 0,
				audioBytes: 0,
				audioBytesDeclared: 0,
				version: '',
				layer: '',
				encoded: '',
				mode: ''
			};
			const chain = filterBestMPEGChain(layout.frameheaders, 50);
			result.frames = {
				audio: chain,
				headers: layout.headframes.map(frame => {
					return {
						header: expandRawHeader(expandRawHeaderArray(frame.header)),
						mode: frame.mode,
						xing: frame.xing,
						vbri: frame.vbri
					};
				})
			};
			if (chain.length > 0) {
				const header: IMP3.FrameHeader = expandRawHeader(expandRawHeaderArray(chain[0]));
				mpeg.mode = header.channelType;
				mpeg.bitRate = header.bitRate;
				mpeg.channels = header.channelCount;
				mpeg.sampleRate = header.samplingRate;
				mpeg.sampleCount = header.samples;
				mpeg.version = header.version;
				mpeg.layer = header.layer;
			}
			const headframe = result.frames.headers[0];
			const bitRateMode = analyzeBitrateMode(chain);
			mpeg.encoded = bitRateMode.encoded;
			mpeg.bitRate = bitRateMode.bitRate;
			if (options.mpegQuick) {
				let audioBytes = layout.size;
				if (chain.length > 0) {
					audioBytes -= rawHeaderOffSet(chain[0]);
					if (id3v1s.length > 0) {
						audioBytes -= 128;
					}
					mpeg.durationEstimate = (audioBytes * 8) / mpeg.bitRate;
				}
			} else {
				mpeg.frameCount = bitRateMode.count;
				mpeg.audioBytes = bitRateMode.audioBytes;
				mpeg.durationRead = Math.trunc(bitRateMode.duration) / 1000;
				if (mpeg.frameCount > 0 && mpeg.sampleCount > 0 && mpeg.sampleRate > 0) {
					mpeg.durationEstimate = Math.trunc(mpeg.frameCount * mpeg.sampleCount / mpeg.sampleRate * 1000) / 1000;
				}
			}
			if (headframe) {
				if (headframe.xing) {
					if (headframe.xing.bytes !== undefined) {
						mpeg.audioBytesDeclared = headframe.xing.bytes;
					}
					if (headframe.xing.frames !== undefined) {
						mpeg.frameCountDeclared = headframe.xing.frames;
					}
					mpeg.encoded = headframe.mode === 'Xing' ? 'VBR' : 'CBR';
				} else if (headframe.vbri) {
					mpeg.audioBytesDeclared = headframe.vbri.bytes;
					mpeg.frameCountDeclared = headframe.vbri.frames;
					mpeg.encoded = 'VBR';
				}
				if (mpeg.frameCountDeclared > 0 && mpeg.sampleCount > 0 && mpeg.sampleRate > 0) {
					mpeg.durationEstimate = Math.trunc(mpeg.frameCountDeclared * mpeg.sampleCount / mpeg.sampleRate * 1000) / 1000;
				}
			}
			result.mpeg = mpeg;
		}

		const id3v2s: Array<IID3V2.RawTag> = <Array<IID3V2.RawTag>>layout.tags.filter(o => o.id === ITagID.ID3v2);
		const id3v2raw: IID3V2.RawTag | undefined = id3v2s.length > 0 ? id3v2s[0] : undefined; // if there are more than one id3v2 tags, we take the first
		if ((options.id3v2 || options.id3v1IfNotID3v2) && id3v2raw) {
			result.id3v2 = await buildID3v2(id3v2raw);
		}
		return result;
	}

	/**
	 * Reads a stream with given options
	 * @param stream the stream to read (NodeJS.stream.Readable)
	 * @param options define which information should be returned
	 * @param streamSize if known, provide the stream size to speed up duration calculation (otherwise stream has to be parse in full)
	 * @return a object returning parsed information
	 */
	async readStream(stream: Readable, options: IMP3.ReadOptions, streamSize?: number): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const layout = await reader.readStream(stream, Object.assign({streamSize}, options));
		return await this.prepareResult(options, layout);
	}

	/**
	 * Reads a file in given path with given options
	 * @param filename the file to read
	 * @param options define which information should be returned
	 * @return a object returning parsed information
	 */
	async read(filename: string, options: IMP3.ReadOptions): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const stat = await fse.stat(filename);
		const layout = await reader.read(filename, Object.assign({streamSize: stat.size}, options));
		return await this.prepareResult(options, layout);
	}

	/**
	 * Removes ID3v1 and/or ID3v2 Tag from a file with given options
	 * @param filename the file to clean
	 * @param options define which tags should be removed
	 * @return a object returning which tags have been removed
	 */
	async removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<IMP3.RemoveResult | undefined> {
		const stat = await fse.stat(filename);
		const opts: MP3ReaderOptions = {
			streamSize: stat.size,
			id3v2: options.id3v2,
			detectDuplicateID3v2: options.id3v2,
			id3v1: options.id3v1,
			mpegQuick: options.id3v2
		};
		let id2v1removed = false;
		let id2v2removed = false;
		await updateFile(filename, opts, !!options.keepBackup,
			layout => {
				for (const tag of layout.tags) {
					if (options.id3v2 && tag.id === ITagID.ID3v2 && tag.end > 0) {
						return true;
					} else if (options.id3v1 && tag.id === ITagID.ID3v1 && tag.end === stat.size && tag.start < stat.size) {
						return true;
					}
				}
				return false;
			},
			async (layout, fileWriter): Promise<void> => {
				let start = 0;
				let finish = stat.size;
				let specEnd = 0;
				for (const tag of layout.tags) {
					if (tag.id === ITagID.ID3v2 && options.id3v2) {
						if (start < tag.end) {
							specEnd = (tag as IID3V2.RawTag).head.size + tag.start + 10 /*header itself*/;
							start = tag.end;
							id2v2removed = true;
						}
					} else if (tag.id === ITagID.ID3v1 && options.id3v1 && tag.end === stat.size) {
						if (finish > tag.start) {
							finish = tag.start;
							id2v1removed = true;
						}
					}
				}
				if (options.id3v2) {
					if (layout.frameheaders.length > 0) {
						start = rawHeaderOffSet(layout.frameheaders[0]);
					} else {
						start = Math.max(start, specEnd);
					}
				}
				if (finish > start) {
					await fileWriter.copyRange(filename, start, finish);
				}
			});
		return id2v2removed || id2v1removed ? {id3v2: id2v2removed, id3v1: id2v1removed} : undefined;
	}

}
