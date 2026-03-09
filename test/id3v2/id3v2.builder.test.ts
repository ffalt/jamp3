import fse from 'fs-extra';
import tmp from 'tmp';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { ID3V24TagBuilder } from '../../src/lib/id3v2/id3v2.builder.v24';
import { Id3v2RawWriter } from '../../src/lib/id3v2/id3v2.writer.raw';
import { MemoryWriterStream } from '../../src/lib/common/stream-writer-memory';

const testNumber = 5;
const testString = 'räksmörgåsЪЭЯ😀';
const testLanguage = 'xYz';
const testGUID = '00000000-0000-0000-0000-000000000000';
const testBuffer = Buffer.alloc(10, 0);

async function fill24Builder(builder: ID3V24TagBuilder): Promise<void> {
	builder
		.acoustidFingerprint(testString)
		.acoustidID(testString)
		.album(testString)
		.albumSort(testString)
		.albumArtist(testString)
		.albumArtistSort(testString)
		.artist(testString)
		.artistSort(testString)
		.artists(testString)
		.asin(testString)
		.audioEncryption(testString, testNumber, testNumber, testBuffer)
		.barcode(testString)
		.bpm(testString)
		.catalogNumber(testString)
		.chapter(testString, testNumber, testNumber, testNumber, testNumber, [])
		.chapterTOC(testString, testString, true, true, [testString, testString])
		.comment(testString, testString)
		.commercialInformationURL(testString)
		.composer(testString)
		.composerSort(testString)
		.conductor(testString)
		.copyright(testString)
		.copyrightURL(testString)
		.custom(testString, testString)
		.date(testString)
		.disc(testNumber, testNumber)
		.discSubtitle(testString)
		.encoder(testString)
		.encoderSettings(testString)
		.encodingDate(testString)
		.eventTimingCodes(testNumber, [{ type: testNumber, timestamp: testNumber }])
		.fileOwner(testString)
		.fileType(testString)
		.genre(testString)
		.grouping(testString)
		.initialKey(testString)
		.internetRadioStation(testString)
		.internetRadioStationOwner(testString)
		.involved(testString, testString)
		.isCompilation(true)
		.isPodcast(true)
		.isrc(testString)
		.label(testString)
		.labelURL(testString)
		.language(testString)
		.license(testString)
		.linkedInformation(testString, testString, [testString, testString])
		.lyricist(testString)
		.lyrics(testString, testLanguage, testString)
		.mbAlbumArtistID(testString)
		.mbAlbumID(testString)
		.mbAlbumReleaseCountry(testString)
		.mbAlbumStatus(testString)
		.mbAlbumType(testString)
		.mbArtistID(testString)
		.mbDiscID(testString)
		.mbOriginalAlbumID(testString)
		.mbOriginalArtistID(testString)
		.mbReleaseGroupID(testString)
		.mbReleaseTrackID(testString)
		.mbTrackDisambiguation(testString)
		.mbTrackID(testString)
		.mbTRMID(testString)
		.mbWorkID(testString)
		.mediaType(testString)
		.mood(testString)
		.movement(testString)
		.movementNr(testNumber, testNumber)
		.musicianCredit(testString, testString)
		.musicIPPUID(testString)
		.object(testString, testString, testString, testBuffer)
		.officialArtistURL(testString)
		.officialAudioFileURL(testString)
		.officialAudioSourceURL(testString)
		.officialInternetRadioStationURL(testString)
		.originalAlbum(testString)
		.originalArtist(testString)
		.originalDate(testString)
		.originalFilename(testString)
		.originalLyricist(testString)
		.paymentURL(testString)
		.picture(testNumber, testString, testString, testBuffer)
		.playCount(testNumber)
		.playlistDelay(testString)
		.podcastDescription(testString)
		.podcastFeedURL(testString)
		.podcastKeywords(testString)
		.podcastURL(testString)
		.popularimeter(testString, testNumber, testNumber)
		.priv(testString, testBuffer)
		.averageLevel(testNumber)
		.peakValue(testNumber)
		.wmMediaClassPrimaryID(testGUID)
		.wmMediaClassSecondaryID(testGUID)
		.wmProvider(testString)
		.wmUniqueFileIdentifier(testString)
		.wmMood(testString)
		.productionNotice(testString)
		.relativeVolumeAdjustment(
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber
		)
		.relativeVolumeAdjustment2(testString, [{ type: testNumber, adjustment: testNumber, peak: testNumber }])
		.releaseDate(testString)
		.remixer(testString)
		.replayGainAdjustment(testNumber, testNumber, testNumber)
		.script(testString)
		.subtitle(testString)
		.synchronisedLyrics(testString, testLanguage, testNumber, testNumber, [{ timestamp: testNumber, text: testString }])
		.taggingDate(testString)
		.termsOfUse(testString, testLanguage, testString)
		.title(testString)
		.titleSort(testString)
		.track(testNumber, testNumber)
		.trackLength(testNumber)
		.uniqueFileID(testString, testString)
		.unknown('TTTT', testBuffer)
		.url(testString, testString)
		.website(testString)
		.work(testString)
		.writer(testString);
}

async function test24Builder(encoding: string): Promise<void> {
	const builder = new ID3V24TagBuilder(encoding);
	await fill24Builder(builder);
	const warnings = ID3v2.check(builder.buildTag());
	expect(warnings.length).toBe(0);
}

async function test24BuilderWrite(encoding: string): Promise<void> {
	const builder = new ID3V24TagBuilder(encoding);
	await fill24Builder(builder);
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		const id3 = new ID3v2();
		await id3.writeBuilder(file.name, builder, { keepBackup: false, paddingSize: 0 });
		const frames = builder.buildFrames();
		const data = await id3.read(file.name);
		expect(data).toBeTruthy();
		if (!data) {
			file.removeCallback();
			return;
		}
		expect(data.frames.length).toBe(frames.length);
		const warnings = ID3v2.check(data);
		expect(warnings.length).toBe(0);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}

async function test24BuilderWriteWithFooter(): Promise<void> {
	const builder = new ID3V24TagBuilder('utf8');
	builder.title('Test Title').artist('Test Artist');
	const frames = builder.buildFrames();
	const tag = builder.buildTag();
	tag.head = { ver: 4, rev: 0, size: 0, valid: true, v4: { flags: { footer: true } } };

	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		const id3 = new ID3v2();
		await id3.write(file.name, tag, 4, 0, { keepBackup: false, paddingSize: 0 });

		// verify written bytes: footer marker "3DI" must appear at end of tag
		const raw = await id3.readRaw(file.name);
		expect(raw).toBeTruthy();
		if (!raw) return;
		expect(raw.slice(-10).toString('ascii', 0, 3)).toBe('3DI');

		// verify round-trip: reader must parse tag correctly with footer
		const data = await id3.read(file.name);
		expect(data).toBeTruthy();
		if (!data) return;
		expect(data.frames.length).toBe(frames.length);
		expect(data.head?.v4?.flags.footer).toBe(true);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}

async function test24FooterRawBytes(): Promise<void> {
	// Verify the exact footer bytes written by Id3v2RawWriter
	const head = { ver: 4, rev: 0, size: 0, valid: true, v4: { flags: { footer: true } } };

	const memStream = new MemoryWriterStream();
	const writer = new Id3v2RawWriter(memStream, head, { paddingSize: 0 }, []);
	await writer.write();
	const buf = memStream.toBuffer();

	// total = 10 header + 0 frames + 10 footer (no padding allowed with footer)
	expect(buf.length).toBe(20);
	// header starts with "ID3"
	expect(buf.slice(0, 3).toString('ascii')).toBe('ID3');
	// footer starts with "3DI"
	expect(buf.slice(10, 13).toString('ascii')).toBe('3DI');
	// footer must be a copy of header: version, flags, and size must match
	expect(buf[3]).toBe(buf[13]); // ver
	expect(buf[4]).toBe(buf[14]); // rev
	expect(buf[5]).toBe(buf[15]); // flags
	expect(buf.slice(6, 10).equals(buf.slice(16, 20))).toBe(true); // size
}

async function test24FooterPaddingIgnored(): Promise<void> {
	// When footer is set, padding must be suppressed
	const head = { ver: 4, rev: 0, size: 0, valid: true, v4: { flags: { footer: true } } };

	const memStream = new MemoryWriterStream();
	const writer = new Id3v2RawWriter(memStream, head, { paddingSize: 500 }, []);
	await writer.write();
	const buf = memStream.toBuffer();

	// Still 20 bytes: footer replaces padding
	expect(buf.length).toBe(20);
	expect(buf.slice(10, 13).toString('ascii')).toBe('3DI');
}

describe('Builder', () => {
	describe('v2.4', () => {
		describe.each(['iso-8859-1', 'ucs2', 'utf16-be', 'utf8'])('%s', testValue => {
			it('should be valid', async () => {
				await test24Builder(testValue);
			});
			it('should write', async () => {
				await test24BuilderWrite(testValue);
			});
		});
		it('should write and read footer', async () => {
			await test24BuilderWriteWithFooter();
		});
		it('should write correct footer bytes', async () => {
			await test24FooterRawBytes();
		});
		it('should suppress padding when footer is set', async () => {
			await test24FooterPaddingIgnored();
		});
	});
});
