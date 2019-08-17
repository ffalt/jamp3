import {IID3V2} from './id3v2__types';
import {ID3V2RawBuilder} from './id3v2_builder';
import {ITagID} from '../common/types';

/**
 * Class for
 * - building a ID3v2.4.0 object
 *
 * Basic usage example:
 *
 * ```ts
 * [[include:snippet_id3v2-build.ts]]
 * ```
 */
export class ID3V24TagBuilder implements IID3V2.Builder {
	public static encodings = {
		iso88591: 'iso-8859-1',
		ucs2: 'ucs2',
		utf16be: 'utf16-be',
		utf8: 'utf8'
	};
	rawBuilder: ID3V2RawBuilder;

	constructor(encoding?: string) {
		this.rawBuilder = new ID3V2RawBuilder(encoding);
	}

	buildFrames(): Array<IID3V2.Frame> {
		const result: Array<IID3V2.Frame> = [];
		const frameValues = this.rawBuilder.build();
		Object.keys(frameValues).forEach(id => {
			const list = frameValues[id];
			for (const frame of list) {
				result.push(frame);
			}
		});
		return result;
	}

	version(): number {
		return 4;
	}

	rev(): number {
		return 0;
	}

	buildTag(): IID3V2.Tag {
		return {
			id: ITagID.ID3v2,
			head: {
				ver: 4,
				rev: 0,
				size: 0,
				valid: true
			},
			start: 0,
			end: 0,
			frames: this.buildFrames()
		};
	}

	//

	acoustidFingerprint(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'Acoustid Fingerprint', value);
		return this;
	}

	acoustidID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'Acoustid Id', value);
		return this;
	}

	album(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TALB', value);
		return this;
	}

	albumSort(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSOA', value);
		return this;
	}

	albumArtist(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TPE2', value);
		return this;
	}

	albumArtistSort(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSO2', value);
		return this;
	}

	artist(value?: string) {
		this.rawBuilder.text('TPE1', value);
		return this;
	}

	artistSort(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSOP', value);
		return this;
	}

	artists(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'Artists', value);
		return this;
	}

	asin(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'ASIN', value);
		return this;
	}

	audioEncryption(id: string, previewStart: number, previewLength: number, bin: Buffer) {
		this.rawBuilder.audioEncryption('AENC', id, previewStart, previewLength, bin);
		return this;
	}

	barcode(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'BARCODE', value);
		return this;
	}

	bpm(value?: string | number): ID3V24TagBuilder {
		this.rawBuilder.text('TBPM', value ? value.toString() : undefined);
		return this;
	}

	catalogNumber(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'CATALOGNUMBER', value);
		return this;
	}

	chapter(id: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): ID3V24TagBuilder {
		this.rawBuilder.chapter('CHAP', id, start, end, offset, offsetEnd, subframes);
		return this;
	}

	chapterTOC(value: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>): ID3V24TagBuilder {
		this.rawBuilder.chapterTOC('CTOC', id, ordered, topLevel, children);
		return this;
	}

	comment(id: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('COMM', id, value);
		return this;
	}

	commercialInformationURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WCOM', value);
		return this;
	}

	composer(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TCOM', value);
		return this;
	}

	composerSort(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSOC', value);
		return this;
	}

	conductor(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TPE3', value);
		return this;
	}

	copyright(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TCOP', value);
		return this;
	}

	copyrightURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WCOP', value);
		return this;
	}

	custom(id: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', id, value);
		return this;
	}

	date(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDRC', value);
		return this;
	}

	disc(discNr?: string | number, discTotal?: string | number): ID3V24TagBuilder {
		this.rawBuilder.nrAndTotal('TPOS', discNr, discTotal);
		return this;
	}

	discSubtitle(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSST', value);
		return this;
	}

	encoder(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TENC', value);
		return this;
	}

	encoderSettings(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSSE', value);
		return this;
	}

	encodingDate(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDEN', value);
		return this;
	}

	eventTimingCodes(timeStampFormat: number, events: Array<{ type: number; timestamp: number }>): ID3V24TagBuilder {
		this.rawBuilder.eventTimingCodes('ETCO', timeStampFormat, events);
		return this;
	}

	fileOwner(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TOWN', value);
		return this;
	}

	fileType(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TFLT', value);
		return this;
	}

	genre(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TCON', value);
		return this;
	}

	grouping(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TIT1', value);
		return this;
	}

	initialKey(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TKEY', value);
		return this;
	}

	internetRadioStation(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TRSN', value);
		return this;
	}

	internetRadioStationOwner(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TRSO', value);
		return this;
	}

	involved(group: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.keyTextList('TIPL', group, value);
		return this;
	}

	isCompilation(value?: boolean | number | string): ID3V24TagBuilder {
		if (value !== undefined) {
			this.rawBuilder.bool('TCMP', value === 1 || value === 'true' || value === true);
		}
		return this;
	}

	isPodcast(value?: boolean | number | string): ID3V24TagBuilder {
		if (value !== undefined) {
			this.rawBuilder.number('PCST', value === 1 || value === 'true' || value === true ? 1 : 0);
		}
		return this;
	}

	isrc(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSRC', value);
		return this;
	}

	label(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TPUB', value);
		return this;
	}

	labelURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WPUB', value);
		return this;
	}

	language(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TLAN', value);
		return this;
	}

	license(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'LICENSE', value);
		return this;
	}

	linkedInformation(id: string, url: string, additional: Array<string>) {
		this.rawBuilder.linkedInformation('LINK', id, url, additional);
		return this;
	}

	lyricist(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TEXT', value);
		return this;
	}

	lyrics(value?: string, language?: string, id?: string): ID3V24TagBuilder {
		this.rawBuilder.idLangText('USLT', value, language, id);
		return this;
	}

	mbAlbumArtistID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Artist Id', value);
		return this;
	}

	mbAlbumID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Id', value);
		return this;
	}

	mbAlbumReleaseCountry(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Release Country', value);
		return this;
	}

	mbAlbumStatus(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Status', value);
		return this;
	}

	mbAlbumType(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Type', value);
		return this;
	}

	mbArtistID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Artist Id', value);
		return this;
	}

	mbDiscID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Disc Id', value);
		return this;
	}

	mbOriginalAlbumID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Original Album Id', value);
		return this;
	}

	mbOriginalArtistID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Original Artist Id', value);
		return this;
	}

	mbReleaseGroupID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Release Group Id', value);
		return this;
	}

	mbReleaseTrackID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Release Track Id', value);
		return this;
	}

	mbTrackDisambiguation(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
		return this;
	}

	mbTrackID(value?: string): ID3V24TagBuilder {
		return this.uniqueFileID('http://musicbrainz.org', value);
	}

	mbTRMID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz TRM Id', value);
		return this;
	}

	mbWorkID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Work Id', value);
		return this;
	}

	mediaType(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TMED', value);
		return this;
	}

	mood(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TMOO', value);
		return this;
	}

	movement(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('MVNM', value);
		return this;
	}

	movementNr(nr?: string | number, total?: string | number): ID3V24TagBuilder {
		this.rawBuilder.nrAndTotal('MVIN', nr, total);
		return this;
	}

	musicianCredit(group: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.keyTextList('TMCL', group, value);
		return this;
	}

	musicIPPUID(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'MusicIP PUID', value);
		return this;
	}

	object(filename: string, mimeType: string, contentDescription: string, bin: Buffer): ID3V24TagBuilder {
		this.rawBuilder.object('GEOB', filename, mimeType, contentDescription, bin);
		return this;
	}

	officialArtistURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WOAR', value);
		return this;
	}

	officialAudioFileURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WOAF', value);
		return this;
	}

	officialAudioSourceURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WOAS', value);
		return this;
	}

	officialInternetRadioStationURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WORS', value);
		return this;
	}

	originalAlbum(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TOAL', value);
		return this;
	}

	originalArtist(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TOPE', value);
		return this;
	}

	originalDate(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDOR', value);
		return this;
	}

	originalFilename(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TOFN', value);
		return this;
	}

	originalLyricist(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TOLY', value);
		return this;
	}

	paymentURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WPAY', value);
		return this;
	}

	picture(pictureType: number, description: string, mimeType: string, binary: Buffer): ID3V24TagBuilder {
		this.rawBuilder.picture('APIC', pictureType, description, mimeType, binary);
		return this;
	}

	playCount(value?: number): ID3V24TagBuilder {
		this.rawBuilder.number('PCNT', value);
		return this;
	}

	playlistDelay(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDLY', value);
		return this;
	}

	podcastDescription(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDES', value);
		return this;
	}

	podcastFeedURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WFED', value);
		return this;
	}

	podcastKeywords(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TKWD', value);
		return this;
	}

	podcastURL(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TGID', value);
		return this;
	}

	popularimeter(email: string, rating: number, count: number): ID3V24TagBuilder {
		this.rawBuilder.popularimeter('POPM', email, rating, count);
		return this;
	}

	priv(id: string, binary: Buffer): ID3V24TagBuilder {
		this.rawBuilder.idBin('PRIV', id, binary);
		return this;
	}

	productionNotice(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TPRO', value);
		return this;
	}

	relativeVolumeAdjustment(
		key: string,
		right: number,
		left: number,
		peakRight?: number,
		peakLeft?: number,
		rightBack?: number,
		leftBack?: number,
		peakRightBack?: number,
		peakLeftBack?: number,
		center?: number,
		peakCenter?: number,
		bass?: number,
		peakBass?: number
	): ID3V24TagBuilder {
		this.rawBuilder.relativeVolumeAdjustment('RVAD', right, left,
			peakRight, peakLeft,
			rightBack, leftBack,
			peakRightBack, peakLeftBack,
			center, peakCenter,
			bass, peakBass);
		return this;
	}

	relativeVolumeAdjustment2(id: string, channels: Array<{ type: number; adjustment: number; peak?: number }>): ID3V24TagBuilder {
		this.rawBuilder.relativeVolumeAdjustment2('RVA2', id, channels);
		return this;
	}

	releaseDate(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDRL', value);
		return this;
	}

	remixer(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TPE4', value);
		return this;
	}

	replayGainAdjustment(peak: number, radioAdjustment: number, audiophileAdjustment: number): ID3V24TagBuilder {
		this.rawBuilder.replayGainAdjustment('RGAD', peak, radioAdjustment, audiophileAdjustment);
		return this;
	}

	script(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'SCRIPT', value);
		return this;
	}

	subtitle(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TIT3', value);
		return this;
	}

	synchronisedLyrics(
		id: string, language: string, timestampFormat: number,
		contentType: number, events: Array<{ timestamp: number; text: string; }>
	): ID3V24TagBuilder {
		this.rawBuilder.synchronisedLyrics('SYLT', id, language, timestampFormat, contentType, events);
		return this;
	}

	taggingDate(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TDTG', value);
		return this;
	}

	termsOfUse(id: string, language: string, text: string): ID3V24TagBuilder {
		this.rawBuilder.langText('USER', language, text);
		return this;
	}

	title(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TIT2', value);
		return this;
	}

	titleSort(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('TSOT', value);
		return this;
	}

	track(trackNr?: string | number, trackTotal?: string | number): ID3V24TagBuilder {
		this.rawBuilder.nrAndTotal('TRCK', trackNr, trackTotal);
		return this;
	}

	trackLength(value?: number | string): ID3V24TagBuilder {
		this.rawBuilder.text('TLEN', value ? value.toString() : undefined);
		return this;
	}

	uniqueFileID(id: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('UFID', id, value);
		return this;
	}

	unknown(key: string, binary: Buffer): ID3V24TagBuilder {
		this.rawBuilder.unknown(key, binary);
		return this;
	}

	url(id: string, value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('WXXX', id, value);
		return this;
	}

	website(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('WOAR', value);
		return this;
	}

	writer(value?: string): ID3V24TagBuilder {
		this.rawBuilder.idText('TXXX', 'Writer', value);
		return this;
	}

	work(value?: string): ID3V24TagBuilder {
		this.rawBuilder.text('GRP1', value);
		return this;
	}

}
