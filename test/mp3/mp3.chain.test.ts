import { describe, expect, it } from '@jest/globals';

import { filterBestMPEGChain, getBestMPEGChain } from '../../src/lib/mp3/mp3.mpeg.chain.js';
import { IMP3 } from '../../src/lib/mp3/mp3.types.js';

// front 0xFFFB = MPEG1 Layer III, back 0x9000 = valid bitrate/sample/mode; all headers share
// the same version/layer so gap-acceptance treats them as one stream
function header(offset: number, size: number): IMP3.FrameRawHeaderArray {
	return [offset, size, 0xFF_FB, 0x90_00];
}

describe('mp3.mpeg.chain', () => {
	it('follows the whole chain when no zero-size frames exist', () => {
		const frames = [header(100, 100), header(200, 100), header(300, 100)];
		const chain = filterBestMPEGChain(frames, 50);
		expect(chain.map(f => f[0])).toEqual([100, 200, 300]);
	});

	it('does not skip chain frames when a zero-size frame precedes the chain', () => {
		// regression: the chain position indexes the unfiltered frames array, but followChain
		// walks the size-filtered one; a zero-size frame before the chain shifted the start
		// and dropped the first real chain frame
		const zero = header(0, 0);
		const frames = [zero, header(100, 100), header(200, 100), header(300, 100)];
		const chain = filterBestMPEGChain(frames, 50);
		expect(chain.map(f => f[0])).toEqual([100, 200, 300]);
	});

	it('still selects the chain when zero-size frames are interleaved', () => {
		const frames = [
			header(100, 100),
			header(150, 0), // invalid/headerless entry inside the stream
			header(200, 100),
			header(300, 100)
		];
		const chain = getBestMPEGChain(frames, 50);
		expect(chain).toBeDefined();
		const followed = filterBestMPEGChain(frames, 50);
		expect(followed.map(f => f[0])).toEqual([100, 200, 300]);
	});
});
