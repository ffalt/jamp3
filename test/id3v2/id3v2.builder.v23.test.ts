import fse from 'fs-extra';
import tmp from 'tmp';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { ID3V23TagBuilder } from '../../src/lib/id3v2/id3v2.builder.v23';

const testNumber = 5;
const testString = 'räksmörgåsЪЭЯ😀';
const testLanguage = 'xYz';
const testBuffer = Buffer.alloc(10, 0);

async function fill23Builder(builder: ID3V23TagBuilder): Promise<void> {
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
		.encoder(testString)
		.encoderSettings(testString)
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
		.popularimeter(testString, testNumber, testNumber)
		.priv(testString, testBuffer)
		.relativeVolumeAdjustment(
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber
		)
		.remixer(testString)
		.script(testString)
		.subtitle(testString)
		.synchronisedLyrics(testString, testLanguage, testNumber, testNumber, [{ timestamp: testNumber, text: testString }])
		.termsOfUse(testString, testLanguage, testString)
		.title(testString)
		.titleSort(testString)
		.track(testNumber, testNumber)
		.trackLength(testNumber)
		.uniqueFileID(testString, testString)
		.unknown('TTTT', testBuffer)
		.url(testString, testString)
		.website(testString)
		.writer(testString);
}

async function test23Builder(encoding: string): Promise<void> {
	const builder = new ID3V23TagBuilder(encoding);
	await fill23Builder(builder);
	const warnings = ID3v2.check(builder.buildTag());
	expect(warnings.length).toBe(0);
}

async function test23BuilderWrite(encoding: string): Promise<void> {
	const builder = new ID3V23TagBuilder(encoding);
	await fill23Builder(builder);
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
		expect(data.head?.ver).toBe(3);
		// Ensure written frames are v2.3-conformant: no utf8 encodings and only allowed encodings present
		const allowedEncodings = ['iso-8859-1', 'ucs2'];
		for (const frame of data.frames) {
			const enc = frame.head?.encoding;
			if (enc !== undefined) {
				expect(allowedEncodings).toContain(enc);
			}
		}
		// Ensure v2.3-specific frame IDs are present and v2.4-only IDs are absent
		const ids = data.frames.map(f => f.id);
		expect(ids).toContain('TYER');
		expect(ids).toContain('IPLS');
		expect(ids).not.toContain('TDRC');
		const warnings = ID3v2.check(data);
		expect(warnings.length).toBe(0);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}

describe('Builder', () => {
	describe('v2.3', () => {
		describe.each(['iso-8859-1', 'ucs2', 'utf16-be'])('%s', testValue => {
			it('should be valid', async () => {
				await test23Builder(testValue);
			});
			it('should write', async () => {
				await test23BuilderWrite(testValue);
			});
		});
	});
});
