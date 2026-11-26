import { BufferUtils } from '../../src/lib/common/buffer.js';
import { synchsafe, unsynchsafe } from '../../src/lib/common/utils.js';
import { ID3v2_ENCODINGS } from '../../src/lib/id3v2/id3v2.header.consts.js';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { ID3V2ValueTypes } from '../../src/lib/id3v2/id3v2.consts.js';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory.js';
import { BufferReader } from '../../src/lib/common/buffer-reader.js';
import { IFrameImpl } from '../../src/lib/id3v2/frames/id3v2.frame.js';
import { FrameIdAscii } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-ascii.js';
import { FrameIdBin } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-bin.js';
import { FrameText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.text.js';
import { FrameLangDescText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.lang-desc-text.js';
import { FramePic } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.pic.js';
import { FrameAscii } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.ascii.js';
import { FrameIdText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-text.js';
import { FrameLINK } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.linked-info.js';
import { FramePlayCount } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.playcount.js';
import { FrameMusicCDId } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.musiccdid.js';
import { FramePopularimeter } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.popularimeter.js';
import { FrameBooleanString } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.boolstring.js';
import { FrameUnknown } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.unknown.js';
import { readID3v2Frame } from '../../src/lib/id3v2/frames/id3v2.frame.read.js';
import { describe, expect, it } from '@jest/globals';

describe('SyncSaveInt', () => {
	it('should calculate back & forth', () => {
		expect(unsynchsafe(synchsafe(0))).toBe(0);
		expect(unsynchsafe(synchsafe(265))).toBe(265);
		expect(unsynchsafe(synchsafe(268_435_455))).toBe(268_435_455); // max size
		expect(unsynchsafe(synchsafe(268_435_456))).toBe(0); // overflow
	});
});

async function writebackandforth(value: IFrameImpl, testObject: { encoding?: string; value: IID3V2.FrameValue.Base }, head: IID3V2.TagHeader): Promise<any> {
	const stream = new MemoryWriterStream();
	const frame: IID3V2.Frame = { id: 'test', value: testObject.value, head: { size: 0, statusFlags: {}, formatFlags: {}, encoding: testObject.encoding ?? undefined } };
	await value.write(frame, stream, head);
	const reader = new BufferReader(stream.toBuffer());
	const result = await value.parse(reader, { id: 'test', start: 0, end: 0, size: 0, statusFlags: {}, formatFlags: {}, data: stream.toBuffer() }, head);
	expect(result).toBeTruthy();
	if (!result) {
		return;
	}
	expect(result.value).toBeTruthy();
	return { head: { encoding: result.encoding ? result.encoding.name : undefined }, value: result.value };
}

describe('ID3v2Frames', () => {
	const version = 4;
	const testValues = [
		'012345abcdefghijklmnopqrstuvwxyz67890',
		'äöüé',
		''
	];
	const encodings = Object.values(ID3v2_ENCODINGS[version]).map(value => value);

	const ints = [0, 1, 42, 2_147_483_647, 2_147_483_648];

	const tagHead: IID3V2.TagHeader = {
		ver: 4,
		rev: 0,
		size: 0,
		valid: true
	};

	describe('BinaryEncodingMarker', () => {
		// unknown and MCDI frames report encoding 'binary'; if such a frame is later written
		// through a text implementation the marker must not mangle the text
		it.each(testValues)('writes a text frame marked with the binary encoding readably: %s', async testValue => {
			const value: IID3V2.FrameValue.Text = { text: testValue };
			const result = await writebackandforth(FrameText, { encoding: 'binary', value }, tagHead);
			expect(result.value.text).toBe(testValue);
		});
	});

	describe('AsciiValue', () => {
		it.each(testValues)('should write back & forth: %s', async testValue => {
			const value: IID3V2.FrameValue.Ascii = { text: testValue };
			const result = await writebackandforth(FrameAscii, { value }, tagHead);
			expect(result.value.text).toBe(value.text);
		});
	});

	describe('Text', () => {
		describe.each(encodings)('Encoding: %s', enc => {
			it.each(testValues)('should write back & forth: %o', async testValue => {
				const value: IID3V2.FrameValue.Text = { text: testValue };
				const result = await writebackandforth(FrameText, { encoding: enc, value }, tagHead);
				expect(result.value.text).toBe(testValue);
				expect(result.head.encoding).toBe(enc);
			});
		});
	});

	describe('IdText', () => {
		describe.each(encodings)('Encoding: %s', enc => {
			it.each(testValues)('should write back & forth: %o', async testValue => {
				const value: IID3V2.FrameValue.IdText = { id: '1234567890a', text: testValue };
				const result = await writebackandforth(FrameIdText, { encoding: enc, value }, tagHead);
				expect(result.head.encoding).toBe(enc);
				expect(result.value.text).toBe(value.text);
				expect(result.value.id).toBe(value.id);
			});
		});
	});

	describe('IdAscii', () => {
		it.each(testValues)('should write back & forth: %o', async testValue => {
			const value: IID3V2.FrameValue.IdAscii = { id: '1234567890a', text: testValue };
			const result = await writebackandforth(FrameIdAscii, { value }, tagHead);
			expect(result.value.text).toBe(value.text);
			expect(result.value.id).toBe(value.id);
		});
	});

	describe('LinkedInformation', () => {
		it('should write back & forth', async () => {
			const value: IID3V2.FrameValue.LinkedInfo = { id: 'TIT2', url: 'https://example.com/file.mp3', additional: ['eng', 'desc'] };
			const result = await writebackandforth(FrameLINK, { value }, tagHead);
			expect(result.value.id).toBe(value.id);
			expect(result.value.url).toBe(value.url);
			expect(result.value.additional).toEqual(value.additional);
		});
		it('should recover a short id without swallowing the first URL character', async () => {
			// malformed real-world tag (v2.3) with a 3-byte id: "WCOhttps://..."
			const reader = new BufferReader(Buffer.from('WCOhttps://example.com/\u{0}', 'latin1'));
			const result = await FrameLINK.parse(reader, { id: 'LINK', start: 0, end: 0, size: 0, statusFlags: {}, formatFlags: {}, data: BufferUtils.zeroBuffer(0) }, tagHead);
			const value = result.value as IID3V2.FrameValue.LinkedInfo;
			expect(value.id).toBe('WCO');
			expect(value.url).toBe('https://example.com/');
			expect(value.additional).toEqual([]);
		});
		it('should write the frame identifier before the URL per spec', async () => {
			const stream = new MemoryWriterStream();
			const frame: IID3V2.Frame = {
				id: 'LINK',
				value: { id: 'TIT2', url: 'https://example.com/', additional: [] } as IID3V2.FrameValue.LinkedInfo,
				head: { size: 0, statusFlags: {}, formatFlags: {} }
			};
			await FrameLINK.write(frame, stream, tagHead);
			const buf = stream.toBuffer();
			// per ID3v2.3/4 spec: Frame identifier $xx xx xx xx, then terminated URL
			expect(buf.subarray(0, 4).toString('ascii')).toBe('TIT2');
			expect(buf.subarray(4, 5).toString('ascii')).toBe('h');
			expect(buf.at(-1)).toBe(0); // url terminator
			expect(buf.length).toBe(4 + 'https://example.com/'.length + 1);
		});
	});

	describe('LangDescText', () => {
		describe.each(encodings)('Encoding: %s', enc => {
			it.each(testValues)('should write back & forth: %o', async testValue => {
				const value: IID3V2.FrameValue.LangDescText = {
					id: 'sfdsfaglajegoeirjgoergere',
					language: 'eng',
					text: testValue
				};
				const result = await writebackandforth(FrameLangDescText, { value, encoding: enc }, tagHead);
				expect(result.head.encoding).toBe(enc);
				expect(result.value.text).toBe(value.text);
				expect(result.value.language).toBe(value.language);
				expect(result.value.id).toBe(value.id);
			});
		});
	});

	describe('MultiValues', () => {
		const multiValues = ['first', 'äöüé', '012345abcdefghijklmnopqrstuvwxyz67890'];

		describe.each(encodings)('Encoding: %s', enc => {
			it('should keep all values of a Text frame', async () => {
				const value: IID3V2.FrameValue.Text = { text: multiValues[0], list: multiValues };
				const result = await writebackandforth(FrameText, { encoding: enc, value }, tagHead);
				expect(result.value.list).toEqual(multiValues);
				expect(result.value.text).toBe(multiValues.join('\n'));
			});

			it('should keep all values of an IdText frame', async () => {
				const value: IID3V2.FrameValue.IdText = { id: 'description', text: multiValues[0], list: multiValues };
				const result = await writebackandforth(FrameIdText, { encoding: enc, value }, tagHead);
				expect(result.value.id).toBe(value.id);
				expect(result.value.list).toEqual(multiValues);
				expect(result.value.text).toBe(multiValues.join('\n'));
			});

			it('should keep all values of a LangDescText frame', async () => {
				const value: IID3V2.FrameValue.LangDescText = { id: 'description', language: 'eng', text: multiValues[0], list: multiValues };
				const result = await writebackandforth(FrameLangDescText, { encoding: enc, value }, tagHead);
				expect(result.value.id).toBe(value.id);
				expect(result.value.language).toBe(value.language);
				expect(result.value.list).toEqual(multiValues);
				expect(result.value.text).toBe(multiValues.join('\n'));
			});

			it('should not add a list for a single value', async () => {
				const value: IID3V2.FrameValue.IdText = { id: 'description', text: multiValues[0] };
				const result = await writebackandforth(FrameIdText, { encoding: enc, value }, tagHead);
				expect(result.value.list).toBeUndefined();
				expect(result.value.text).toBe(multiValues[0]);
			});
		});
	});

	describe('MusicCDId', () => {
		it.each(testValues)('should write back & forth: %o', async testValue => {
			const value: IID3V2.FrameValue.Bin = { bin: BufferUtils.fromString(testValue) };
			const result = await writebackandforth(FrameMusicCDId, { value }, tagHead);
			expect(result.value.bin.length).toBe(value.bin.length);
			expect(BufferUtils.compareBuffer(value.bin, result.value.bin)).toBe(true); // 'Binary not equal ' + value);
		});
	});

	describe('IdBin', () => {
		it.each(testValues)('should write back & forth: %o', async testValue => {
			const value: IID3V2.FrameValue.IdBin = { id: 'öösldfösfsfd', bin: BufferUtils.fromString(testValue) };
			const result = await writebackandforth(FrameIdBin, { value }, tagHead);
			expect(result.value.id).toBe(value.id);
			expect(result.value.bin.length).toBe(value.bin.length);
			expect(BufferUtils.compareBuffer(value.bin, result.value.bin)).toBe(true);
		});
	});

	describe('Popularimeter', () => {
		describe.each(ints)('Count %i', testValue => {
			it.each([0, 10, 254])('should write rating back & forth: %i', async rating => {
				const value: IID3V2.FrameValue.Popularimeter = { email: 'öösldfösfsfd', rating: rating, count: testValue };
				const result = await writebackandforth(FramePopularimeter, { value }, tagHead);
				expect(result.value.email).toBe(value.email);
				expect(result.value.rating).toBe(value.rating);
				expect(result.value.count).toBe(value.count);
			});
		});
	});

	describe('PartOfCompilation', () => {
		describe.each(encodings)('Encoding: %s', encoding => {
			describe.each([false, true])('Boolean %s', testValue => {
				it(`should write back & forth: ${testValue}`, async () => {
					const value: IID3V2.FrameValue.Bool = { bool: testValue };
					const result = await writebackandforth(FrameBooleanString, { value, encoding }, tagHead);
					expect(result.head.encoding).toBe(encoding);
					expect(result.value.bool).toBe(value.bool);
				});
			});
		});
	});

	describe('Unknown', () => {
		it.each(testValues)('should write back & forth: %o', async testValue => {
			const value: IID3V2.FrameValue.Bin = { bin: BufferUtils.fromString(testValue) };
			const result = await writebackandforth(FrameUnknown, { value }, tagHead);
			expect(result.value.bin.length).toBe(value.bin.length);
			expect(BufferUtils.compareBuffer(value.bin, result.value.bin)).toBe(true);
		});
	});

	describe('PlayCounter', () => {
		it.each(ints)('should write back & forth: %i', async testValue => {
			const value: IID3V2.FrameValue.Number = { num: testValue };
			const result = await writebackandforth(FramePlayCount, { value }, tagHead);
			expect(result.value.num).toBe(value.num);
		});
	});

	const pictureTypes: Array<{ key: number; name: string }> = Object.entries(ID3V2ValueTypes.pictureType)
		.map(([key, name]) => ({ key: Number.parseInt(key, 10), name }));
	describe('Pic', () => {
		describe.each(encodings)('Encoding: %s', enc => {
			describe.each(pictureTypes)('PicType: %o', pictureType => {
				it.each(testValues)('should write back & forth: %o', async testValue => {
					const testObject = {
						value: {
							description: testValue,
							mimeType: 'this/that',
							pictureType: pictureType.key,
							bin: BufferUtils.fromString(testValue)
						},
						encoding: enc
					};
					const result = await writebackandforth(FramePic, testObject as any, tagHead);
					expect(result.value.description).toBe(testObject.value.description);
					expect(result.value.mimeType).toBe(testObject.value.mimeType);
					expect(result.value.pictureType).toBe(testObject.value.pictureType);
					expect(result.head.encoding).toBe(testObject.encoding);
				});
			});
		});
		describe.each(encodings)('Encoding: %s', enc => {
			it('should write back & forth a url-based picture', async () => {
				const testObject = {
					value: {
						description: 'my description',
						mimeType: 'this/that',
						pictureType: 3,
						url: 'https://example.com/cover.jpg'
					},
					encoding: enc
				};
				const result = await writebackandforth(FramePic, testObject as any, tagHead);
				expect(result.value.description).toBe(testObject.value.description);
				expect(result.value.mimeType).toBe('-->');
				expect(result.value.url).toBe(testObject.value.url);
				expect(result.value.bin).toBeUndefined();
				expect(result.value.pictureType).toBe(testObject.value.pictureType);
				expect(result.head.encoding).toBe(testObject.encoding);
			});
		});
	});
});

describe('TruncatedFrames', () => {
	const tagHead: IID3V2.TagHeader = { ver: 4, rev: 0, size: 0, valid: true };

	function rawFrame(id: string, data: Buffer): IID3V2.RawFrame {
		return { id, start: 0, end: 0, size: data.length, data, statusFlags: {}, formatFlags: {} };
	}

	it('flags a POPM missing its rating byte and keeps the original bytes', async () => {
		const data = Buffer.concat([Buffer.from('a@b.c', 'ascii'), Buffer.from([0])]);
		const frame = await readID3v2Frame(rawFrame('POPM', data), tagHead);
		expect(frame.invalid).toBeTruthy();
		expect((frame.value as IID3V2.FrameValue.Bin).bin).toEqual(data);
	});

	it('still parses a complete POPM', async () => {
		const data = Buffer.concat([Buffer.from('a@b.c', 'ascii'), Buffer.from([0, 200, 0, 0, 0, 7])]);
		const frame = await readID3v2Frame(rawFrame('POPM', data), tagHead);
		expect(frame.invalid).toBeFalsy();
		const value = frame.value as IID3V2.FrameValue.Popularimeter;
		expect(value.rating).toBe(200);
		expect(value.count).toBe(7);
	});

	it('flags an APIC missing its picture type byte', async () => {
		const data = Buffer.concat([Buffer.from([0]), Buffer.from('image/png', 'ascii'), Buffer.from([0])]);
		const frame = await readID3v2Frame(rawFrame('APIC', data), tagHead);
		expect(frame.invalid).toBeTruthy();
	});
});
