import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';

import { ID3v2 } from '../../src/lib/id3v2/id3v2.js';

class ChunkedStream extends Readable {
	private i = 0;

	constructor(private chunks: Array<Buffer>) {
		super();
	}

	override _read(): void {
		if (this.i < this.chunks.length) {
			this.push(this.chunks[this.i]);
			this.i++;
		} else {
			this.push(null);
		}
	}
}

// deliver the tag in small chunks; a single-chunk stream would set the reader's end flag before scanning
function streamOf(buffer: Buffer): Readable {
	const chunks: Array<Buffer> = [];
	for (let pos = 0; pos < buffer.length; pos += 7) {
		chunks.push(buffer.subarray(pos, pos + 7));
	}
	return new ChunkedStream(chunks);
}

function synchsafe(n: number): Buffer {
	const buf = Buffer.alloc(4);
	buf[0] = (n >> 21) & 0x7F;
	buf[1] = (n >> 14) & 0x7F;
	buf[2] = (n >> 7) & 0x7F;
	buf[3] = n & 0x7F;
	return buf;
}

function buildV23Tag(extHeader: Buffer, frames: Buffer, padding = 4): Buffer {
	const size = extHeader.length + frames.length + padding;
	const head = Buffer.concat([
		Buffer.from('ID3', 'ascii'),
		Buffer.from([3, 0, 0x40]), // v2.3, extended header flag
		synchsafe(size)
	]);
	return Buffer.concat([head, extHeader, frames, Buffer.alloc(padding)]);
}

const tit2Frame = Buffer.concat([
	Buffer.from('TIT2', 'ascii'),
	Buffer.from([0, 0, 0, 6]), // frame size: encoding byte + "hello"
	Buffer.from([0, 0]), // flags
	Buffer.from([0]), // encoding: iso-8859-1
	Buffer.from('hello', 'ascii')
]);

describe('ID3v2.3 extended header', () => {
	it('parses a valid 6-byte extended header', async () => {
		const ext = Buffer.concat([
			Buffer.from([0, 0, 0, 6]), // size (excludes itself), no crc
			Buffer.from([0, 0]), // extended flags
			Buffer.from([0, 0, 0, 4]) // size of padding
		]);
		const id3 = new ID3v2();
		const tag = await id3.readStream(streamOf(buildV23Tag(ext, tit2Frame)));
		expect(tag).toBeDefined();
		expect(tag?.head?.v3?.extended?.size).toBe(6);
		expect(tag?.head?.v3?.extended?.sizeOfPadding).toBe(4);
		const tit2 = tag?.frames.find(f => f.id === 'TIT2');
		expect((tit2?.value as any).text).toBe('hello');
	});

	it('parses a 10-byte extended header with crc data', async () => {
		const ext = Buffer.concat([
			Buffer.from([0, 0, 0, 10]), // size (excludes itself), with crc
			Buffer.from([0x80, 0]), // extended flags: crc present
			Buffer.from([0, 0, 0, 4]), // size of padding
			Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]) // crc-32
		]);
		const id3 = new ID3v2();
		const tag = await id3.readStream(streamOf(buildV23Tag(ext, tit2Frame)));
		expect(tag?.head?.v3?.extended?.flags1.crc).toBe(true);
		expect(tag?.head?.v3?.extended?.crcData).toBe(0xDE_AD_BE_EF);
		const tit2 = tag?.frames.find(f => f.id === 'TIT2');
		expect((tit2?.value as any).text).toBe('hello');
	});

	it('does not crash on a malformed size with the high bit set (e.g. FF FF FF FF)', async () => {
		const ext = Buffer.concat([
			Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), // garbage size, negative when read signed
			Buffer.alloc(10)
		]);
		const id3 = new ID3v2();
		// a garbage size eats an unpredictable number of bytes, so the frames may be misaligned;
		// the requirement is that reading resolves instead of crashing with a RangeError
		const tag = await id3.readStream(streamOf(buildV23Tag(ext, tit2Frame)));
		expect(tag).toBeDefined();
	});

	it('does not crash on a truncated extended header at end of stream', async () => {
		const size = 4 + 2; // only the size field + 2 flag bytes follow
		const head = Buffer.concat([
			Buffer.from('ID3', 'ascii'),
			Buffer.from([3, 0, 0x40]),
			synchsafe(size)
		]);
		const id3 = new ID3v2();
		const buffer = Buffer.concat([head, Buffer.from([0, 0, 0, 2]), Buffer.from([0, 0])]);
		const tag = await id3.readStream(streamOf(buffer));
		expect(tag).toBeDefined();
		expect(tag?.frames.length).toBe(0);
	});
});
