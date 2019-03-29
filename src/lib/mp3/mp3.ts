import {IMP3} from './mp3__types';
import {MP3Reader} from './mp3_reader';
import {buildID3v2} from '../id3v2/id3v2';
import {IID3V2} from '../id3v2/id3v2__types';
import {IID3V1} from '../id3v1/id3v1__types';
import {filterBestMPEGChain} from './mp3_frames';
import {expandRawHeader} from './mp3_frame';
import fse from 'fs-extra';
import {Readable} from 'stream';

export function isHeadFrame(frame: IMP3.Frame): boolean {
	return !!frame.mode;
}

export function analyzeBitrateMode(frames: Array<IMP3.Frame>): { encoded: string, bitRate: number, duration: number, count: number, audioBytes: number } {
	const bitRates: { [bitRate: number]: number } = {};
	let duration = 0;
	let audioBytes = 0;
	let count = 0;
	frames.forEach(frame => {
		const header: IMP3.FrameHeader = frame.header;
		bitRates[header.bitRate] = (bitRates[header.bitRate] || 0) + 1;
		duration += header.time;
		audioBytes += header.size;
		count++;
	});
	let encoded = 'CBR';
	let bitRate = frames.length > 0 ? frames[0].header.bitRate : 0;
	const rates = Object.keys(bitRates).map(s => parseInt(s, 10));
	if (rates.length > 1) {
		encoded = 'VBR';
		let sumBitrate = 0;
		let countBitrate = 0;
		rates.forEach(rate => {
			sumBitrate += (rate * bitRates[rate]);
			countBitrate += bitRates[rate];
		});
		bitRate = Math.trunc(sumBitrate / countBitrate);
	}
	return {encoded, bitRate, duration, count, audioBytes};
}

export class MP3 {

	async prepareResult(opts: IMP3.ReadOptions, layout: IMP3.Layout): Promise<IMP3.Result> {
		const id3v1s: Array<IID3V1.Tag> = <Array<IID3V1.Tag>>layout.tags.filter((o) => o.id === 'ID3v1');
		const result: IMP3.Result = {size: layout.size};
		if (opts.raw) {
			result.raw = layout;
		}
		if (opts.mpeg || opts.mpegQuick) {
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
			const frames: Array<IMP3.Frame> = filterBestMPEGChain(layout.frames, 50).map(frame => {
				return {
					header: expandRawHeader(frame.header),
					mode: frame.mode,
					xing: frame.xing,
					vbri: frame.vbri
				};
			});
			if (frames.length > 0) {
				const header: IMP3.FrameHeader = frames[0].header;
				mpeg.mode = header.channelType;
				mpeg.bitRate = header.bitRate;
				mpeg.channels = header.channelCount;
				mpeg.sampleRate = header.samplingRate;
				mpeg.sampleCount = header.samples;
				mpeg.version = header.version;
				mpeg.layer = header.layer;
			}
			const headframe = frames.find(f => isHeadFrame(f));
			const bitRateMode = analyzeBitrateMode(frames);
			mpeg.encoded = bitRateMode.encoded;
			mpeg.bitRate = bitRateMode.bitRate;
			result.frames = frames;
			if (opts.mpegQuick) {
				let audioBytes = layout.size;
				if (frames.length > 0) {
					audioBytes -= frames[0].header.offset;
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
		if (opts.id3v1 || opts.id3v1IfNotid3v2) {
			const id3v1: IID3V1.Tag | undefined = id3v1s.length > 0 ? id3v1s[id3v1s.length - 1] : undefined;
			if (id3v1 && id3v1.end === layout.size) {
				result.id3v1 = id3v1;
			}
		}
		const id3v2s: Array<IID3V2.RawTag> = <Array<IID3V2.RawTag>>layout.tags.filter(o => o.id === 'ID3v2');
		const id3v2raw: IID3V2.RawTag | undefined = id3v2s.length > 0 ? id3v2s[0] : undefined; // if there are more than one id3v2 tags, we take the first
		if ((opts.id3v2 || opts.id3v1IfNotid3v2) && id3v2raw) {
			result.id3v2 = await buildID3v2(id3v2raw);
		}
		return result;
	}

	async readStream(stream: Readable, opts: IMP3.ReadOptions, streamSize?: number): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const layout = await reader.readStream(stream, Object.assign({streamSize}, opts));
		return await this.prepareResult(opts, layout);
	}

	async read(filename: string, opts: IMP3.ReadOptions): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const stat = await fse.stat(filename);
		const layout = await reader.read(filename, Object.assign({streamSize: stat.size}, opts));
		return await this.prepareResult(opts, layout);
	}

}
