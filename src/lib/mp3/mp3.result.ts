import {IMP3} from './mp3.types';
import {IID3V1, IID3V2, ITagID} from '../..';
import {filterBestMPEGChain} from './mp3.mpeg.chain';
import {expandRawHeader, expandRawHeaderArray, rawHeaderOffSet} from './mp3.mpeg.frame';
import {analyzeBitrateMode} from './mp3.bitrate';
import {buildID3v2} from '../id3v2/frames/id3v2.frame.read';

function calculateDuration(frameCount: number, sampleCount: number, sampleRate: number): number {
	if (frameCount > 0 && sampleCount > 0 && sampleRate > 0) {
		return Math.trunc(frameCount * sampleCount / sampleRate * 1000) / 1000;
	}
	return 0;
}

function buildFrames(chain: Array<IMP3.FrameRawHeaderArray>, layout: IMP3.RawLayout): IMP3.MPEGFrames {
	const frames: IMP3.MPEGFrames = {
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
	return frames;
}

function setResultBase(chain: Array<IMP3.FrameRawHeaderArray>, mpeg: IMP3.MPEG) {
	const header: IMP3.FrameHeader = expandRawHeader(expandRawHeaderArray(chain[0]));
	mpeg.mode = header.channelType;
	mpeg.bitRate = header.bitRate;
	mpeg.channels = header.channelCount;
	mpeg.sampleRate = header.samplingRate;
	mpeg.sampleCount = header.samples;
	mpeg.version = header.version;
	mpeg.layer = header.layer;
}

function setResultEstimate(layout: IMP3.RawLayout, chain: Array<IMP3.FrameRawHeaderArray>, mpeg: IMP3.MPEG) {
	let audioBytes = layout.size;
	if (chain.length > 0) {
		audioBytes -= rawHeaderOffSet(chain[0]);
		if (layout.tags.find(t => t.id === ITagID.ID3v1)) {
			audioBytes -= 128;
		}
		mpeg.durationEstimate = (audioBytes * 8) / mpeg.bitRate;
	}
}

function setResultCalculated(frameCount: number, audioBytes: number, duration: number, mpeg: IMP3.MPEG) {
	mpeg.frameCount = frameCount;
	mpeg.audioBytes = audioBytes;
	mpeg.durationRead = Math.trunc(duration) / 1000;
	mpeg.durationEstimate = calculateDuration(mpeg.frameCount, mpeg.sampleCount, mpeg.sampleRate);
}

function setResultHeadFrame(headframe: IMP3.Frame, mpeg: IMP3.MPEG) {
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

function defaultMPEGResult(): IMP3.MPEG {
	return {
		durationEstimate: 0, durationRead: 0, channels: 0, frameCount: 0, frameCountDeclared: 0, bitRate: 0,
		sampleRate: 0, sampleCount: 0, audioBytes: 0, audioBytesDeclared: 0,
		version: '', layer: '', encoded: '', mode: ''
	};
}

async function prepareResultMPEG(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<{ mpeg: IMP3.MPEG, frames: IMP3.MPEGFrames }> {
	const mpeg = defaultMPEGResult();
	const chain: Array<IMP3.FrameRawHeaderArray> = filterBestMPEGChain(layout.frameheaders, 50);
	const frames = buildFrames(chain, layout);
	const bitRateMode = analyzeBitrateMode(chain);
	if (chain.length > 0) {
		setResultBase(chain, mpeg);
	}
	mpeg.encoded = bitRateMode.encoded;
	mpeg.bitRate = bitRateMode.bitRate;
	if (options.mpegQuick) {
		setResultEstimate(layout, chain, mpeg);
	} else {
		setResultCalculated(bitRateMode.count, bitRateMode.audioBytes, bitRateMode.duration, mpeg);
	}
	const headframe = frames.headers[0];
	if (headframe) {
		setResultHeadFrame(headframe, mpeg);
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
