import { describe, expect, it } from '@jest/globals';

import { utf8 } from '../../src/lib/common/encodings.js';

describe('Encodings[\'utf8\'].decode', () => {
	it('strips a leading utf-8 bom', () => {
		const buffer = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('hello', 'utf8')]);
		expect(utf8.decode(buffer)).toBe('hello');
	});

	it('does not corrupt characters in the range U+FF00-U+FFFF (EF BF xx lead bytes)', () => {
		// regression: EF BF was mistaken for a bom and the first two bytes were stripped
		const buffer = Buffer.from('￠100', 'utf8'); // EF BF A0 31 30 30
		expect(utf8.decode(buffer)).toBe('￠100');
	});

	it('keeps U+FFFF intact (EF BF BF is not a bom)', () => {
		const buffer = Buffer.from('￿', 'utf8'); // EF BF BF
		expect(utf8.decode(buffer)).toBe('￿');
	});

	it('decodes plain ascii text unchanged', () => {
		expect(utf8.decode(Buffer.from('plain', 'utf8'))).toBe('plain');
	});
});
