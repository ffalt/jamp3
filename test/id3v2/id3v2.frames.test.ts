import { BufferUtils } from '../../src/lib/common/buffer';
import { synchsafe, unsynchsafe } from '../../src/lib/common/utils';
import { ID3v2_ENCODINGS } from '../../src/lib/id3v2/id3v2.header.consts';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types';
import { ID3V2ValueTypes } from '../../src/lib/id3v2/id3v2.consts';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory';
import { BufferReader } from '../../src/lib/common/buffer-reader';
import { IFrameImpl } from '../../src/lib/id3v2/frames/id3v2.frame';
import { FrameIdAscii } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-ascii';
import { FrameIdBin } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-bin';
import { FrameText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.text';
import { FrameLangDescText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.lang-desc-text';
import { FramePic } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.pic';
import { FrameAscii } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.ascii';
import { FrameIdText } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.id-text';
import { FramePlayCount } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.playcount';
import { FrameMusicCDId } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.musiccdid';
import { FramePopularimeter } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.popularimeter';
import { FrameBooleanString } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.boolstring';
import { FrameUnknown } from '../../src/lib/id3v2/frames/implementations/id3v2.frame.unknown';

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
	const encodings = Object.keys(ID3v2_ENCODINGS[version]).map(key => ID3v2_ENCODINGS[version][key]);

	const ints = [0, 1, 42, 2_147_483_647, 2_147_483_648];

	const tagHead: IID3V2.TagHeader = {
		ver: 4,
		rev: 0,
		size: 0,
		valid: true
	};

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

	const pictureTypes: Array<{ key: number; name: string }> = Object.keys(ID3V2ValueTypes.pictureType)
		.map(key => ({ key: Number.parseInt(key, 10), name: ID3V2ValueTypes.pictureType[key] }));
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
	});
});
