import { IMP3 } from './mp3.types';
import { rawHeaderLayerIdx, rawHeaderOffSet, rawHeaderSize, rawHeaderVersionIdx } from './mp3.mpeg.frame';

function followChain(frame: IMP3.FrameRawHeaderArray, pos: number, frames: Array<IMP3.FrameRawHeaderArray>): Array<IMP3.FrameRawHeaderArray> {
	const result: Array<IMP3.FrameRawHeaderArray> = [];
	// console.log('include start frame:', 'current:', {size: frame.header.size, offset: frame.header.offset});
	let useFrame = frame;
	result.push(useFrame);
	const useFrames = frames.filter(f => rawHeaderSize(f) > 0);
	for (let i = pos + 1; i < useFrames.length; i++) {
		const nextpos = rawHeaderOffSet(useFrame) + rawHeaderSize(useFrame);
		const direct = getNextMatch(nextpos, i - 1, useFrames);
		if (direct >= 0) {
			const nextframe = useFrames[direct];
			result.push(nextframe);
			// console.log('include direct frame:', 'current:', {size: nextframe.header.size, offset: nextframe.header.offset});
			useFrame = nextframe;
			i = direct;
		} else {
			const nextframe = useFrames[i];
			const diff = rawHeaderOffSet(nextframe) - nextpos;
			if (diff === 0) {
				result.push(nextframe);
				// console.log('include direct diff frame:', 'current:', {size: nextframe.header.size, offset: nextframe.header.offset});
				useFrame = nextframe;
			} else if (diff > 0) {
				// TODO resync chain if nextframe.header.offset is larger
				if (rawHeaderVersionIdx(nextframe) === rawHeaderVersionIdx(useFrame) && rawHeaderLayerIdx(nextframe) === rawHeaderLayerIdx(useFrame)) {
					result.push(nextframe);
					// console.log('include frame after gap:', 'diff:', diff, 'current:', {size: nextframe.header.size, offset: nextframe.header.offset}, 'last:', {size: frame.header.size, offset: frame.header.offset});
					useFrame = nextframe;
				} else {
					// console.log('skipped frame after gap:', 'diff:', diff, 'current:', {size: nextframe.header.size, offset: nextframe.header.offset}, 'last:', {size: frame.header.size, offset: frame.header.offset});
				}
			} else {
				// console.log('skipped frame too soon:', 'diff:', diff, 'current:', {size: nextframe.header.size, offset: nextframe.header.offset}, 'last:', {size: frame.header.size, offset: frame.header.offset});
			}
		}
	}
	return result;
}

function getNextMatch(offset: number, pos: number, frames: Array<IMP3.FrameRawHeaderArray>): number {
	for (let j = pos + 1; j < frames.length; j++) {
		if (rawHeaderOffSet(frames[j]) === offset) {
			return j;
		} else if (rawHeaderOffSet(frames[j]) > offset) {
			return -1;
		}
	}
	return -1;
}

export interface IMPEGFrameChain {
	frame: Array<number>;
	pos: number;
	count: number;
}

function buildMPEGChains(frames: Array<IMP3.FrameRawHeaderArray>, maxCheckFrames: number, followMaxChain: number): Array<IMPEGFrameChain> {
	const done: Array<Array<number>> = [];
	const chains: Array<{ frame: Array<number>; pos: number; count: number }> = [];
	const count = Math.min(maxCheckFrames, frames.length);
	for (let i = 0; i < count; i++) {
		const frame = frames[i];
		if (!done.includes(frame)) {
			const chain = { frame, count: 0, pos: i };
			chains.push(chain);
			done.push(frame);
			let next = getNextMatch(rawHeaderOffSet(frame) + rawHeaderSize(frame), i, frames);
			while (next >= 0 && chain.count < followMaxChain) {
				chain.count++;
				const nextframe = frames[next];
				done.push(nextframe);
				next = getNextMatch(rawHeaderOffSet(nextframe) + rawHeaderSize(nextframe), next, frames);
			}
		}
	}
	return chains;
}

function findBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, maxCheckFrames: number, followMaxChain: number): IMPEGFrameChain | undefined {
	const chains = buildMPEGChains(frames, maxCheckFrames, followMaxChain);
	const bestChains = chains.filter(chain => chain.count > 0).sort((a, b) => b.count - a.count);
	return bestChains[0];
}

export function getBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): IMPEGFrameChain | undefined {
	if (frames.length === 0) {
		return;
	}
	let select: IMPEGFrameChain | undefined;
	let checkMaxFrames = 50;
	// try finding a chain in the first {checkMaxFrames} frames
	while (!select && checkMaxFrames < 500) {
		select = findBestMPEGChain(frames, checkMaxFrames, followMaxChain);
		if (checkMaxFrames > frames.length) {
			break;
		}
		checkMaxFrames += 50;
	}
	return select;
}

export function filterBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): Array<IMP3.FrameRawHeaderArray> {
	const chain = getBestMPEGChain(frames, followMaxChain);
	if (!chain) {
		return frames;
	}
	return followChain(chain.frame, chain.pos, frames);
}
