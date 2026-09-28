import fse from 'fs-extra';
import tmp from 'tmp';
import * as zlib from 'node:zlib';
import { describe, expect, it } from '@jest/globals';

import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { ID3v2Reader } from '../../src/lib/id3v2/id3v2.reader.js';
import { buildID3v2 } from '../../src/lib/id3v2/frames/id3v2.frame.read.js';
import { writeRawFrames } from '../../src/lib/id3v2/frames/id3v2.frame.write.js';
import { Id3v2RawWriter } from '../../src/lib/id3v2/id3v2.writer.raw.js';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory.js';
import { applyUnsync } from '../../src/lib/id3v2/frames/id3v2.frame.unsync.js';

function synchsafe(n: number): Array<number> {
	return [(n >> 21) & 0x7F, (n >> 14) & 0x7F, (n >> 7) & 0x7F, n & 0x7F];
}

async function writeTagToBuffer(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader): Promise<Buffer> {
	const rawFrames = await writeRawFrames(frames, head);
	const stream = new MemoryWriterStream();
	await new Id3v2RawWriter(stream, head, { paddingSize: 0 }, rawFrames).write();
	return stream.toBuffer();
}

async function readTagFromBuffer(buffer: Buffer): Promise<IID3V2.Tag | undefined> {
	const file = tmp.fileSync();
	try {
		await fse.writeFile(file.name, buffer);
		const rawTag = await new ID3v2Reader().read(file.name);
		return rawTag ? buildID3v2(rawTag) : undefined;
	} finally {
		file.removeCallback();
	}
}

// locate the first frame data in a written tag buffer (header 10 bytes, frame header 10 bytes, no padding)
function firstFrameData(written: Buffer): Buffer {
	return written.subarray(20);
}

const v4head: IID3V2.TagHeader = { ver: 4, rev: 0, size: 0, valid: true };
const v3head: IID3V2.TagHeader = { ver: 3, rev: 0, size: 0, valid: true };

describe('ID3v2 compressed frames', () => {
	it('writes a synchsafe data length indicator for v2.4 compressed frames', async () => {
		// use data large enough (>= 0x4000) that synchsafe and plain size encodings differ
		const text = 'lorem ipsum dolor sit amet '.repeat(700); // 17500+ chars
		const frame: IID3V2.Frame = {
			id: 'TIT2',
			head: {
				size: 0,
				statusFlags: {},
				formatFlags: { compressed: true, dataLengthIndicator: true },
				encoding: 'utf8'
			},
			value: { text } as IID3V2.FrameValue.Text
		};
		const written = await writeTagToBuffer([frame], v4head);
		const data = firstFrameData(written);
		// data = [DLI 4 bytes][deflate...]; inflate the remainder and compare the indicator
		const decompressed = zlib.inflateSync(data.subarray(4));
		expect(decompressed.toString('utf8').slice(1)).toBe(text); // first byte is the encoding
		expect([data[0], data[1], data[2], data[3]]).toEqual(synchsafe(decompressed.length));
	});

	it('round-trips a v2.4 compressed frame with data length indicator', async () => {
		const text = 'round trip through zlib '.repeat(100);
		const frame: IID3V2.Frame = {
			id: 'TIT2',
			head: {
				size: 0,
				statusFlags: {},
				formatFlags: { compressed: true, dataLengthIndicator: true },
				encoding: 'utf8'
			},
			value: { text } as IID3V2.FrameValue.Text
		};
		const written = await writeTagToBuffer([frame], v4head);
		const tag = await readTagFromBuffer(written);
		expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe(text);
		expect(tag?.frames[0].head?.formatFlags?.compressed).toBe(true);
		expect(tag?.frames[0].head?.formatFlags?.dataLengthIndicator).toBe(true);
	});

	it('forces the data length indicator flag for v2.4 compressed frames (spec requires it)', async () => {
		const text = 'no dli flag in, dli flag out '.repeat(100);
		const frame: IID3V2.Frame = {
			id: 'TIT2',
			head: {
				size: 0,
				statusFlags: {},
				formatFlags: { compressed: true }, // no dataLengthIndicator given
				encoding: 'utf8'
			},
			value: { text } as IID3V2.FrameValue.Text
		};
		const written = await writeTagToBuffer([frame], v4head);
		// format flags byte: compressed (0x08) + dataLengthIndicator (0x01)
		expect(written[19]).toBe(0x09);
		const data = firstFrameData(written);
		const decompressed = zlib.inflateSync(data.subarray(4));
		expect([data[0], data[1], data[2], data[3]]).toEqual(synchsafe(decompressed.length));
		const tag = await readTagFromBuffer(written);
		expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe(text);
		expect(tag?.frames[0].head?.formatFlags?.compressed).toBe(true);
		expect(tag?.frames[0].head?.formatFlags?.dataLengthIndicator).toBe(true);
	});

	it('writes a plain decompressed size for v2.3 compressed frames', async () => {
		const text = 'v2.3 keeps the plain size prefix '.repeat(600); // >= 0x4000 bytes
		const frame: IID3V2.Frame = {
			id: 'TIT2',
			head: {
				size: 0,
				statusFlags: {},
				formatFlags: { compressed: true },
				encoding: 'utf8'
			},
			value: { text } as IID3V2.FrameValue.Text
		};
		const written = await writeTagToBuffer([frame], v3head);
		const data = firstFrameData(written);
		const decompressed = zlib.inflateSync(data.subarray(4));
		expect(decompressed.toString('utf8').slice(1)).toBe(text);
		// v2.3: plain (non-synchsafe) 32-bit decompressed size
		expect(data.readUInt32BE(0)).toBe(decompressed.length);
	});

	it('round-trips a v2.3 compressed frame', async () => {
		const text = 'round trip through zlib '.repeat(100);
		const frame: IID3V2.Frame = {
			id: 'TIT2',
			head: {
				size: 0,
				statusFlags: {},
				formatFlags: { compressed: true },
				encoding: 'utf8'
			},
			value: { text } as IID3V2.FrameValue.Text
		};
		const written = await writeTagToBuffer([frame], v3head);
		const tag = await readTagFromBuffer(written);
		expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe(text);
	});

	it('reads a v2.4 compressed+unsynchronised frame with only a data length indicator (no extra size prefix)', async () => {
		// spec layout: [DLI synchsafe][unsynchronised deflate data], flags = compressed | unsynchronised | DLI
		const text = 'compressed and unsynchronised '.repeat(50);
		const encoded = Buffer.concat([Buffer.from([3]), Buffer.from(text, 'utf8')]);
		const deflated = zlib.deflateSync(encoded);
		const payload = applyUnsync(deflated);
		const dli = Buffer.from(synchsafe(encoded.length));
		const frameData = Buffer.concat([dli, payload]);
		const formatByte = 0x08 | 0x02 | 0x01; // compressed | unsynchronised | dataLengthIndicator
		const frame = Buffer.concat([
			Buffer.from('TIT2', 'ascii'),
			Buffer.from(synchsafe(frameData.length)),
			Buffer.from([0, formatByte]),
			frameData
		]);
		const tagSize = frame.length;
		const head = Buffer.concat([
			Buffer.from('ID3', 'ascii'),
			Buffer.from([4, 0, 0]),
			Buffer.from(synchsafe(tagSize))
		]);
		const tag = await readTagFromBuffer(Buffer.concat([head, frame]));
		expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe(text);
	});

	it('reads the compressed fixture with both compressed and DLI flags set', async () => {
		const filename = 'test/data/testfiles/id3v2/agrundma/v2.4-compressed-frame.mp3';
		const rawTag = await new ID3v2Reader().read(filename);
		const tag = rawTag ? await buildID3v2(rawTag) : undefined;
		const tit2 = tag?.frames.find(f => f.id === 'TIT2');
		expect(tit2?.invalid).toBeUndefined();
		expect(tit2?.head?.formatFlags?.compressed).toBe(true);
		expect(tit2?.head?.formatFlags?.dataLengthIndicator).toBe(true);
		expect((tit2?.value as IID3V2.FrameValue.Text).text).toBeTruthy();
	});
});
