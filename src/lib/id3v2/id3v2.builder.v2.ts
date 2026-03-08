import { IID3V2 } from './id3v2.types';
import { ID3V2RawBuilder } from './id3v2.builder';
import { ITagID } from '../common/types';

export abstract class ID3V2TagBuilder implements IID3V2.Builder {
	public rawBuilder: ID3V2RawBuilder;

	constructor(encoding?: string) {
		this.rawBuilder = new ID3V2RawBuilder(encoding);
	}

	// Subclasses must provide version/rev
	abstract version(): number;

	abstract rev(): number;

	buildFrames(): Array<IID3V2.Frame> {
		const result: Array<IID3V2.Frame> = [];
		const frameValues = this.rawBuilder.build();
		for (const id of Object.keys(frameValues)) {
			const list = frameValues[id];
			for (const frame of list) {
				result.push(frame);
			}
		}
		return result;
	}

	buildTag(): IID3V2.Tag {
		return {
			id: ITagID.ID3v2,
			head: {
				ver: this.version(),
				rev: this.rev(),
				size: 0,
				valid: true
			},
			start: 0,
			end: 0,
			frames: this.buildFrames()
		};
	}

	audioEncryption(id: string, previewStart: number, previewLength: number, bin: Buffer) {
		this.rawBuilder.audioEncryption('AENC', id, previewStart, previewLength, bin);
		return this;
	}

	acoustidFingerprint(value?: string) {
		this.idText('TXXX', 'Acoustid Fingerprint', value);
		return this;
	}

	acoustidID(value?: string) {
		this.idText('TXXX', 'Acoustid Id', value);
		return this;
	}

	album(value?: string) {
		this.text('TALB', value);
		return this;
	}

	albumArtist(value?: string) {
		this.text('TPE2', value);
		return this;
	}

	artist(value?: string) {
		this.text('TPE1', value);
		return this;
	}

	artists(value?: string) {
		this.idText('TXXX', 'Artists', value);
		return this;
	}

	asin(value?: string) {
		this.idText('TXXX', 'ASIN', value);
		return this;
	}

	barcode(value?: string) {
		this.idText('TXXX', 'BARCODE', value);
		return this;
	}

	bpm(value?: string | number) {
		this.text('TBPM', value ? value.toString() : undefined);
		return this;
	}

	catalogNumber(value?: string) {
		this.idText('TXXX', 'CATALOGNUMBER', value);
		return this;
	}

	comment(id: string, value?: string) {
		this.idText('COMM', id, value);
		return this;
	}

	commercialInformationURL(value?: string) {
		this.text('WCOM', value);
		return this;
	}

	composer(value?: string) {
		this.text('TCOM', value);
		return this;
	}

	conductor(value?: string) {
		this.text('TPE3', value);
		return this;
	}

	copyright(value?: string) {
		this.text('TCOP', value);
		return this;
	}

	copyrightURL(value?: string) {
		this.text('WCOP', value);
		return this;
	}

	custom(id: string, value?: string) {
		this.idText('TXXX', id, value);
		return this;
	}

	disc(discNr?: string | number, discTotal?: string | number) {
		this.nrAndTotal('TPOS', discNr, discTotal);
		return this;
	}

	encoder(value?: string) {
		this.text('TENC', value);
		return this;
	}

	encoderSettings(value?: string) {
		this.text('TSSE', value);
		return this;
	}

	eventTimingCodes(timeStampFormat: number, events: Array<{ type: number; timestamp: number }>) {
		this.rawBuilder.eventTimingCodes('ETCO', timeStampFormat, events);
		return this;
	}

	fileOwner(value?: string) {
		this.text('TOWN', value);
		return this;
	}

	fileType(value?: string) {
		this.text('TFLT', value);
		return this;
	}

	genre(value?: string) {
		this.text('TCON', value);
		return this;
	}

	grouping(value?: string) {
		this.text('TIT1', value);
		return this;
	}

	initialKey(value?: string) {
		this.text('TKEY', value);
		return this;
	}

	internetRadioStation(value?: string) {
		this.text('TRSN', value);
		return this;
	}

	internetRadioStationOwner(value?: string) {
		this.text('TRSO', value);
		return this;
	}

	isCompilation(value?: boolean | number | string) {
		if (value !== undefined) {
			this.bool('TCMP', value === 1 || value === 'true' || value === true);
		}
		return this;
	}

	isrc(value?: string) {
		this.text('TSRC', value);
		return this;
	}

	label(value?: string) {
		this.text('TPUB', value);
		return this;
	}

	labelURL(value?: string) {
		this.text('WPUB', value);
		return this;
	}

	language(value?: string) {
		this.text('TLAN', value);
		return this;
	}

	license(value?: string) {
		this.idText('TXXX', 'LICENSE', value);
		return this;
	}

	linkedInformation(id: string, url: string, additional: Array<string>) {
		this.rawBuilder.linkedInformation('LINK', id, url, additional);
		return this;
	}

	lyricist(value?: string) {
		this.text('TEXT', value);
		return this;
	}

	lyrics(value?: string, language?: string, id?: string) {
		this.idLangText('USLT', value, language, id);
		return this;
	}

	mbAlbumArtistID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Album Artist Id', value);
		return this;
	}

	mbAlbumID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Album Id', value);
		return this;
	}

	mbAlbumReleaseCountry(value?: string) {
		this.idText('TXXX', 'MusicBrainz Album Release Country', value);
		return this;
	}

	mbAlbumStatus(value?: string) {
		this.idText('TXXX', 'MusicBrainz Album Status', value);
		return this;
	}

	mbAlbumType(value?: string) {
		this.idText('TXXX', 'MusicBrainz Album Type', value);
		return this;
	}

	mbArtistID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Artist Id', value);
		return this;
	}

	mbDiscID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Disc Id', value);
		return this;
	}

	mbOriginalAlbumID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Original Album Id', value);
		return this;
	}

	mbOriginalArtistID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Original Artist Id', value);
		return this;
	}

	mbReleaseGroupID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Release Group Id', value);
		return this;
	}

	mbReleaseTrackID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Release Track Id', value);
		return this;
	}

	mbTrackDisambiguation(value?: string) {
		this.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
		return this;
	}

	mbTrackID(value?: string) {
		return this.uniqueFileID('http://musicbrainz.org', value);
	}

	mbTRMID(value?: string) {
		this.idText('TXXX', 'MusicBrainz TRM Id', value);
		return this;
	}

	mbWorkID(value?: string) {
		this.idText('TXXX', 'MusicBrainz Work Id', value);
		return this;
	}

	uniqueFileID(id: string, value?: string) {
		this.idText('UFID', id, value);
		return this;
	}

	mediaType(value?: string) {
		this.text('TMED', value);
		return this;
	}

	musicIPPUID(value?: string) {
		this.idText('TXXX', 'MusicIP PUID', value);
		return this;
	}

	object(filename: string, mimeType: string, contentDescription: string, bin: Buffer) {
		this.rawBuilder.object('GEOB', filename, mimeType, contentDescription, bin);
		return this;
	}

	officialArtistURL(value?: string) {
		this.text('WOAR', value);
		return this;
	}

	officialAudioFileURL(value?: string) {
		this.text('WOAF', value);
		return this;
	}

	/** WOAS The 'Official audio source webpage' frame is a URL pointing at the official webpage for the source of the audio file, e.g. a movie. **/
	officialAudioSourceURL(value?: string) {
		this.text('WOAS', value);
		return this;
	}

	/** WORS The 'Official Internet radio station homepage' contains a URL pointing at the homepage of the internet radio station. **/
	officialInternetRadioStationURL(value?: string) {
		this.text('WORS', value);
		return this;
	}

	/** TOAL The 'Original album/movie/show title' frame is intended for the title of the original recording (or source of sound), if for example the music in the file should be a cover of a previously released song. */
	originalAlbum(value?: string) {
		this.text('TOAL', value);
		return this;
	}

	/** TOPE: The 'Original artist/performer' frame is intended for the performer of the original recording, if for example the music in the file should be a cover of a previously released song. **/
	originalArtist(value?: string) {
		this.text('TOPE', value);
		return this;
	}

	/** TOFN: The 'Original filename' frame contains the preferred filename for the file, since some media doesn't allow the desired length of the filename. The filename is case sensitive and includes its suffix. **/
	originalFilename(value?: string) {
		this.text('TOFN', value);
		return this;
	}

	/** TOLY: The 'Original lyricist/text writer' frame is intended for the text writer of the original recording, if for example the music in the file should be a cover of a previously released song. **/
	originalLyricist(value?: string) {
		this.text('TOLY', value);
		return this;
	}

	paymentURL(value?: string) {
		this.text('WPAY', value);
		return this;
	}

	/**
	 * APIC: Attached picture
	 * @param pictureType Picture type [[ID3V2ValueTypes]]
	 * @param description a short description of the picture
	 * @param mimeType MIME media type e.g. "image/png"
	 * @param binary binary data of a image
	 */
	picture(pictureType: number, description: string, mimeType: string, binary: Buffer) {
		this.rawBuilder.picture('APIC', pictureType, description, mimeType, binary);
		return this;
	}

	/** PCNT: This is simply a counter of the number of times a file has been played. The value is increased by one every time the file begins to play. **/
	playCount(value?: number) {
		this.number('PCNT', value);
		return this;
	}

	/** TDLY: The 'Playlist delay' defines the numbers of milliseconds of silence that should be inserted before this audio. The value zero indicates that this is a part of a multifile audio track that should be played continuously. **/
	playlistDelay(value?: string) {
		this.text('TDLY', value);
		return this;
	}

	popularimeter(email: string, rating: number, count: number) {
		this.rawBuilder.popularimeter('POPM', email, rating, count);
		return this;
	}

	priv(id: string, binary: Buffer) {
		this.idBin('PRIV', id, binary);
		return this;
	}

	relativeVolumeAdjustment(
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
	) {
		this.rawBuilder.relativeVolumeAdjustment('RVAD', right, left,
			peakRight, peakLeft,
			rightBack, leftBack,
			peakRightBack, peakLeftBack,
			center, peakCenter,
			bass, peakBass);
		return this;
	}

	/** TPE4: The 'Interpreted, remixed, or otherwise modified by' frame contains more information about the people behind a remix and similar interpretations of another existing piece. **/
	remixer(value?: string) {
		this.text('TPE4', value);
		return this;
	}

	script(value?: string) {
		this.idText('TXXX', 'SCRIPT', value);
		return this;
	}

	subtitle(value?: string) {
		this.text('TIT3', value);
		return this;
	}

	synchronisedLyrics(
		id: string, language: string, timestampFormat: number,
		contentType: number, events: Array<{ timestamp: number; text: string }>
	) {
		this.rawBuilder.synchronisedLyrics('SYLT', id, language, timestampFormat, contentType, events);
		return this;
	}

	termsOfUse(id: string, language: string, text: string) {
		this.langText('USER', language, text);
		return this;
	}

	title(value?: string) {
		this.text('TIT2', value);
		return this;
	}

	track(trackNr?: string | number, trackTotal?: string | number) {
		this.nrAndTotal('TRCK', trackNr, trackTotal);
		return this;
	}

	/** TLEN The 'Length' frame contains the length of the audio file in milliseconds, represented as a numeric string. **/
	trackLength(value?: number | string) {
		this.text('TLEN', value ? value.toString() : undefined);
		return this;
	}

	url(id: string, value?: string) {
		this.idText('WXXX', id, value);
		return this;
	}

	/**
	  WOAR: The 'Official artist/performer webpage' frame is a URL pointing at the artists official webpage.
	  There may be more than one "WOAR" frame in a tag if the audio contains more than one performer, but not with the same content.
	 **/
	website(value?: string) {
		this.text('WOAR', value);
		return this;
	}

	writer(value?: string) {
		this.idText('TXXX', 'Writer', value);
		return this;
	}

	unknown(id: string, binary: Buffer) {
		this.rawBuilder.unknown(id, binary);
		return this;
	}

	// Common protected helpers wrapping rawBuilder to keep subclasses concise
	text(id: string, text?: string) {
		this.rawBuilder.text(id, text);
		return this;
	}

	idText(id: string, key: string, value?: string) {
		this.rawBuilder.idText(id, key, value);
		return this;
	}

	idLangText(id: string, value?: string, lang?: string, key?: string) {
		this.rawBuilder.idLangText(id, value, lang, key);
		return this;
	}

	langText(id: string, language: string, text: string) {
		this.rawBuilder.langText(id, language, text);
		return this;
	}

	idBin(id: string, key: string, bin: Buffer) {
		this.rawBuilder.idBin(id, key, bin);
		return this;
	}

	idBinRaw(id: string, key: string, binary: Buffer) {
		this.rawBuilder.idBin(id, key, binary);
		return this;
	}

	nrAndTotal(id: string, value?: number | string, total?: number | string) {
		this.rawBuilder.nrAndTotal(id, value as any, total as any);
		return this;
	}

	number(id: string, num?: number) {
		this.rawBuilder.number(id, num as any);
		return this;
	}

	bool(id: string, b: boolean) {
		this.rawBuilder.bool(id, b);
		return this;
	}

	keyTextList(id: string, group: string, value?: string) {
		this.rawBuilder.keyTextList(id, group, value);
		return this;
	}
}
