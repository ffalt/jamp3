import {IID3V1} from '../id3v1/id3v1__types';
import {IID3V2} from '../id3v2/id3v2__types';
import {findId3v2FrameDef} from '../id3v2/id3v2_frames';
import {MP3} from './mp3';
import {IMP3} from './mp3__types';

export interface IMP3Warning {
	msg: string;
	expected: number | string | boolean;
	actual: number | string | boolean;
}

export interface IMP3AnalyzerOptions {
	xing: boolean;
	mpeg: boolean;
	id3v2: boolean;
	id3v1: boolean;
	ignoreXingOffOne?: boolean;
}

export interface IMP3Report {
	filename: string;
	format: string;
	mode: string;
	durationMS: number;
	bitRate: number;
	frames: number;
	header?: string;
	channelMode?: string;
	channels: number;
	id3v2: boolean;
	id3v1: boolean;
	msgs: Array<IMP3Warning>;
	tags: {
		id3v2?: IID3V2.Tag;
		id3v1?: IID3V1.Tag;
	};
}

export class MP3Analyzer {

	analyseID3v2(id3v2: IID3V2.Tag): Array<IMP3Warning> {
		const result: Array<IMP3Warning> = [];
		id3v2.frames.forEach(frame => {
			const def = findId3v2FrameDef(frame.id);
			if (def && id3v2.head && def.versions.indexOf(id3v2.head.ver) < 0) {
				result.push({msg: 'ID3v2: invalid version for frame ' + frame.id, expected: def.versions.join(','), actual: id3v2.head.ver});
			}
		});
		return result;
	}

	async read(filename: string, options: IMP3AnalyzerOptions): Promise<IMP3Report> {
		const mp3 = new MP3();
		const data = await mp3.read(filename, {id3v1: true, id3v2: true, mpeg: true, raw: true});
		if (!data || !data.mpeg || !data.frames) {
			return Promise.reject(Error('No mpeg data in file:' + filename));
		}
		const head = data.frames.find(f => !!f.mode);
		const info: IMP3Report = {
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
			msgs: [],
			tags: {
				id3v1: data.id3v1,
				id3v2: data.id3v2,
			}
		};
		if (head && options.xing) {
			if (head.mode === 'Xing' && data.mpeg.encoded === 'CBR') {
				info.msgs.push({msg: 'XING: Wrong MPEG head frame for CBR', expected: 'Info', actual: 'Xing'});
			}
			if (head.mode === 'Info' && data.mpeg.encoded === 'VBR') {
				info.msgs.push({msg: 'XING: Wrong head frame for VBR', expected: 'Xing', actual: 'Info'});
			}
			if (!options.ignoreXingOffOne &&
				(data.mpeg.frameCount - data.mpeg.frameCountDeclared === 1) &&
				(data.mpeg.audioBytes - data.mpeg.audioBytesDeclared === head.header.size)
			) {
				info.msgs.push({msg: 'XING: Wrong ' + head.mode + ' declaration (frameCount and audioBytes must include the ' + head.mode + ' Header itself)', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared});
			} else {
				if (data.mpeg.frameCount !== data.mpeg.frameCountDeclared) {
					if (!options.ignoreXingOffOne || Math.abs(data.mpeg.frameCount - data.mpeg.frameCountDeclared) !== 1) {
						info.msgs.push({msg: 'XING: Wrong number of frames declared in ' + head.mode + ' Header', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared});
					}
				}
				if (data.mpeg.audioBytes !== data.mpeg.audioBytesDeclared) {
					if (!options.ignoreXingOffOne || data.mpeg.audioBytes + head.header.size - data.mpeg.audioBytesDeclared === 0) {
						info.msgs.push({msg: 'XING: Wrong number of data bytes declared in ' + head.mode + ' Header', expected: data.mpeg.audioBytes, actual: data.mpeg.audioBytesDeclared});
					}
				}
			}
		}
		if (!head && data.mpeg.encoded === 'VBR') {
			info.msgs.push({msg: 'XING: VBR detected, but no VBR head frame found', expected: 'VBR Header', actual: 'nothing'});
		}
		const lastframe: IMP3.Frame | undefined = data.frames.length > 0 ? data.frames[data.frames.length - 1] : undefined;
		if (data.raw && lastframe) {
			const audioEnd = lastframe.header.offset + lastframe.header.size;
			let id3v1s: Array<IID3V1.Tag> = <Array<IID3V1.Tag>>data.raw.tags.filter(t => t.id === 'ID3v1' && t.start >= audioEnd);
			if (options.id3v1 && id3v1s.length > 0) {
				if (id3v1s.length > 1) {
					// filter out not yet supported APETAGEX
					id3v1s = id3v1s.filter(t => {
						return t.value && t.value.title && t.value.title[0] !== 'E' && t.value.title[1] !== 'X' && t.end !== data.size;
					});
				}
				if (id3v1s.length > 1) {
					info.msgs.push({msg: 'ID3v1: Multiple tags', expected: 1, actual: id3v1s.length});
				}
				if (id3v1s.length > 0) {
					const id3v1 = id3v1s[id3v1s.length - 1];
					if (id3v1.end !== data.size) {
						info.msgs.push({msg: 'ID3v1: Invalid tag position, not at end of file', expected: (data.size - 128), actual: id3v1.start});
					}
				}
			}
		}
		if (options.mpeg) {
			if (data.frames.length === 0) {
				info.msgs.push({msg: 'MPEG: No frames found', expected: '>0', actual: 0});
			} else {
				let nextdata = data.frames[0].header.offset + data.frames[0].header.size;
				data.frames.slice(1).forEach((f, index) => {
					if (nextdata !== f.header.offset) {
						info.msgs.push({msg: 'MPEG: stream error at position ' + nextdata + ', gap after frame ' + (index + 1), expected: 0, actual: f.header.offset - nextdata});
					}
					nextdata = f.header.offset + f.header.size;
				});
			}
		}
		if (options.id3v2 && data.id3v2) {
			info.msgs = info.msgs.concat(this.analyseID3v2(data.id3v2));
		}
		return info;
	}

}
