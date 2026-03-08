import fse from 'fs-extra';
import tmp from 'tmp';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { ID3V24TagBuilder } from '../../src/lib/id3v2/id3v2.builder.v24';
import { ID3V23TagBuilder } from '../../src/lib/id3v2/id3v2.builder.v23';

const testString = 'räksmörgåsЪЭЯ😀';
const testString2 = 'another value';
const testLanguage = 'eng';
const testBuffer = Buffer.alloc(10, 1);
const testBuffer2 = Buffer.alloc(10, 2);
const testNumber = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function framesFor(builder: ID3V24TagBuilder | ID3V23TagBuilder, id: string) {
	return builder.buildFrames().filter(f => f.id === id);
}

async function writeAndRead(builder: ID3V24TagBuilder | ID3V23TagBuilder) {
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		const id3 = new ID3v2();
		await id3.writeBuilder(file.name, builder, { keepBackup: false, paddingSize: 0 });
		const tag = await id3.read(file.name);
		file.removeCallback();
		return tag;
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
}

// ---------------------------------------------------------------------------
// loadTag
// ---------------------------------------------------------------------------

describe('Builder loadTag', () => {
	it('preserves all frames from the source tag', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.title(testString).artist(testString).picture(3, 'cover', 'image/jpeg', testBuffer);
		const srcTag = src.buildTag();

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(srcTag);

		expect(framesFor(dst, 'TIT2')).toHaveLength(1);
		expect(framesFor(dst, 'TPE1')).toHaveLength(1);
		expect(framesFor(dst, 'APIC')).toHaveLength(1);
	});

	it('returns this for chaining', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.title(testString);
		const builder = new ID3V24TagBuilder('utf8');
		expect(builder.loadTag(src.buildTag())).toBe(builder);
	});

	it('replaces single-value frame (title) when setter is called after loadTag', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.title('old title');

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag()).title('new title');

		const frames = framesFor(dst, 'TIT2');
		expect(frames).toHaveLength(1);
		expect((frames[0].value as any).text).toBe('new title');
	});

	it('appends to multi-value frame (picture) when setter is called after loadTag', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.picture(3, 'old', 'image/jpeg', testBuffer);

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag()).picture(3, 'new', 'image/png', testBuffer2);

		expect(framesFor(dst, 'APIC')).toHaveLength(2);
	});

	it('replaces TXXX frame with same id (addIDFrame semantics)', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.custom('MyKey', 'old value');

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag()).custom('MyKey', 'new value');

		const frames = framesFor(dst, 'TXXX').filter(f => (f.value as any).id === 'MyKey');
		expect(frames).toHaveLength(1);
		expect((frames[0].value as any).text).toBe('new value');
	});

	it('works with v2.3 builder', () => {
		const src = new ID3V23TagBuilder('ucs2');
		src.title(testString).artist(testString);
		const srcTag = src.buildTag();

		const dst = new ID3V23TagBuilder('ucs2');
		dst.loadTag(srcTag).title('updated');

		const frames = framesFor(dst, 'TIT2');
		expect(frames).toHaveLength(1);
		expect((frames[0].value as any).text).toBe('updated');
	});

	it('round-trips through write/read/loadTag', async () => {
		// Write initial tag
		const builder1 = new ID3V24TagBuilder('utf8');
		builder1.title('original').artist('artist').picture(3, '', 'image/jpeg', testBuffer);
		const tag1 = await writeAndRead(builder1);
		expect(tag1).toBeTruthy();

		// Load into a new builder and update
		const builder2 = new ID3V24TagBuilder('utf8');
		builder2.loadTag(tag1!).title('updated');

		const tag2 = await writeAndRead(builder2);
		expect(tag2).toBeTruthy();

		const titleFrame = tag2!.frames.find(f => f.id === 'TIT2');
		expect((titleFrame?.value as any).text).toBe('updated');

		// artist and picture should survive the round-trip
		expect(tag2!.frames.some(f => f.id === 'TPE1')).toBe(true);
		expect(tag2!.frames.some(f => f.id === 'APIC')).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// clear methods — unit
// ---------------------------------------------------------------------------
function builderWithAll(): ID3V24TagBuilder {
	const b = new ID3V24TagBuilder('utf8');
	b
		.audioEncryption(testString, testNumber, testNumber, testBuffer)
		.comment(testString, testString)
		.custom(testString, testString)
		.eventTimingCodes(testNumber, [{ type: testNumber, timestamp: testNumber }])
		.linkedInformation(testString, testString, [testString])
		.lyrics(testString, testLanguage, testString)
		.object(testString, testString, testString, testBuffer)
		.picture(3, testString, 'image/jpeg', testBuffer)
		.popularimeter(testString, testNumber, testNumber)
		.priv(testString, testBuffer)
		.relativeVolumeAdjustment(testNumber, testNumber)
		.synchronisedLyrics(testString, testLanguage, testNumber, testNumber, [{ timestamp: testNumber, text: testString }])
		.termsOfUse(testString, testLanguage, testString)
		.uniqueFileID(testString, testString)
		.url(testString, testString)
		.chapter(testString, testNumber, testNumber, testNumber, testNumber)
		.chapterTOC(testString, testString, true, true, [testString])
		.relativeVolumeAdjustment2(testString, [{ type: testNumber, adjustment: testNumber }])
		.replayGainAdjustment(testNumber, testNumber, testNumber)
		.unknown('XXXX', testBuffer);
	return b;
}

describe('Builder clear methods', () => {
	const cases: Array<[string, string, (b: ID3V24TagBuilder) => ID3V24TagBuilder]> = [
		['clearAudioEncryption', 'AENC', b => b.clearAudioEncryption()],
		['clearComments', 'COMM', b => b.clearComments()],
		['clearCustom', 'TXXX', b => b.clearCustom()],
		['clearEventTimingCodes', 'ETCO', b => b.clearEventTimingCodes()],
		['clearLinkedInformation', 'LINK', b => b.clearLinkedInformation()],
		['clearLyrics', 'USLT', b => b.clearLyrics()],
		['clearObjects', 'GEOB', b => b.clearObjects()],
		['clearPictures', 'APIC', b => b.clearPictures()],
		['clearPopularimeters', 'POPM', b => b.clearPopularimeters()],
		['clearPriv', 'PRIV', b => b.clearPriv()],
		['clearRelativeVolumeAdjustment', 'RVAD', b => b.clearRelativeVolumeAdjustment()],
		['clearSynchronisedLyrics', 'SYLT', b => b.clearSynchronisedLyrics()],
		['clearTermsOfUse', 'USER', b => b.clearTermsOfUse()],
		['clearUniqueFileIDs', 'UFID', b => b.clearUniqueFileIDs()],
		['clearURLs', 'WXXX', b => b.clearURLs()],
		['clearChapters', 'CHAP', b => b.clearChapters()],
		['clearChapterTOCs', 'CTOC', b => b.clearChapterTOCs()],
		['clearRelativeVolumeAdjustment2', 'RVA2', b => b.clearRelativeVolumeAdjustment2()],
		['clearReplayGainAdjustment', 'RGAD', b => b.clearReplayGainAdjustment()]
	];

	it.each(cases)('%s removes %s frames', (_method, frameId, callClear) => {
		const b = builderWithAll();
		expect(framesFor(b, frameId).length).toBeGreaterThan(0);
		callClear(b);
		expect(framesFor(b, frameId)).toHaveLength(0);
	});

	it('clearUnknown removes the specific frame by id', () => {
		const b = builderWithAll();
		expect(framesFor(b, 'XXXX').length).toBeGreaterThan(0);
		b.clearUnknown('XXXX');
		expect(framesFor(b, 'XXXX')).toHaveLength(0);
	});

	it('clear methods return this for chaining', () => {
		const b = new ID3V24TagBuilder('utf8');
		expect(b.clearPictures()).toBe(b);
		expect(b.clearComments()).toBe(b);
		expect(b.clearChapters()).toBe(b);
	});

	it('clear on empty builder is a no-op', () => {
		const b = new ID3V24TagBuilder('utf8');
		expect(() => b.clearPictures().clearComments().clearLyrics()).not.toThrow();
		expect(b.buildFrames()).toHaveLength(0);
	});

	it('clear does not affect unrelated frames', () => {
		const b = new ID3V24TagBuilder('utf8');
		b.title(testString).picture(3, '', 'image/jpeg', testBuffer);

		b.clearPictures();

		expect(framesFor(b, 'TIT2')).toHaveLength(1);
		expect(framesFor(b, 'APIC')).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// clear + re-add (replace pattern)
// ---------------------------------------------------------------------------

describe('Builder clear + re-add', () => {
	it('replaces pictures via clearPictures + picture', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.picture(3, 'old', 'image/jpeg', testBuffer).picture(4, 'old2', 'image/jpeg', testBuffer);

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag())
			.clearPictures()
			.picture(3, 'new', 'image/png', testBuffer2);

		const pics = framesFor(dst, 'APIC');
		expect(pics).toHaveLength(1);
		expect((pics[0].value as any).description).toBe('new');
	});

	it('replaces comments via clearComments + comment', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.comment('id1', 'val1').comment('id2', 'val2');

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag())
			.clearComments()
			.comment('id1', 'new val');

		const comms = framesFor(dst, 'COMM');
		expect(comms).toHaveLength(1);
	});

	it('replaces lyrics via clearLyrics + lyrics', () => {
		const src = new ID3V24TagBuilder('utf8');
		src.lyrics('old lyrics', testLanguage, 'id1');

		const dst = new ID3V24TagBuilder('utf8');
		dst.loadTag(src.buildTag())
			.clearLyrics()
			.lyrics('new lyrics', testLanguage, 'id1');

		const lyricFrames = framesFor(dst, 'USLT');
		expect(lyricFrames).toHaveLength(1);
		expect((lyricFrames[0].value as any).text).toBe('new lyrics');
	});

	it('round-trips clear + re-add through write/read', async () => {
		// Write a tag with two pictures
		const builder1 = new ID3V24TagBuilder('utf8');
		builder1
			.title(testString)
			.picture(3, 'front', 'image/jpeg', testBuffer)
			.picture(4, 'back', 'image/jpeg', testBuffer);
		const tag1 = await writeAndRead(builder1);
		expect(tag1).toBeTruthy();
		expect(tag1!.frames.filter(f => f.id === 'APIC')).toHaveLength(2);

		// Load, replace pictures with a single new one, re-write
		const builder2 = new ID3V24TagBuilder('utf8');
		builder2
			.loadTag(tag1!)
			.clearPictures()
			.picture(3, 'new cover', 'image/png', testBuffer2);
		const tag2 = await writeAndRead(builder2);
		expect(tag2).toBeTruthy();

		const pics = tag2!.frames.filter(f => f.id === 'APIC');
		expect(pics).toHaveLength(1);
		expect((pics[0].value as any).description).toBe('new cover');

		// title should survive untouched
		const titleFrame = tag2!.frames.find(f => f.id === 'TIT2');
		expect((titleFrame?.value as any).text).toBe(testString);
	});

	it('v2.3 builder loadTag + clear + re-add round-trip', async () => {
		const builder1 = new ID3V23TagBuilder('ucs2');
		builder1
			.title(testString)
			.artist(testString2)
			.picture(3, 'original', 'image/jpeg', testBuffer);
		const tag1 = await writeAndRead(builder1);
		expect(tag1).toBeTruthy();

		const builder2 = new ID3V23TagBuilder('ucs2');
		builder2
			.loadTag(tag1!)
			.title('updated v2.3 title')
			.clearPictures()
			.picture(3, 'replaced', 'image/png', testBuffer2);
		const tag2 = await writeAndRead(builder2);
		expect(tag2).toBeTruthy();

		const titleFrame = tag2!.frames.find(f => f.id === 'TIT2');
		expect((titleFrame?.value as any).text).toBe('updated v2.3 title');

		const artistFrame = tag2!.frames.find(f => f.id === 'TPE1');
		expect((artistFrame?.value as any).text).toBe(testString2);

		const pics = tag2!.frames.filter(f => f.id === 'APIC');
		expect(pics).toHaveLength(1);
		expect((pics[0].value as any).description).toBe('replaced');
	});
});
