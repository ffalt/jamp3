import path from 'node:path';
import fse from 'fs-extra';
import tmp from 'tmp';

import { applyUnsync, needsUnsync, removeUnsync } from '../../src/lib/id3v2/frames/id3v2.frame.unsync';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory';
import { Id3v2RawWriter } from '../../src/lib/id3v2/id3v2.writer.raw';
import { ID3v2Reader } from '../../src/lib/id3v2/id3v2.reader';
import { buildID3v2 } from '../../src/lib/id3v2/frames/id3v2.frame.read';
import { writeRawFrames } from '../../src/lib/id3v2/frames/id3v2.frame.write';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types';
import { ID3v2 } from '../../src/lib/id3v2/id3v2';

const UNSYNC_TEST_PATH = path.join(__dirname, '..', 'data', 'testfiles', 'id3v2', 'agrundma');

async function writeAndRead(frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader): Promise<IID3V2.Tag | undefined> {
	const stream = new MemoryWriterStream();
	await new Id3v2RawWriter(stream, head, { paddingSize: 0 }, frames).write();
	const buffer = stream.toBuffer();
	const file = tmp.fileSync();
	try {
		await fse.writeFile(file.name, buffer);
		const reader = new ID3v2Reader();
		const rawTag = await reader.read(file.name);
		return rawTag ? buildID3v2(rawTag) : undefined;
	} finally {
		file.removeCallback();
	}
}

async function writeTagToBuffer(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<Buffer> {
	const rawFrames = await writeRawFrames(frames, head, defaultEncoding);
	const stream = new MemoryWriterStream();
	await new Id3v2RawWriter(stream, head, { paddingSize: 0 }, rawFrames).write();
	return stream.toBuffer();
}

describe('ID3v2 Unsync', () => {

	describe('needsUnsync', () => {
		it('returns false for empty buffer', () => {
			expect(needsUnsync(Buffer.alloc(0))).toBe(false);
		});
		it('returns false for data without 0xFF', () => {
			expect(needsUnsync(Buffer.from([0x00, 0x7F, 0xDF]))).toBe(false);
		});
		it('returns false for 0xFF followed by non-sync byte (0x01)', () => {
			expect(needsUnsync(Buffer.from([0xFF, 0x01]))).toBe(false);
		});
		it('returns false for 0xFF followed by 0xDF', () => {
			expect(needsUnsync(Buffer.from([0xFF, 0xDF]))).toBe(false);
		});
		it('returns true for 0xFF followed by 0xE0 (MPEG sync start)', () => {
			expect(needsUnsync(Buffer.from([0xFF, 0xE0]))).toBe(true);
		});
		it('returns true for 0xFF followed by 0xFF', () => {
			expect(needsUnsync(Buffer.from([0xFF, 0xFF]))).toBe(true);
		});
		it('returns true for 0xFF followed by 0x00', () => {
			expect(needsUnsync(Buffer.from([0xFF, 0x00]))).toBe(true);
		});
		it('returns true for 0xFF at end of buffer', () => {
			expect(needsUnsync(Buffer.from([0x01, 0xFF]))).toBe(true);
		});
		it('returns true for 0xFF 0xFE (UTF-16 LE BOM)', () => {
			expect(needsUnsync(Buffer.from([0x01, 0xFF, 0xFE, 0x41]))).toBe(true);
		});
	});

	describe('applyUnsync', () => {
		it('returns same buffer instance when no unsync needed', () => {
			const buf = Buffer.from([0x01, 0x02, 0xDF]);
			expect(applyUnsync(buf)).toBe(buf);
		});
		it('inserts 0x00 after 0xFF 0xE0', () => {
			expect(applyUnsync(Buffer.from([0xFF, 0xE0]))).toEqual(Buffer.from([0xFF, 0x00, 0xE0]));
		});
		it('inserts 0x00 after 0xFF 0xFF', () => {
			expect(applyUnsync(Buffer.from([0xFF, 0xFF]))).toEqual(Buffer.from([0xFF, 0x00, 0xFF, 0x00]));
		});
		it('inserts 0x00 after 0xFF 0x00', () => {
			expect(applyUnsync(Buffer.from([0xFF, 0x00]))).toEqual(Buffer.from([0xFF, 0x00, 0x00]));
		});
		it('inserts 0x00 after trailing 0xFF', () => {
			expect(applyUnsync(Buffer.from([0x01, 0xFF]))).toEqual(Buffer.from([0x01, 0xFF, 0x00]));
		});
		it('inserts 0x00 after 0xFF 0xFE (UTF-16 LE BOM)', () => {
			expect(applyUnsync(Buffer.from([0x01, 0xFF, 0xFE, 0x41]))).toEqual(Buffer.from([0x01, 0xFF, 0x00, 0xFE, 0x41]));
		});
		it('does not insert 0x00 after 0xFF 0x01', () => {
			expect(applyUnsync(Buffer.from([0xFF, 0x01]))).toEqual(Buffer.from([0xFF, 0x01]));
		});
		it('handles multiple FF sequences', () => {
			expect(applyUnsync(Buffer.from([0xFF, 0xE0, 0x01, 0xFF, 0x00]))).toEqual(
				Buffer.from([0xFF, 0x00, 0xE0, 0x01, 0xFF, 0x00, 0x00])
			);
		});
		it('returns empty buffer unchanged', () => {
			const buf = Buffer.alloc(0);
			expect(applyUnsync(buf)).toBe(buf);
		});
	});

	describe('applyUnsync + removeUnsync round-trip', () => {
		const cases: [string, Buffer][] = [
			['MPEG sync bytes', Buffer.from([0x00, 0xFF, 0xE0, 0x01])],
			['FF followed by 00', Buffer.from([0xFF, 0x00, 0xFF, 0xFB])],
			['UTF-16 LE BOM', Buffer.from([0x01, 0xFF, 0xFE, 0x41, 0x00, 0x6C, 0x00])],
			['trailing FF', Buffer.from([0x01, 0xFF])],
			['no unsync needed', Buffer.from([0xDE, 0xAD, 0xBE, 0xEF])],
			['consecutive FF sequences', Buffer.from([0xFF, 0xE0, 0xFF, 0xE0])],
			['single byte', Buffer.from([0xFF])],
		];
		it.each(cases)('round-trips %s', (_name, data) => {
			expect(removeUnsync(applyUnsync(data))).toEqual(data);
		});
	});

	describe('v2.4 per-frame unsync writing', () => {
		// TALB "A" in UTF-16 LE (ucs2 encoding):
		//   raw value: [0x01, 0xFF, 0xFE, 0x41, 0x00] (5 bytes, BOM triggers unsync)
		//   + DLI synchsafe(5) = [0x00, 0x00, 0x00, 0x05]
		//   + applyUnsync: 0xFF->0xFF 0x00, result = [0x00,0x00,0x00,0x05, 0x01,0xFF,0x00,0xFE,0x41,0x00] (10 bytes)
		// Written layout (30 bytes total):
		//   [0..9]  : ID3 tag header ("ID3" v4 rev0 flags=0x00 synchsafe(20)=0x00000014)
		//   [10..19]: TALB frame header ("TALB" synchsafe(10)=0x0000000A status=0x00 format=0x03)
		//   [20..29]: frame data (DLI + encoding + 0xFF 0x00 0xFE 'A' 0x00)
		const v24head: IID3V2.TagHeader = { ver: 4, rev: 0, size: 0, valid: true };
		const v24frame: IID3V2.Frame = {
			id: 'TALB',
			head: { size: 0, statusFlags: {}, formatFlags: { unsynchronised: true, dataLengthIndicator: true }, encoding: 'ucs2' },
			value: { text: 'A' } as IID3V2.FrameValue.Text
		};

		it('writes unsync byte (0x00) after 0xFF in frame data on disk', async () => {
			const written = await writeTagToBuffer([v24frame], v24head);
			// 0xFF is at written[25], 0x00 unsync byte at written[26], 0xFE at written[27]
			expect(written[25]).toBe(0xFF);
			expect(written[26]).toBe(0x00); // <-- the unsync byte
			expect(written[27]).toBe(0xFE);
		});

		it('stores frame size as post-unsync size (10) in frame header', async () => {
			const written = await writeTagToBuffer([v24frame], v24head);
			// Frame size is synchsafe(10) = 0x00 0x00 0x00 0x0A at written[14..17]
			expect(written[14]).toBe(0x00);
			expect(written[15]).toBe(0x00);
			expect(written[16]).toBe(0x00);
			expect(written[17]).toBe(0x0A); // 10 = post-unsync data length
		});

		it('sets format flags byte to indicate unsynchronised + dataLengthIndicator', async () => {
			const written = await writeTagToBuffer([v24frame], v24head);
			// format flags at written[19]: unsynchronised (bit 1) + dataLengthIndicator (bit 0) = 0x03
			expect(written[19]).toBe(0x03);
		});

		it('reads back frame value correctly after write with unsync', async () => {
			const rawFrames = await writeRawFrames([v24frame], v24head);
			const tag = await writeAndRead(rawFrames, { ...v24head });
			expect(tag).toBeTruthy();
			if (!tag) return;
			expect(tag.frames.length).toBe(1);
			expect(tag.frames[0].id).toBe('TALB');
			expect((tag.frames[0].value as IID3V2.FrameValue.Text).text).toBe('A');
		});

		it('preserves unsynchronised formatFlag in round-trip', async () => {
			const rawFrames = await writeRawFrames([v24frame], v24head);
			const tag = await writeAndRead(rawFrames, { ...v24head });
			expect(tag?.frames[0].head?.formatFlags.unsynchronised).toBe(true);
			expect(tag?.frames[0].head?.formatFlags.dataLengthIndicator).toBe(true);
		});

		it('reads back multiple frames with mixed unsync flags correctly', async () => {
			const frames: Array<IID3V2.Frame> = [
				{
					id: 'TALB',
					head: { size: 0, statusFlags: {}, formatFlags: { unsynchronised: true, dataLengthIndicator: true }, encoding: 'ucs2' },
					value: { text: 'Album' } as IID3V2.FrameValue.Text
				},
				{
					id: 'TIT2',
					head: { size: 0, statusFlags: {}, formatFlags: {}, encoding: 'utf8' },
					value: { text: 'Title' } as IID3V2.FrameValue.Text
				}
			];
			const rawFrames = await writeRawFrames(frames, v24head);
			const tag = await writeAndRead(rawFrames, { ...v24head });
			expect(tag?.frames.length).toBe(2);
			expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe('Album');
			expect((tag?.frames[1].value as IID3V2.FrameValue.Text).text).toBe('Title');
		});
	});

	describe('v2.3 tag-level unsync writing', () => {
		// TALB "A" in UTF-16 LE (default v2.3 encoding):
		//   raw value: [0x01, 0xFF, 0xFE, 0x41, 0x00] (5 bytes)
		//   tag-level applyUnsync: [0x01, 0xFF, 0x00, 0xFE, 0x41, 0x00] (6 bytes on disk)
		//   frame size in header = 5 (pre-unsync)
		// Written layout (26 bytes total):
		//   [0..9]  : ID3 tag header ("ID3" v3 rev0 flags=0x80 synchsafe(16)=0x00000010)
		//   [10..19]: TALB frame header ("TALB" 0x00000005 status=0x00 format=0x00)
		//   [20..25]: frame data (0x01 0xFF 0x00 0xFE 0x41 0x00)
		const v23head: IID3V2.TagHeader = {
			ver: 3, rev: 0, size: 0, valid: true,
			v3: { flags: { unsynchronisation: true } }
		};
		const v23frame: IID3V2.Frame = {
			id: 'TALB',
			head: { size: 0, statusFlags: {}, formatFlags: {}, encoding: 'ucs2' },
			value: { text: 'A' } as IID3V2.FrameValue.Text
		};

		it('sets bit 7 of ID3 flags byte (unsynchronisation)', async () => {
			const written = await writeTagToBuffer([v23frame], v23head);
			expect(written[5] & 0x80).toBe(0x80);
		});

		it('stores frame size as pre-unsync size (5) in frame header', async () => {
			const written = await writeTagToBuffer([v23frame], v23head);
			// Frame size at written[14..17] = 0x00 0x00 0x00 0x05 (pre-unsync = 5)
			expect(written[14]).toBe(0x00);
			expect(written[15]).toBe(0x00);
			expect(written[16]).toBe(0x00);
			expect(written[17]).toBe(0x05); // 5 = pre-unsync frame data length
		});

		it('writes unsync byte (0x00) after 0xFF in frame data on disk', async () => {
			const written = await writeTagToBuffer([v23frame], v23head);
			// frame data starts at written[20]: 0x01 0xFF 0x00 0xFE 0x41 0x00
			expect(written[21]).toBe(0xFF);
			expect(written[22]).toBe(0x00); // <-- the unsync byte
			expect(written[23]).toBe(0xFE);
		});

		it('reads back frame value correctly after write with tag-level unsync', async () => {
			const rawFrames = await writeRawFrames([v23frame], v23head);
			const tag = await writeAndRead(rawFrames, { ...v23head, v3: { flags: { unsynchronisation: true } } });
			expect(tag).toBeTruthy();
			if (!tag) return;
			expect(tag.frames.length).toBe(1);
			expect(tag.frames[0].id).toBe('TALB');
			expect((tag.frames[0].value as IID3V2.FrameValue.Text).text).toBe('A');
		});

		it('reads back multiple frames with tag-level unsync correctly', async () => {
			const head: IID3V2.TagHeader = { ver: 3, rev: 0, size: 0, valid: true, v3: { flags: { unsynchronisation: true } } };
			const frames: Array<IID3V2.Frame> = [
				{ id: 'TALB', head: { size: 0, statusFlags: {}, formatFlags: {}, encoding: 'ucs2' }, value: { text: 'Album' } as IID3V2.FrameValue.Text },
				{ id: 'TIT2', head: { size: 0, statusFlags: {}, formatFlags: {}, encoding: 'ucs2' }, value: { text: 'Title' } as IID3V2.FrameValue.Text }
			];
			const rawFrames = await writeRawFrames(frames, head);
			const tag = await writeAndRead(rawFrames, head);
			expect(tag?.frames.length).toBe(2);
			expect((tag?.frames[0].value as IID3V2.FrameValue.Text).text).toBe('Album');
			expect((tag?.frames[1].value as IID3V2.FrameValue.Text).text).toBe('Title');
		});
	});

	describe('round-trip with real unsync files', () => {
		it('writes v2.4-unsync.mp3 back and reads same frame values', async () => {
			const filename = path.join(UNSYNC_TEST_PATH, 'v2.4-unsync.mp3');
			const id3 = new ID3v2();
			const tag = await id3.read(filename);
			expect(tag?.head).toBeTruthy();
			if (!tag?.head) return;
			const file = tmp.fileSync();
			try {
				await fse.remove(file.name);
				await id3.write(file.name, tag, tag.head.ver, tag.head.rev, { keepBackup: false });
				const written = await id3.read(file.name);
				expect(written?.frames.length).toBe(tag.frames.length);
				for (const [i, frame] of tag.frames.entries()) {
					expect(written?.frames[i].id).toBe(frame.id);
					expect(written?.frames[i].head?.formatFlags).toEqual(frame.head?.formatFlags);
				}
			} finally {
				file.removeCallback();
			}
		});

		it('writes v2.4-unsync.mp3 back and preserves text values', async () => {
			const filename = path.join(UNSYNC_TEST_PATH, 'v2.4-unsync.mp3');
			const id3 = new ID3v2();
			const tag = await id3.read(filename);
			expect(tag?.head).toBeTruthy();
			if (!tag?.head) return;
			const file = tmp.fileSync();
			try {
				await fse.remove(file.name);
				await id3.write(file.name, tag, tag.head.ver, tag.head.rev, { keepBackup: false });
				const written = await id3.read(file.name);
				expect(written?.frames.length).toBe(tag.frames.length);
				for (const [i, frame] of tag.frames.entries()) {
					const wf = written?.frames[i];
					expect(wf?.id).toBe(frame.id);
					const origText = (frame.value as IID3V2.FrameValue.Text).text;
					if (origText !== undefined) {
						expect((wf!.value as IID3V2.FrameValue.Text).text).toBe(origText);
					}
				}
			} finally {
				file.removeCallback();
			}
		});

		it('writes v2.3-unsync.mp3 back and reads same frame values', async () => {
			const filename = path.join(UNSYNC_TEST_PATH, 'v2.3-unsync.mp3');
			const id3 = new ID3v2();
			const tag = await id3.read(filename);
			expect(tag?.head).toBeTruthy();
			if (!tag?.head) return;
			const file = tmp.fileSync();
			try {
				await fse.remove(file.name);
				await id3.write(file.name, tag, tag.head.ver, tag.head.rev, { keepBackup: false });
				const written = await id3.read(file.name);
				expect(written?.frames.length).toBe(tag.frames.length);
				for (const [i, frame] of tag.frames.entries()) {
					expect(written?.frames[i].id).toBe(frame.id);
					const origText = (frame.value as IID3V2.FrameValue.Text).text;
					if (origText !== undefined) {
						expect((written?.frames[i].value as IID3V2.FrameValue.Text).text).toBe(origText);
					}
				}
			} finally {
				file.removeCallback();
			}
		});

		it('writes v2.4-apic-unsync.mp3 back and reads same frame values', async () => {
			const filename = path.join(UNSYNC_TEST_PATH, 'v2.4-apic-unsync.mp3');
			const id3 = new ID3v2();
			const tag = await id3.read(filename);
			expect(tag?.head).toBeTruthy();
			if (!tag?.head) return;
			const file = tmp.fileSync();
			try {
				await fse.remove(file.name);
				await id3.write(file.name, tag, tag.head.ver, tag.head.rev, { keepBackup: false });
				const written = await id3.read(file.name);
				expect(written?.frames.length).toBe(tag.frames.length);
				for (const [i, frame] of tag.frames.entries()) {
					expect(written?.frames[i].id).toBe(frame.id);
				}
			} finally {
				file.removeCallback();
			}
		});
	});
});
