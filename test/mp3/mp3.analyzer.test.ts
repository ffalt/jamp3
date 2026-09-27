import { describe, expect, it } from '@jest/globals';

import { MP3Analyzer } from '../../src/lib/mp3/mp3.analyzer.js';
import { IMP3 } from '../../src/lib/mp3/mp3.types.js';
import { IID3V1 } from '../../src/lib/id3v1/id3v1.types.js';
import { ITagID } from '../../src/lib/common/types.js';

function makeTag(start: number, end: number, title: string): IID3V1.Tag {
	return { id: ITagID.ID3v1, start, end, value: { title } };
}

function buildResult(tags: Array<IID3V1.Tag>, size: number, audioEnd: number): IMP3.Result {
	return {
		size,
		frames: { headers: [], audio: [[0, audioEnd]] },
		raw: { frameheaders: [], headframes: [], tags, size }
	};
}

function analyzeID3v1(data: IMP3.Result): Array<{ msg: string; expected: unknown; actual: unknown }> {
	const analyzer = new MP3Analyzer();
	return (analyzer as any).analyzeID3v1(data);
}

describe('MP3Analyzer.analyzeID3v1', () => {
	it('reports "Multiple tags" for a duplicate plus the correctly-positioned trailing tag', () => {
		const audioEnd = 1000;
		const size = 1256;
		const dup = makeTag(1000, 1128, 'DUP TITLE');
		const real = makeTag(1128, 1256, 'REAL TITLE');
		const warnings = analyzeID3v1(buildResult([dup, real], size, audioEnd));
		expect(warnings).toEqual([{ msg: 'ID3v1: Multiple tags', expected: 1, actual: 2 }]);
	});

	it('reports nothing for a single tag correctly positioned at the end of the file', () => {
		const audioEnd = 1000;
		const size = 1256;
		const real = makeTag(1128, 1256, 'REAL TITLE');
		const warnings = analyzeID3v1(buildResult([real], size, audioEnd));
		expect(warnings).toEqual([]);
	});

	it('excludes an APETAGEX false-positive match while still detecting the real duplicate', () => {
		const audioEnd = 1000;
		const size = 1384;
		const dup = makeTag(1000, 1128, 'DUP TITLE');
		const fake = makeTag(1128, 1256, 'EXTRATAG');
		const real = makeTag(1256, 1384, 'REAL TITLE');
		const warnings = analyzeID3v1(buildResult([dup, fake, real], size, audioEnd));
		expect(warnings).toEqual([{ msg: 'ID3v1: Multiple tags', expected: 1, actual: 2 }]);
	});

	it('reports "Invalid tag position" for a single misplaced tag not at the end of the file', () => {
		const audioEnd = 1000;
		const size = 2000;
		const dup = makeTag(1000, 1128, 'DUP TITLE');
		const warnings = analyzeID3v1(buildResult([dup], size, audioEnd));
		expect(warnings).toEqual([{ msg: 'ID3v1: Invalid tag position, not at end of file', expected: size - 128, actual: dup.start }]);
	});
});
