"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3V24TagBuilder = void 0;
const id3v2_builder_1 = require("./id3v2.builder");
const types_1 = require("../common/types");
class ID3V24TagBuilder {
    constructor(encoding) {
        this.rawBuilder = new id3v2_builder_1.ID3V2RawBuilder(encoding);
    }
    buildFrames() {
        const result = [];
        const frameValues = this.rawBuilder.build();
        Object.keys(frameValues).forEach(id => {
            const list = frameValues[id];
            for (const frame of list) {
                result.push(frame);
            }
        });
        return result;
    }
    version() {
        return 4;
    }
    rev() {
        return 0;
    }
    buildTag() {
        return {
            id: types_1.ITagID.ID3v2,
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
    acoustidFingerprint(value) {
        this.rawBuilder.idText('TXXX', 'Acoustid Fingerprint', value);
        return this;
    }
    acoustidID(value) {
        this.rawBuilder.idText('TXXX', 'Acoustid Id', value);
        return this;
    }
    album(value) {
        this.rawBuilder.text('TALB', value);
        return this;
    }
    albumSort(value) {
        this.rawBuilder.text('TSOA', value);
        return this;
    }
    albumArtist(value) {
        this.rawBuilder.text('TPE2', value);
        return this;
    }
    albumArtistSort(value) {
        this.rawBuilder.text('TSO2', value);
        return this;
    }
    artist(value) {
        this.rawBuilder.text('TPE1', value);
        return this;
    }
    artistSort(value) {
        this.rawBuilder.text('TSOP', value);
        return this;
    }
    artists(value) {
        this.rawBuilder.idText('TXXX', 'Artists', value);
        return this;
    }
    asin(value) {
        this.rawBuilder.idText('TXXX', 'ASIN', value);
        return this;
    }
    audioEncryption(id, previewStart, previewLength, bin) {
        this.rawBuilder.audioEncryption('AENC', id, previewStart, previewLength, bin);
        return this;
    }
    barcode(value) {
        this.rawBuilder.idText('TXXX', 'BARCODE', value);
        return this;
    }
    bpm(value) {
        this.rawBuilder.text('TBPM', value ? value.toString() : undefined);
        return this;
    }
    catalogNumber(value) {
        this.rawBuilder.idText('TXXX', 'CATALOGNUMBER', value);
        return this;
    }
    chapter(id, start, end, offset, offsetEnd, subframes) {
        this.rawBuilder.chapter('CHAP', id, start, end, offset, offsetEnd, subframes);
        return this;
    }
    chapterTOC(value, id, ordered, topLevel, children) {
        this.rawBuilder.chapterTOC('CTOC', id, ordered, topLevel, children);
        return this;
    }
    comment(id, value) {
        this.rawBuilder.idText('COMM', id, value);
        return this;
    }
    commercialInformationURL(value) {
        this.rawBuilder.text('WCOM', value);
        return this;
    }
    composer(value) {
        this.rawBuilder.text('TCOM', value);
        return this;
    }
    composerSort(value) {
        this.rawBuilder.text('TSOC', value);
        return this;
    }
    conductor(value) {
        this.rawBuilder.text('TPE3', value);
        return this;
    }
    copyright(value) {
        this.rawBuilder.text('TCOP', value);
        return this;
    }
    copyrightURL(value) {
        this.rawBuilder.text('WCOP', value);
        return this;
    }
    custom(id, value) {
        this.rawBuilder.idText('TXXX', id, value);
        return this;
    }
    date(value) {
        this.rawBuilder.text('TDRC', value);
        return this;
    }
    disc(discNr, discTotal) {
        this.rawBuilder.nrAndTotal('TPOS', discNr, discTotal);
        return this;
    }
    discSubtitle(value) {
        this.rawBuilder.text('TSST', value);
        return this;
    }
    encoder(value) {
        this.rawBuilder.text('TENC', value);
        return this;
    }
    encoderSettings(value) {
        this.rawBuilder.text('TSSE', value);
        return this;
    }
    encodingDate(value) {
        this.rawBuilder.text('TDEN', value);
        return this;
    }
    eventTimingCodes(timeStampFormat, events) {
        this.rawBuilder.eventTimingCodes('ETCO', timeStampFormat, events);
        return this;
    }
    fileOwner(value) {
        this.rawBuilder.text('TOWN', value);
        return this;
    }
    fileType(value) {
        this.rawBuilder.text('TFLT', value);
        return this;
    }
    genre(value) {
        this.rawBuilder.text('TCON', value);
        return this;
    }
    grouping(value) {
        this.rawBuilder.text('TIT1', value);
        return this;
    }
    initialKey(value) {
        this.rawBuilder.text('TKEY', value);
        return this;
    }
    internetRadioStation(value) {
        this.rawBuilder.text('TRSN', value);
        return this;
    }
    internetRadioStationOwner(value) {
        this.rawBuilder.text('TRSO', value);
        return this;
    }
    involved(group, value) {
        this.rawBuilder.keyTextList('TIPL', group, value);
        return this;
    }
    isCompilation(value) {
        if (value !== undefined) {
            this.rawBuilder.bool('TCMP', value === 1 || value === 'true' || value === true);
        }
        return this;
    }
    isPodcast(value) {
        if (value !== undefined) {
            this.rawBuilder.number('PCST', value === 1 || value === 'true' || value === true ? 1 : 0);
        }
        return this;
    }
    isrc(value) {
        this.rawBuilder.text('TSRC', value);
        return this;
    }
    label(value) {
        this.rawBuilder.text('TPUB', value);
        return this;
    }
    labelURL(value) {
        this.rawBuilder.text('WPUB', value);
        return this;
    }
    language(value) {
        this.rawBuilder.text('TLAN', value);
        return this;
    }
    license(value) {
        this.rawBuilder.idText('TXXX', 'LICENSE', value);
        return this;
    }
    linkedInformation(id, url, additional) {
        this.rawBuilder.linkedInformation('LINK', id, url, additional);
        return this;
    }
    lyricist(value) {
        this.rawBuilder.text('TEXT', value);
        return this;
    }
    lyrics(value, language, id) {
        this.rawBuilder.idLangText('USLT', value, language, id);
        return this;
    }
    mbAlbumArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Artist Id', value);
        return this;
    }
    mbAlbumID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Id', value);
        return this;
    }
    mbAlbumReleaseCountry(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Release Country', value);
        return this;
    }
    mbAlbumStatus(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Status', value);
        return this;
    }
    mbAlbumType(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Type', value);
        return this;
    }
    mbArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Artist Id', value);
        return this;
    }
    mbDiscID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Disc Id', value);
        return this;
    }
    mbOriginalAlbumID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Original Album Id', value);
        return this;
    }
    mbOriginalArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Original Artist Id', value);
        return this;
    }
    mbReleaseGroupID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Release Group Id', value);
        return this;
    }
    mbReleaseTrackID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Release Track Id', value);
        return this;
    }
    mbTrackDisambiguation(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
        return this;
    }
    mbTrackID(value) {
        return this.uniqueFileID('http://musicbrainz.org', value);
    }
    mbTRMID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz TRM Id', value);
        return this;
    }
    mbWorkID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Work Id', value);
        return this;
    }
    mediaType(value) {
        this.rawBuilder.text('TMED', value);
        return this;
    }
    mood(value) {
        this.rawBuilder.text('TMOO', value);
        return this;
    }
    movement(value) {
        this.rawBuilder.text('MVNM', value);
        return this;
    }
    movementNr(nr, total) {
        this.rawBuilder.nrAndTotal('MVIN', nr, total);
        return this;
    }
    musicianCredit(group, value) {
        this.rawBuilder.keyTextList('TMCL', group, value);
        return this;
    }
    musicIPPUID(value) {
        this.rawBuilder.idText('TXXX', 'MusicIP PUID', value);
        return this;
    }
    object(filename, mimeType, contentDescription, bin) {
        this.rawBuilder.object('GEOB', filename, mimeType, contentDescription, bin);
        return this;
    }
    officialArtistURL(value) {
        this.rawBuilder.text('WOAR', value);
        return this;
    }
    officialAudioFileURL(value) {
        this.rawBuilder.text('WOAF', value);
        return this;
    }
    officialAudioSourceURL(value) {
        this.rawBuilder.text('WOAS', value);
        return this;
    }
    officialInternetRadioStationURL(value) {
        this.rawBuilder.text('WORS', value);
        return this;
    }
    originalAlbum(value) {
        this.rawBuilder.text('TOAL', value);
        return this;
    }
    originalArtist(value) {
        this.rawBuilder.text('TOPE', value);
        return this;
    }
    originalDate(value) {
        this.rawBuilder.text('TDOR', value);
        return this;
    }
    originalFilename(value) {
        this.rawBuilder.text('TOFN', value);
        return this;
    }
    originalLyricist(value) {
        this.rawBuilder.text('TOLY', value);
        return this;
    }
    paymentURL(value) {
        this.rawBuilder.text('WPAY', value);
        return this;
    }
    picture(pictureType, description, mimeType, binary) {
        this.rawBuilder.picture('APIC', pictureType, description, mimeType, binary);
        return this;
    }
    playCount(value) {
        this.rawBuilder.number('PCNT', value);
        return this;
    }
    playlistDelay(value) {
        this.rawBuilder.text('TDLY', value);
        return this;
    }
    podcastDescription(value) {
        this.rawBuilder.text('TDES', value);
        return this;
    }
    podcastFeedURL(value) {
        this.rawBuilder.text('WFED', value);
        return this;
    }
    podcastKeywords(value) {
        this.rawBuilder.text('TKWD', value);
        return this;
    }
    podcastURL(value) {
        this.rawBuilder.text('TGID', value);
        return this;
    }
    popularimeter(email, rating, count) {
        this.rawBuilder.popularimeter('POPM', email, rating, count);
        return this;
    }
    priv(id, binary) {
        this.rawBuilder.idBin('PRIV', id, binary);
        return this;
    }
    productionNotice(value) {
        this.rawBuilder.text('TPRO', value);
        return this;
    }
    relativeVolumeAdjustment(key, right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass) {
        this.rawBuilder.relativeVolumeAdjustment('RVAD', right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass);
        return this;
    }
    relativeVolumeAdjustment2(id, channels) {
        this.rawBuilder.relativeVolumeAdjustment2('RVA2', id, channels);
        return this;
    }
    releaseDate(value) {
        this.rawBuilder.text('TDRL', value);
        return this;
    }
    remixer(value) {
        this.rawBuilder.text('TPE4', value);
        return this;
    }
    replayGainAdjustment(peak, radioAdjustment, audiophileAdjustment) {
        this.rawBuilder.replayGainAdjustment('RGAD', peak, radioAdjustment, audiophileAdjustment);
        return this;
    }
    script(value) {
        this.rawBuilder.idText('TXXX', 'SCRIPT', value);
        return this;
    }
    subtitle(value) {
        this.rawBuilder.text('TIT3', value);
        return this;
    }
    synchronisedLyrics(id, language, timestampFormat, contentType, events) {
        this.rawBuilder.synchronisedLyrics('SYLT', id, language, timestampFormat, contentType, events);
        return this;
    }
    taggingDate(value) {
        this.rawBuilder.text('TDTG', value);
        return this;
    }
    termsOfUse(id, language, text) {
        this.rawBuilder.langText('USER', language, text);
        return this;
    }
    title(value) {
        this.rawBuilder.text('TIT2', value);
        return this;
    }
    titleSort(value) {
        this.rawBuilder.text('TSOT', value);
        return this;
    }
    track(trackNr, trackTotal) {
        this.rawBuilder.nrAndTotal('TRCK', trackNr, trackTotal);
        return this;
    }
    trackLength(value) {
        this.rawBuilder.text('TLEN', value ? value.toString() : undefined);
        return this;
    }
    uniqueFileID(id, value) {
        this.rawBuilder.idText('UFID', id, value);
        return this;
    }
    unknown(key, binary) {
        this.rawBuilder.unknown(key, binary);
        return this;
    }
    url(id, value) {
        this.rawBuilder.idText('WXXX', id, value);
        return this;
    }
    website(value) {
        this.rawBuilder.text('WOAR', value);
        return this;
    }
    writer(value) {
        this.rawBuilder.idText('TXXX', 'Writer', value);
        return this;
    }
    work(value) {
        this.rawBuilder.text('GRP1', value);
        return this;
    }
}
exports.ID3V24TagBuilder = ID3V24TagBuilder;
ID3V24TagBuilder.encodings = {
    iso88591: 'iso-8859-1',
    ucs2: 'ucs2',
    utf16be: 'utf16-be',
    utf8: 'utf8'
};
//# sourceMappingURL=id3v2.builder.v24.js.map