import {IMP3} from './mp3__types';
import {rawHeaderLayerIdx, rawHeaderOffSet, rawHeaderSize, rawHeaderVersionIdx} from './mp3_frame';

// function findIndexOfOffset(start: number, list: Array<IMP3.RawFrame>, offset: number): number {
// 	for (let i = start; i < list.length; i++) {
// 		if (list[i].header.offset === offset) {
// 			return i;
// 		} else if (list[i].header.offset > offset) {
// 			return -1;
// 		}
// 	}
// 	return -1;
// }

function followChain(frame: IMP3.FrameRawHeaderArray, pos: number, frames: Array<IMP3.FrameRawHeaderArray>): Array<IMP3.FrameRawHeaderArray> {
	const result: Array<IMP3.FrameRawHeaderArray> = [];
	// console.log('include start frame:', 'current:', {size: frame.header.size, offset: frame.header.offset});
	result.push(frame);
	frames = frames.filter(f => rawHeaderSize(f) > 0);
	for (let i = pos + 1; i < frames.length; i++) {
		const nextpos = rawHeaderOffSet(frame) + rawHeaderSize(frame);
		const direct = getNextMatch(nextpos, i - 1, frames);
		if (direct >= 0) {
			const nextframe = frames[direct];
			result.push(nextframe);
			// console.log('include direct frame:', 'current:', {size: nextframe.header.size, offset: nextframe.header.offset});
			frame = nextframe;
			i = direct;
		} else {
			const nextframe = frames[i];
			const diff = rawHeaderOffSet(nextframe) - nextpos;
			if (diff === 0) {
				result.push(nextframe);
				// console.log('include direct diff frame:', 'current:', {size: nextframe.header.size, offset: nextframe.header.offset});
				frame = nextframe;
			} else if (diff > 0) {
				// TODO resync chain if nextframe.header.offset is larger
				if ((rawHeaderVersionIdx(nextframe) === rawHeaderVersionIdx(frame) &&
					rawHeaderLayerIdx(nextframe) === rawHeaderLayerIdx(frame))
				) {
					result.push(nextframe);
					// console.log('include frame after gap:', 'diff:', diff, 'current:', {size: nextframe.header.size, offset: nextframe.header.offset}, 'last:', {size: frame.header.size, offset: frame.header.offset});
					frame = nextframe;
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

export function getBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): IMPEGFrameChain | undefined {
	if (frames.length === 0) {
		return;
	}
	const done: Array<Array<number>> = [];
	const count = Math.min(50, frames.length);
	const chains: Array<{ frame: Array<number>, pos: number, count: number }> = [];
	for (let i = 0; i < count; i++) {
		const frame = frames[i];
		if (done.indexOf(frame) < 0) {
			const chain = {frame, count: 0, pos: i};
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
	let select = chains.filter(chain => chain.count > 0)[0];
	if (!select) {
		select = chains[0];
	}
	// const o = chains.filter(chain => chain.count > 0).map(chain => {
	// 	return 'chain from offset ' + chain.frame.header.offset + ': ' + chain.count;
	// }).join('\n');
	// console.log(o);
	// console.log('select', select.frame.header.offset, 'count', select.count);
	return select;
}

export function filterBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): Array<IMP3.FrameRawHeaderArray> {
	const chain = getBestMPEGChain(frames, followMaxChain);
	if (!chain) {
		return frames;
	}
	return followChain(chain.frame, chain.pos, frames);
}
