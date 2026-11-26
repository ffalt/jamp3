import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';

import { ID3v2 } from '../../src/lib/id3v2/id3v2.js';
import { ID3v2Reader } from '../../src/lib/id3v2/id3v2.reader.js';
import { ReaderStream } from '../../src/lib/common/stream-reader.js';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { applyUnsync } from '../../src/lib/id3v2/frames/id3v2.frame.unsync.js';
import fse from 'fs-extra';
import path from 'node:path';

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

// eslint-disable-next-line unicorn/no-unnecessary-parameters
function buildV23Tag(extHeader: Buffer, frames: Buffer, padding = 4): Buffer {
	const size = extHeader.length + frames.length + padding;
	const head = Buffer.concat([
		Buffer.from('ID3', 'ascii'),
		Buffer.from([3, 0, 0x40]), // v2.3, extended header flag
		synchsafe(size)
	]);
	return Buffer.concat([head, extHeader, frames, Buffer.alloc(padding)]);
}

// eslint-disable-next-line unicorn/no-unnecessary-parameters
function buildV24Tag(extHeader: Buffer, frames: Buffer, padding = 4): Buffer {
	const size = extHeader.length + frames.length + padding;
	const head = Buffer.concat([
		Buffer.from('ID3', 'ascii'),
		Buffer.from([4, 0, 0x40]), // v2.4, extended header flag
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

	it('does not reject when the stream ends inside the extended header size field', async () => {
		for (const trailing of [0, 1, 2, 3]) {
			const head = Buffer.concat([
				Buffer.from('ID3', 'ascii'),
				Buffer.from([3, 0, 0x40]),
				synchsafe(14)
			]);
			const buffer = Buffer.concat([head, Buffer.alloc(trailing)]);
			const tag = await new ID3v2().readStream(streamOf(buffer));
			expect(tag).toBeDefined();
			expect(tag?.frames.length).toBe(0);
			expect(tag?.head?.v3?.extended?.size).toBe(0);
		}
	});
});

describe('ID3v2.4 extended header', () => {
	it('parses update, crc and restrictions flags', async () => {
		const crcBytes = Buffer.from([1, 2, 3, 4, 5]);
		const expectedCrc = (1 * 128 ** 4) + (2 * 128 ** 3) + (3 * 128 ** 2) + (4 * 128) + 5;
		const ext = Buffer.concat([
			synchsafe(4 + 1 + 1 + 1 + 6 + 2), // size includes itself: num flag bytes + flags + update data + crc data + restrictions data
			Buffer.from([0x01]), // number of flag bytes
			Buffer.from([0x70]), // flags: update (bit 6) + crc (bit 5) + restrictions (bit 4)
			Buffer.from([0x00]), // update flag data length
			Buffer.concat([Buffer.from([0x05]), crcBytes]), // crc flag data length + 35-bit crc
			Buffer.from([0x01, 0xAD]) // restrictions flag data length + restrictions byte %10101101
		]);
		const id3 = new ID3v2();
		const tag = await id3.readStream(streamOf(buildV24Tag(ext, tit2Frame)));
		const extended = tag?.head?.v4?.extended;
		expect(extended).toBeDefined();
		expect(extended?.flags.update).toBe(true);
		expect(extended?.flags.crc).toBe(true);
		expect(extended?.flags.restrictions).toBe(true);
		expect(extended?.crc32).toBe(expectedCrc);
		expect(extended?.restrictions).toEqual({
			tagSize: 2,
			textEncoding: 1,
			textSize: 1,
			imageEncoding: 1,
			imageSize: 1
		});
		const tit2 = tag?.frames.find(f => f.id === 'TIT2');
		expect((tit2?.value as any).text).toBe('hello');
	});

	it('does not let a malformed huge size swallow data beyond the tag', async () => {
		// ext header claims the maximum synchsafe size; it must be clamped to the tag body,
		// so reading stops exactly at the end of the tag and leaves the trailing bytes alone
		const ext = Buffer.concat([
			Buffer.from([0x7F, 0x7F, 0x7F, 0x7F]), // garbage huge size
			Buffer.from([0x01, 0x00, 0x00]) // num flag bytes, flags, padding
		]);
		const tagBytes = buildV24Tag(ext, tit2Frame);
		const withAudio = Buffer.concat([tagBytes, Buffer.from('AUDIO')]);
		const reader = new ReaderStream();
		await reader.openStream(streamOf(withAudio));
		const id3reader = new ID3v2Reader();
		const result = await id3reader.readReaderStream(reader);
		expect(result.tag).toBeDefined();
		expect(reader.pos).toBe(tagBytes.length);
	});

	it('does not crash on a truncated extended header at end of stream', async () => {
		const size = 4 + 2; // only the size field + 2 bytes follow
		const head = Buffer.concat([
			Buffer.from('ID3', 'ascii'),
			Buffer.from([4, 0, 0x40]),
			synchsafe(size)
		]);
		const id3 = new ID3v2();
		const buffer = Buffer.concat([head, Buffer.from([0, 0, 0, 2]), Buffer.from([0x01, 0x00])]);
		const tag = await id3.readStream(streamOf(buffer));
		expect(tag).toBeDefined();
		expect(tag?.frames.length).toBe(0);
	});

	it('does not reject when the stream ends inside the extended header size field', async () => {
		for (const trailing of [0, 1, 2, 3]) {
			const head = Buffer.concat([
				Buffer.from('ID3', 'ascii'),
				Buffer.from([4, 0, 0x40]),
				synchsafe(14)
			]);
			const buffer = Buffer.concat([head, Buffer.alloc(trailing)]);
			const tag = await new ID3v2().readStream(streamOf(buffer));
			expect(tag).toBeDefined();
			expect(tag?.frames.length).toBe(0);
			expect(tag?.head?.v4?.extended?.size).toBe(0);
		}
	});
});

function buildUnsyncedV23Tag(ext: Buffer, frames: Buffer, padding: number): Buffer {
	const size = ext.length + frames.length + padding;
	const head = Buffer.concat([
		Buffer.from('ID3', 'ascii'),
		Buffer.from([3, 0, 0xC0]), // v2.3, unsynchronisation + extended header
		synchsafe(size)
	]);
	return Buffer.concat([head, ext, frames, Buffer.alloc(padding)]);
}

function unsyncedV23WriteTag(extended: IID3V2.TagHeaderExtendedVer3, unsynchronisation: boolean): IID3V2.ID3v2Tag {
	return {
		head: {
			ver: 3,
			rev: 0,
			size: 0,
			valid: true,
			v3: { flags: { unsynchronisation, extendedheader: true }, extended }
		},
		frames: [{ id: 'TIT2', value: { text: 'hello' } }]
	} as any;
}

describe('ID3v2.3 extended header with tag-level unsynchronisation', () => {
	const dir = 'local/test-extheader-unsync';

	// crc bytes FF 00 FF E0 each need a stuffing byte, so the header grows on disk
	const logicalExt = Buffer.concat([
		Buffer.from([0, 0, 0, 10]), // size (excludes itself), with crc
		Buffer.from([0x80, 0]), // extended flags: crc present
		Buffer.from([0, 0, 0, 4]), // size of padding
		Buffer.from([0xFF, 0x00, 0xFF, 0xE0]) // crc-32
	]);

	beforeAll(async () => {
		await fse.ensureDir(dir);
	});

	afterAll(async () => {
		await fse.remove(dir);
	});

	it('de-unsynchronises the extended header and keeps the frame area aligned', async () => {
		const onDiskExt = applyUnsync(logicalExt);
		expect(onDiskExt.length).toBe(logicalExt.length + 2);
		const id3 = new ID3v2();
		const tag = await id3.readStream(streamOf(buildUnsyncedV23Tag(onDiskExt, tit2Frame, 4)));
		expect(tag?.head?.v3?.extended?.size).toBe(10);
		expect(tag?.head?.v3?.extended?.crcData).toBe(0xFF_00_FF_E0);
		expect(tag?.head?.v3?.extended?.sizeOfPadding).toBe(4);
		const tit2 = tag?.frames.find(f => f.id === 'TIT2');
		expect((tit2?.value as any).text).toBe('hello');
	});

	it('writes the extended header unsynchronised and counts it in the tag size', async () => {
		const file = path.join(dir, 'unsynced.mp3');
		const extended: IID3V2.TagHeaderExtendedVer3 = { size: 10, flags1: { crc: true }, flags2: {}, sizeOfPadding: 0, crcData: 0xFF_00_FF_E0 };
		await new ID3v2().write(file, unsyncedV23WriteTag(extended, true), 3, 0, { keepBackup: false, paddingSize: 4 });
		const raw = await fse.readFile(file);
		// the crc bytes are stuffed on disk, so the 14 logical bytes occupy 16
		expect([...raw.subarray(10, 26)]).toEqual([0, 0, 0, 10, 0x80, 0, 0, 0, 0, 4, 0xFF, 0x00, 0x00, 0xFF, 0x00, 0xE0]);
		const declaredSize = (raw[6] << 21) | (raw[7] << 14) | (raw[8] << 7) | raw[9];
		expect(declaredSize + 10).toBe(raw.length);
		const tag = await new ID3v2().read(file);
		expect(tag?.head?.v3?.extended?.crcData).toBe(0xFF_00_FF_E0);
		expect((tag?.frames.find(f => f.id === 'TIT2')?.value as any).text).toBe('hello');
	});

	it('does not reject when an unsynchronised stream ends inside the extended header size field', async () => {
		for (const trailing of [0, 1, 2, 3]) {
			const buffer = buildUnsyncedV23Tag(Buffer.alloc(trailing), Buffer.alloc(0), 0);
			const tag = await new ID3v2().readStream(streamOf(buffer));
			expect(tag).toBeDefined();
			expect(tag?.frames.length).toBe(0);
		}
	});

	it('writes a size field matching the crc payload even when the parsed size said 6', async () => {
		const file = path.join(dir, 'crcsize.mp3');
		const extended: IID3V2.TagHeaderExtendedVer3 = { size: 6, flags1: { crc: true }, flags2: {}, sizeOfPadding: 0, crcData: 0x12_34_56_78 };
		await new ID3v2().write(file, unsyncedV23WriteTag(extended, false), 3, 0, { keepBackup: false, paddingSize: 4 });
		const raw = await fse.readFile(file);
		expect(raw.readUInt32BE(10)).toBe(10);
		const tag = await new ID3v2().read(file);
		expect(tag?.head?.v3?.extended?.size).toBe(10);
		expect(tag?.head?.v3?.extended?.crcData).toBe(0x12_34_56_78);
	});
});
