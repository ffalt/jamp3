import { describe, expect, it } from '@jest/globals';

import { binary, utf8 } from '../../src/lib/common/encodings.js';

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

describe('Encodings[\'binary\']', () => {
	it('decodes every byte to the code point with the same value', () => {
		const buffer = Buffer.from([0x01, 0xAB, 0xFF, 0x00, 0x7F]);
		expect(binary.decode(buffer)).toBe('\u{1}\u{AB}\u{FF}\0\u{7F}');
	});

	it('encodes a plain string to its byte values instead of parsing it as hex', () => {
		expect([...binary.encode('hello')]).toEqual([...Buffer.from('hello', 'latin1')]);
	});

	it('round-trips arbitrary bytes', () => {
		const buffer = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
		expect([...binary.encode(binary.decode(buffer))]).toEqual([...buffer]);
	});

	it('does not throw on a string that is not valid hex', () => {
		expect([...binary.encode('not hex!')]).toEqual([...Buffer.from('not hex!', 'latin1')]);
	});
});
