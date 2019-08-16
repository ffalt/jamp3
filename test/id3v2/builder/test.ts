import {expect} from 'chai';
import {describe, it, run} from 'mocha';
import fse from 'fs-extra';
import tmp from 'tmp';

import {ID3v2} from '../../../src/lib/id3v2/id3v2';
import {ID3V24TagBuilder} from '../../../src/lib/id3v2/id3v2_builder24';

async function fill24Builder(builder: ID3V24TagBuilder): Promise<void> {
	const testNumber = 5;
	const testString = 'dfdf';
	const testLanguage = 'xYz';
	const testBuffer = Buffer.alloc(10, 0);
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
		.eventTimingCodes(testNumber, [{type: testNumber, timestamp: testNumber}])
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
		.productionNotice(testString)
		.relativeVolumeAdjustment(
			testString,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber,
			testNumber, testNumber
		)
		.relativeVolumeAdjustment2(testString, [{type: testNumber, adjustment: testNumber, peak: testNumber}])
		.releaseDate(testString)
		.remixer(testString)
		.replayGainAdjustment(testNumber, testNumber, testNumber)
		.script(testString)
		.subtitle(testString)
		.synchronisedLyrics(testString, testLanguage, testNumber, testNumber, [{timestamp: testNumber, text: testString}])
		.taggingDate(testString)
		.termsOfUse(testString, testLanguage, testString)
		.title(testString)
		.titleSort(testString)
		.track(testNumber, testNumber)
		.trackLength(testNumber)
		.uniqueFileID(testString, testString)
		.unknown('___', testBuffer)
		.url(testString, testString)
		.website(testString)
		.work(testString)
		.writer(testString);
}

async function test24Builder(encoding: string): Promise<void> {
	const builder = new ID3V24TagBuilder(encoding);
	await fill24Builder(builder);
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		const id3 = new ID3v2();
		await id3.writeBuilder(file.name, builder, {keepBackup: false, paddingSize: 0});
		const data = id3.read(file.name);
		console.log(data);
	} catch (e) {
		file.removeCallback();
		return Promise.reject(e);
	}
	file.removeCallback();
}

describe('ID3v24Builder', async () => {

	describe('encodings', async () => {
		for (const testValue of ['iso-8859-1', 'ucs2', 'utf16-be', 'utf8']) {
			it(testValue, async () => {
				await test24Builder(testValue);
			});
		}
	});

	setTimeout(() => {
		run(); // https://github.com/mochajs/mocha/issues/2221#issuecomment-214636042
	});
});
/*
import {expect, use} from 'chai';
import {describe, it, run} from 'mocha';
import chaiExclude from 'chai-exclude';
import 'mocha';
import {ID3v2, ID3V24TagBuilder} from '../../src';

use(chaiExclude);

describe('ID3v24Builder', async () => {

	describe('encodings', async () => {
		for (const testValue of ['iso-8859-1', 'ucs2', 'utf16-be', 'utf8']) {
			it(testValue, async () => {
				// await test24Builder(testValue);
			});
		}
	});

	run(); // https://github.com/mochajs/mocha/issues/2221#issuecomment-214636042
});
*/