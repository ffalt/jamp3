import {IID3V1} from '../id3v1/id3v1__types';
import {IID3V2} from '../id3v2/id3v2__types';
import {findId3v2FrameDef} from '../id3v2/id3v2_frames';
import {MP3} from './mp3';
import {IMP3} from './mp3__types';
import {rawHeaderOffSet, rawHeaderSize} from './mp3_frame';
import {ITagID} from '../..';

/**
 * Interfaces for class MP3Analyzer
 */
export namespace IMP3Analyzer {

	export interface Warning {
		/** msg of warning */
		msg: string;
		/** expected value */
		expected: number | string | boolean;
		/** found value */
		actual: number | string | boolean;
	}

	export interface Options {
		/** test for mpeg warnings */
		mpeg: boolean;
		/** test for id3v2 warnings */
		id3v2: boolean;
		/** test for id3v1 warnings */
		id3v1: boolean;
		/** test for frame head xing warnings */
		xing: boolean;
		/** ignore most common error in off-by-one XING header declaration */
		ignoreXingOffOne?: boolean;
	}

	export interface Report {
		/** analyzed filename */
		filename: string;
		/** name of format e.g. "MPEG 1 (ISO/IEC 11172-3) MPEG audio layer 3" */
		format: string;
		/** bitrate mode e.g. CBR (constant), VBR (variable) */
		mode: string;
		/** duration in milliseconds */
		durationMS: number;
		/** bitrate (average if bitrate mode is variable) */
		bitRate: number;
		/** number of audio frames */
		frames: number;
		/** type of head audio frame e.g. "Info" or "XING" */
		header?: string;
		/** channel mode e.g. stereo, mono, single */
		channelMode?: string;
		/** number of channels */
		channels: number;
		/** has id3v2 */
		id3v2: boolean;
		/** has id3v1 */
		id3v1: boolean;
		/** array of warnings */
		warnings: Array<Warning>;
		/** tags data */
		tags: {
			/** the id3v2 tag data */
			id3v2?: IID3V2.Tag;
			/** the id3v1 tag data */
			id3v1?: IID3V1.Tag;
		};
	}
}

/**
 * Class for
 * - analyzing ID3v1/2 and MP3 information
 *
 * Basic usage example:
 *
 * ```ts
 * [[include:snippet_mp3-analyze.ts]]
 * ```
 * */
export class MP3Analyzer {

	private analyseID3v2(id3v2: IID3V2.Tag): Array<IMP3Analyzer.Warning> {
		const result: Array<IMP3Analyzer.Warning> = [];
		id3v2.frames.forEach(frame => {
			const def = findId3v2FrameDef(frame.id);
			if (def && id3v2.head && def.versions.indexOf(id3v2.head.ver) < 0) {
				result.push({msg: 'ID3v2: invalid version for frame ' + frame.id, expected: def.versions.join('|'), actual: id3v2.head.ver});
			}
		});
		return result;
	}

	/**
	 * Analyzes a file in given path with given options
	 * @param filename the file to read
	 * @param options define which information should be analyzed
	 * @return a object returning analyzed information
	 */
	async read(filename: string, options: IMP3Analyzer.Options): Promise<IMP3Analyzer.Report> {
		const mp3 = new MP3();
		const data = await mp3.read(filename, {id3v1: true, id3v2: true, mpeg: true, raw: true});
		if (!data || !data.mpeg || !data.frames) {
			return Promise.reject(Error('No mpeg data in file:' + filename));
		}
		const head = data.frames.headers[0];
		const info: IMP3Analyzer.Report = {
			filename,
			mode: data.mpeg.encoded,
			bitRate: data.mpeg.bitRate,
			channelMode: data.mpeg.mode && data.mpeg.mode.length > 0 ? data.mpeg.mode : undefined,
			channels: data.mpeg.channels,
			durationMS: data.mpeg.durationRead * 1000,
			format: data.mpeg.version && data.mpeg.version.length > 0 ? ('MPEG ' + data.mpeg.version + ' ' + data.mpeg.layer).trim() : 'unknown',
			header: head ? head.mode : undefined,
			frames: data.mpeg.frameCount,
			id3v1: !!data.id3v1,
			id3v2: !!data.id3v2,
			warnings: [],
			tags: {
				id3v1: data.id3v1,
				id3v2: data.id3v2,
			}
		};
		if (head && options.xing) {
			if (head.mode === 'Xing' && data.mpeg.encoded === 'CBR') {
				info.warnings.push({msg: 'XING: Wrong MPEG head frame for CBR', expected: 'Info', actual: 'Xing'});
			}
			if (head.mode === 'Info' && data.mpeg.encoded === 'VBR') {
				info.warnings.push({msg: 'XING: Wrong head frame for VBR', expected: 'Xing', actual: 'Info'});
			}
			if (!options.ignoreXingOffOne &&
				(data.mpeg.frameCount - data.mpeg.frameCountDeclared === 1) &&
				(data.mpeg.audioBytes - data.mpeg.audioBytesDeclared === head.header.size)
			) {
				info.warnings.push({msg: 'XING: Wrong ' + head.mode + ' declaration (frameCount and audioBytes must include the ' + head.mode + ' Header itself)', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared});
			} else {
				if (data.mpeg.frameCount !== data.mpeg.frameCountDeclared) {
					if (!options.ignoreXingOffOne || Math.abs(data.mpeg.frameCount - data.mpeg.frameCountDeclared) !== 1) {
						info.warnings.push({msg: 'XING: Wrong number of frames declared in ' + head.mode + ' Header', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared});
					}
				}
				if (data.mpeg.audioBytes !== data.mpeg.audioBytesDeclared) {
					if (!options.ignoreXingOffOne || data.mpeg.audioBytes + head.header.size - data.mpeg.audioBytesDeclared === 0) {
						info.warnings.push({msg: 'XING: Wrong number of data bytes declared in ' + head.mode + ' Header', expected: data.mpeg.audioBytes, actual: data.mpeg.audioBytesDeclared});
					}
				}
			}
		}
		if (!head && data.mpeg.encoded === 'VBR') {
			info.warnings.push({msg: 'XING: VBR detected, but no VBR head frame found', expected: 'VBR Header', actual: 'nothing'});
		}
		const lastframe: IMP3.FrameRawHeaderArray | undefined = data.frames.audio.length > 0 ? data.frames.audio[data.frames.audio.length - 1] : undefined;
		if (data.raw && lastframe) {
			const audioEnd = rawHeaderOffSet(lastframe) + rawHeaderSize(lastframe);
			let id3v1s: Array<IID3V1.Tag> = <Array<IID3V1.Tag>>data.raw.tags.filter(t => t.id === ITagID.ID3v1 && t.start >= audioEnd);
			if (options.id3v1 && id3v1s.length > 0) {
				if (id3v1s.length > 1) {
					// filter out not yet supported APETAGEX
					id3v1s = id3v1s.filter(t => {
						return t.value && t.value.title && t.value.title[0] !== 'E' && t.value.title[1] !== 'X' && t.end !== data.size;
					});
				}
				if (id3v1s.length > 1) {
					info.warnings.push({msg: 'ID3v1: Multiple tags', expected: 1, actual: id3v1s.length});
				}
				if (id3v1s.length > 0) {
					const id3v1 = id3v1s[id3v1s.length - 1];
					if (id3v1.end !== data.size) {
						info.warnings.push({msg: 'ID3v1: Invalid tag position, not at end of file', expected: (data.size - 128), actual: id3v1.start});
					}
				}
			}
		}
		if (data.frames.audio.length > 0) {
			const audiostart = rawHeaderOffSet(data.frames.audio[0]);
			if (data.id3v2 && data.id3v2.head) {
				const shouldaudiostart = data.id3v2.start + data.id3v2.head.size + 10; // 10 === id3v2 header
				if (audiostart !== shouldaudiostart) {
					info.warnings.push({msg: 'MP3: Unknown data found between ID3v2 and audio', expected: shouldaudiostart, actual: audiostart});
				}
			} else if (audiostart !== 0) {
				info.warnings.push({msg: 'MP3: Unknown data found before audio', expected: 0, actual: audiostart});
			}
		}

		if (options.mpeg) {
			if (data.frames.audio.length === 0) {
				info.warnings.push({msg: 'MPEG: No frames found', expected: '>0', actual: 0});
			} else {
				let nextdata = rawHeaderOffSet(data.frames.audio[0]) + rawHeaderSize(data.frames.audio[0]);
				data.frames.audio.slice(1).forEach((f, index) => {
					if (nextdata !== rawHeaderOffSet(f)) {
						info.warnings.push({msg: 'MPEG: stream error at position ' + nextdata + ', gap after frame ' + (index + 1), expected: 0, actual: rawHeaderOffSet(f) - nextdata});
					}
					nextdata = rawHeaderOffSet(f) + rawHeaderSize(f);
				});
			}
		}
		if (options.id3v2 && data.id3v2) {
			info.warnings = info.warnings.concat(this.analyseID3v2(data.id3v2));
		}
		return info;
	}

}
