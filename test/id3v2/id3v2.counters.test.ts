import fse from 'fs-extra';
import tmp from 'tmp';
import { describe, expect, it } from '@jest/globals';

import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { ID3v2Reader } from '../../src/lib/id3v2/id3v2.reader.js';
import { buildID3v2 } from '../../src/lib/id3v2/frames/id3v2.frame.read.js';
import { writeRawFrames } from '../../src/lib/id3v2/frames/id3v2.frame.write.js';
import { Id3v2RawWriter } from '../../src/lib/id3v2/id3v2.writer.raw.js';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory.js';

function synchsafe(n: number): Array<number> {
	return [(n >> 21) & 0x7F, (n >> 14) & 0x7F, (n >> 7) & 0x7F, n & 0x7F];
}

function buildV23Tag(frame: Buffer): Buffer {
	const padding = 4;
	const body = Buffer.concat([frame, Buffer.alloc(padding)]);
	return Buffer.concat([
		Buffer.from('ID3', 'ascii'),
		Buffer.from([3, 0, 0]),
		Buffer.from(synchsafe(body.length)),
		body
	]);
}

function pcntFrame(counter: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from('PCNT', 'ascii'),
		Buffer.from([0, 0, 0, counter.length]),
		Buffer.from([0, 0]),
		counter
	]);
}

async function readTag(buffer: Buffer): Promise<IID3V2.Tag | undefined> {
	const file = tmp.fileSync();
	try {
		await fse.writeFile(file.name, buffer);
		const rawTag = await new ID3v2Reader().read(file.name);
		return rawTag ? buildID3v2(rawTag) : undefined;
	} finally {
		file.removeCallback();
	}
}

async function writeAndRead(frames: Array<IID3V2.Frame>): Promise<IID3V2.Tag | undefined> {
	const head: IID3V2.TagHeader = { ver: 3, rev: 0, size: 0, valid: true };
	const rawFrames = await writeRawFrames(frames, head);
	const stream = new MemoryWriterStream();
	await new Id3v2RawWriter(stream, head, { paddingSize: 0 }, rawFrames).write();
	return readTag(stream.toBuffer());
}

describe('ID3v2 play counters', () => {
	it('parses a PCNT counter longer than 6 bytes', async () => {
		const counter = Buffer.from([0, 0, 0, 0, 0, 0, 0x30, 0x39]); // 8-byte 12345, old code returned 0
		const tag = await readTag(buildV23Tag(pcntFrame(counter)));
		expect((tag?.frames[0].value as IID3V2.FrameValue.Number).num).toBe(12_345);
	});

	it('saturates a PCNT counter beyond the exact integer range instead of dropping it', async () => {
		const counter = Buffer.alloc(8, 0xFF); // huge counter, old code returned 0
		const tag = await readTag(buildV23Tag(pcntFrame(counter)));
		expect((tag?.frames[0].value as IID3V2.FrameValue.Number).num).toBe(Number.MAX_SAFE_INTEGER);
	});

	it('round-trips a PCNT counter that needs more than 6 bytes', async () => {
		const frame: IID3V2.Frame = {
			id: 'PCNT',
			head: { size: 0, statusFlags: {}, formatFlags: {} },
			value: { num: Number.MAX_SAFE_INTEGER } as IID3V2.FrameValue.Number
		};
		const tag = await writeAndRead([frame]);
		expect((tag?.frames[0].value as IID3V2.FrameValue.Number).num).toBe(Number.MAX_SAFE_INTEGER);
	});

	it('round-trips a small PCNT counter unchanged', async () => {
		const frame: IID3V2.Frame = {
			id: 'PCNT',
			head: { size: 0, statusFlags: {}, formatFlags: {} },
			value: { num: 42 } as IID3V2.FrameValue.Number
		};
		const tag = await writeAndRead([frame]);
		expect((tag?.frames[0].value as IID3V2.FrameValue.Number).num).toBe(42);
	});

	it('parses a POPM counter longer than 6 bytes', async () => {
		const popm = Buffer.concat([
			Buffer.from('POPM', 'ascii'),
			Buffer.from([0, 0, 0, 12]),
			Buffer.from([0, 0]),
			Buffer.from('a@b', 'ascii'),
			Buffer.from([0]),
			Buffer.from([200]), // rating
			Buffer.from([0, 0, 0, 0, 0, 0x12, 0x34]) // 7-byte counter 4660, old code returned 0
		]);
		const tag = await readTag(buildV23Tag(popm));
		const value = tag?.frames[0].value as IID3V2.FrameValue.Popularimeter;
		expect(value.email).toBe('a@b');
		expect(value.rating).toBe(200);
		expect(value.count).toBe(4660);
	});

	it('round-trips a POPM counter that needs more than 6 bytes', async () => {
		const frame: IID3V2.Frame = {
			id: 'POPM',
			head: { size: 0, statusFlags: {}, formatFlags: {} },
			value: { email: 'a@b', rating: 128, count: Number.MAX_SAFE_INTEGER } as IID3V2.FrameValue.Popularimeter
		};
		const tag = await writeAndRead([frame]);
		const value = tag?.frames[0].value as IID3V2.FrameValue.Popularimeter;
		expect(value.email).toBe('a@b');
		expect(value.rating).toBe(128);
		expect(value.count).toBe(Number.MAX_SAFE_INTEGER);
	});
});
