import {IMP3} from './mp3__types';
import {IID3V1, IID3V2, ITagID} from '../..';
import {filterBestMPEGChain} from './mp3_frames';
import {expandRawHeader, expandRawHeaderArray, rawHeaderOffSet} from './mp3_frame';
import {analyzeBitrateMode} from './mp3_bitrate';
import {buildID3v2} from '../id3v2/id3v2_raw';

function calculateDuration(frameCount: number, sampleCount: number, sampleRate: number): number {
	if (frameCount > 0 && sampleCount > 0 && sampleRate > 0) {
		return Math.trunc(frameCount * sampleCount / sampleRate * 1000) / 1000;
	}
	return 0;
}

async function prepareResultMPEG(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<{ mpeg: IMP3.MPEG, frames: IMP3.MPEGFrames }> {
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
	const frames = {
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
	const headframe = frames.headers[0];
	const bitRateMode = analyzeBitrateMode(chain);
	mpeg.encoded = bitRateMode.encoded;
	mpeg.bitRate = bitRateMode.bitRate;
	if (options.mpegQuick) {
		let audioBytes = layout.size;
		if (chain.length > 0) {
			audioBytes -= rawHeaderOffSet(chain[0]);
			if (layout.tags.find(t => t.id === ITagID.ID3v1)) {
				audioBytes -= 128;
			}
			mpeg.durationEstimate = (audioBytes * 8) / mpeg.bitRate;
		}
	} else {
		mpeg.frameCount = bitRateMode.count;
		mpeg.audioBytes = bitRateMode.audioBytes;
		mpeg.durationRead = Math.trunc(bitRateMode.duration) / 1000;
		mpeg.durationEstimate = calculateDuration(mpeg.frameCount, mpeg.sampleCount, mpeg.sampleRate);
	}
	if (headframe) {
		if (headframe.xing) {
			mpeg.audioBytesDeclared = headframe.xing.bytes || 0;
			mpeg.frameCountDeclared = headframe.xing.frames || 0;
			mpeg.encoded = headframe.mode === 'Xing' ? 'VBR' : 'CBR';
		} else if (headframe.vbri) {
			mpeg.audioBytesDeclared = headframe.vbri.bytes;
			mpeg.frameCountDeclared = headframe.vbri.frames;
			mpeg.encoded = 'VBR';
		}
		mpeg.durationEstimate = calculateDuration(mpeg.frameCountDeclared, mpeg.sampleCount, mpeg.sampleRate);
	}
	return {mpeg, frames};
}

export async function prepareResultID3v1(layout: IMP3.RawLayout): Promise<IID3V1.Tag | undefined> {
	const id3v1s: Array<IID3V1.Tag> = <Array<IID3V1.Tag>>layout.tags.filter((o) => o.id === ITagID.ID3v1);
	const id3v1: IID3V1.Tag | undefined = id3v1s.length > 0 ? id3v1s[id3v1s.length - 1] : undefined;
	if (id3v1 && id3v1.end === layout.size) {
		return id3v1;
	}
}

export async function prepareResultID3v2(layout: IMP3.RawLayout): Promise<IID3V2.Tag | undefined> {
	const id3v2s: Array<IID3V2.RawTag> = <Array<IID3V2.RawTag>>layout.tags.filter(o => o.id === ITagID.ID3v2);
	const id3v2raw: IID3V2.RawTag | undefined = id3v2s.length > 0 ? id3v2s[0] : undefined; // if there are more than one id3v2 tags, we take the first
	if (id3v2raw) {
		return await buildID3v2(id3v2raw);
	}
}

export async function prepareResult(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<IMP3.Result> {
	const result: IMP3.Result = {size: layout.size};
	if (options.raw) {
		result.raw = layout;
	}
	if (options.id3v1 || options.id3v1IfNotID3v2) {
		result.id3v1 = await prepareResultID3v1(layout);
	}
	if (options.id3v2 || options.id3v1IfNotID3v2) {
		result.id3v2 = await prepareResultID3v2(layout);
	}
	if (options.mpeg || options.mpegQuick) {
		const {mpeg, frames} = await prepareResultMPEG(options, layout);
		result.mpeg = mpeg;
		result.frames = frames;
	}
	return result;
}
