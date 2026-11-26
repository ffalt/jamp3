import { describe, expect, it } from '@jest/globals';

import { BufferReader } from '../../src/lib/common/buffer-reader.js';

describe('BufferReader.readUnsyncedBuffer', () => {
	it('returns the de-stuffed bytes and advances by the raw window size, not the amount', () => {
		// raw: FF 00 41 FF 00 42 'X' 'Y' -> unstuffed: FF 41 FF 42
		const reader = new BufferReader(Buffer.from([0xFF, 0x00, 0x41, 0xFF, 0x00, 0x42, 0x58, 0x59]));
		const result = reader.readUnsyncedBuffer(4);
		expect([...result]).toEqual([0xFF, 0x41, 0xFF, 0x42]);
		expect(reader.position).toBe(6); // consumed 6 raw bytes for 4 unstuffed ones
		expect(reader.readByte()).toBe(0x58);
	});

	it('grows the window past trailing stuffed bytes without consuming bytes of the next field', () => {
		// raw: FF 00 41 FF 00 42 ... the 4th unstuffed byte requires the 6th raw byte
		const reader = new BufferReader(Buffer.from([0xFF, 0x00, 0x41, 0xFF, 0x00, 0x42, 0x61, 0x62]));
		const result = reader.readUnsyncedBuffer(4);
		expect([...result]).toEqual([0xFF, 0x41, 0xFF, 0x42]);
		expect(reader.position).toBe(6);
		expect(reader.readUInt(2)).toBe(0x61_62);
	});

	it('advances exactly to the minimal raw window for densely stuffed data', () => {
		// FF 00 FF 00 FF 00 FF 00 -> 4 unstuffed bytes need 8 raw bytes
		const reader = new BufferReader(Buffer.from([0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x7A]));
		const result = reader.readUnsyncedBuffer(4);
		expect([...result]).toEqual([0xFF, 0xFF, 0xFF, 0xFF]);
		expect(reader.position).toBe(8);
		expect(reader.readByte()).toBe(0x7A);
	});

	it('throws on truncated data, clamps the cursor to the end and does not overshoot', () => {
		const reader = new BufferReader(Buffer.from([0xFF, 0x00, 0x41])); // only 2 unstuffed bytes available
		expect(() => reader.readUnsyncedBuffer(10)).toThrow(RangeError);
		expect(reader.position).toBe(reader.data.length);
		expect(reader.hasData()).toBe(false);
	});

	it('handles amount 0', () => {
		const reader = new BufferReader(Buffer.from([0x01, 0x02]));
		expect(reader.readUnsyncedBuffer(0).length).toBe(0);
		expect(reader.position).toBe(0);
	});
});

describe('BufferReader.readByte', () => {
	it('reads the bytes in order', () => {
		const reader = new BufferReader(Buffer.from([0x01, 0xAB, 0xFF]));
		expect([reader.readByte(), reader.readByte(), reader.readByte()]).toEqual([0x01, 0xAB, 0xFF]);
	});

	it('throws past the end instead of returning undefined', () => {
		const reader = new BufferReader(Buffer.from([0x01]));
		expect(reader.readByte()).toBe(0x01);
		expect(() => reader.readByte()).toThrow(RangeError);
	});

	it('throws on an empty buffer', () => {
		expect(() => new BufferReader(Buffer.alloc(0)).readByte()).toThrow(RangeError);
	});

	it('readBitsByte behaves the same', () => {
		const reader = new BufferReader(Buffer.from([0x7F]));
		expect(reader.readBitsByte()).toBe(0x7F);
		expect(() => reader.readBitsByte()).toThrow(RangeError);
	});
});
