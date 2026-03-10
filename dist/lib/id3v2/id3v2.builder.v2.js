"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3V2TagBuilder = void 0;
const id3v2_builder_1 = require("./id3v2.builder");
const types_1 = require("../common/types");
class ID3V2TagBuilder {
    constructor(encoding) {
        this.rawBuilder = new id3v2_builder_1.ID3V2RawBuilder(encoding);
    }
    loadTag(tag) {
        this.rawBuilder.loadFrames(tag.frames);
        return this;
    }
    buildFrames() {
        const result = [];
        const frameValues = this.rawBuilder.build();
        for (const id of Object.keys(frameValues)) {
            const list = frameValues[id];
            for (const frame of list) {
                result.push(frame);
            }
        }
        return result;
    }
    buildTag() {
        return {
            id: types_1.ITagID.ID3v2,
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
    audioEncryption(id, previewStart, previewLength, bin) {
        this.rawBuilder.audioEncryption('AENC', id, previewStart, previewLength, bin);
        return this;
    }
    acoustidFingerprint(value) {
        this.idText('TXXX', 'Acoustid Fingerprint', value);
        return this;
    }
    acoustidID(value) {
        this.idText('TXXX', 'Acoustid Id', value);
        return this;
    }
    album(value) {
        this.text('TALB', value);
        return this;
    }
    albumArtist(value) {
        this.text('TPE2', value);
        return this;
    }
    artist(value) {
        this.text('TPE1', value);
        return this;
    }
    artists(value) {
        this.idText('TXXX', 'Artists', value);
        return this;
    }
    asin(value) {
        this.idText('TXXX', 'ASIN', value);
        return this;
    }
    barcode(value) {
        this.idText('TXXX', 'BARCODE', value);
        return this;
    }
    bpm(value) {
        this.text('TBPM', value ? value.toString() : undefined);
        return this;
    }
    catalogNumber(value) {
        this.idText('TXXX', 'CATALOGNUMBER', value);
        return this;
    }
    comment(id, value) {
        this.idText('COMM', id, value);
        return this;
    }
    commercialInformationURL(value) {
        this.text('WCOM', value);
        return this;
    }
    composer(value) {
        this.text('TCOM', value);
        return this;
    }
    conductor(value) {
        this.text('TPE3', value);
        return this;
    }
    copyright(value) {
        this.text('TCOP', value);
        return this;
    }
    copyrightURL(value) {
        this.text('WCOP', value);
        return this;
    }
    custom(id, value) {
        this.idText('TXXX', id, value);
        return this;
    }
    disc(discNr, discTotal) {
        this.nrAndTotal('TPOS', discNr, discTotal);
        return this;
    }
    encoder(value) {
        this.text('TENC', value);
        return this;
    }
    encoderSettings(value) {
        this.text('TSSE', value);
        return this;
    }
    eventTimingCodes(timeStampFormat, events) {
        this.rawBuilder.eventTimingCodes('ETCO', timeStampFormat, events);
        return this;
    }
    fileOwner(value) {
        this.text('TOWN', value);
        return this;
    }
    fileType(value) {
        this.text('TFLT', value);
        return this;
    }
    genre(value) {
        this.text('TCON', value);
        return this;
    }
    grouping(value) {
        this.text('TIT1', value);
        return this;
    }
    initialKey(value) {
        this.text('TKEY', value);
        return this;
    }
    internetRadioStation(value) {
        this.text('TRSN', value);
        return this;
    }
    internetRadioStationOwner(value) {
        this.text('TRSO', value);
        return this;
    }
    isCompilation(value) {
        if (value !== undefined) {
            this.bool('TCMP', value === 1 || value === 'true' || value === true);
        }
        return this;
    }
    isrc(value) {
        this.text('TSRC', value);
        return this;
    }
    label(value) {
        this.text('TPUB', value);
        return this;
    }
    labelURL(value) {
        this.text('WPUB', value);
        return this;
    }
    language(value) {
        this.text('TLAN', value);
        return this;
    }
    license(value) {
        this.idText('TXXX', 'LICENSE', value);
        return this;
    }
    linkedInformation(id, url, additional) {
        this.rawBuilder.linkedInformation('LINK', id, url, additional);
        return this;
    }
    lyricist(value) {
        this.text('TEXT', value);
        return this;
    }
    lyrics(value, language, id) {
        this.idLangText('USLT', value, language, id);
        return this;
    }
    mbAlbumArtistID(value) {
        this.idText('TXXX', 'MusicBrainz Album Artist Id', value);
        return this;
    }
    mbAlbumID(value) {
        this.idText('TXXX', 'MusicBrainz Album Id', value);
        return this;
    }
    mbAlbumReleaseCountry(value) {
        this.idText('TXXX', 'MusicBrainz Album Release Country', value);
        return this;
    }
    mbAlbumStatus(value) {
        this.idText('TXXX', 'MusicBrainz Album Status', value);
        return this;
    }
    mbAlbumType(value) {
        this.idText('TXXX', 'MusicBrainz Album Type', value);
        return this;
    }
    mbArtistID(value) {
        this.idText('TXXX', 'MusicBrainz Artist Id', value);
        return this;
    }
    mbDiscID(value) {
        this.idText('TXXX', 'MusicBrainz Disc Id', value);
        return this;
    }
    mbOriginalAlbumID(value) {
        this.idText('TXXX', 'MusicBrainz Original Album Id', value);
        return this;
    }
    mbOriginalArtistID(value) {
        this.idText('TXXX', 'MusicBrainz Original Artist Id', value);
        return this;
    }
    mbReleaseGroupID(value) {
        this.idText('TXXX', 'MusicBrainz Release Group Id', value);
        return this;
    }
    mbReleaseTrackID(value) {
        this.idText('TXXX', 'MusicBrainz Release Track Id', value);
        return this;
    }
    mbTrackDisambiguation(value) {
        this.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
        return this;
    }
    mbTrackID(value) {
        return this.uniqueFileID('http://musicbrainz.org', value);
    }
    mbTRMID(value) {
        this.idText('TXXX', 'MusicBrainz TRM Id', value);
        return this;
    }
    mbWorkID(value) {
        this.idText('TXXX', 'MusicBrainz Work Id', value);
        return this;
    }
    uniqueFileID(id, value) {
        this.idText('UFID', id, value);
        return this;
    }
    mediaType(value) {
        this.text('TMED', value);
        return this;
    }
    musicIPPUID(value) {
        this.idText('TXXX', 'MusicIP PUID', value);
        return this;
    }
    object(filename, mimeType, contentDescription, bin) {
        this.rawBuilder.object('GEOB', filename, mimeType, contentDescription, bin);
        return this;
    }
    officialArtistURL(value) {
        this.text('WOAR', value);
        return this;
    }
    officialAudioFileURL(value) {
        this.text('WOAF', value);
        return this;
    }
    officialAudioSourceURL(value) {
        this.text('WOAS', value);
        return this;
    }
    officialInternetRadioStationURL(value) {
        this.text('WORS', value);
        return this;
    }
    originalAlbum(value) {
        this.text('TOAL', value);
        return this;
    }
    originalArtist(value) {
        this.text('TOPE', value);
        return this;
    }
    originalFilename(value) {
        this.text('TOFN', value);
        return this;
    }
    originalLyricist(value) {
        this.text('TOLY', value);
        return this;
    }
    paymentURL(value) {
        this.text('WPAY', value);
        return this;
    }
    picture(pictureType, description, mimeType, binary) {
        this.rawBuilder.picture('APIC', pictureType, description, mimeType, binary);
        return this;
    }
    playCount(value) {
        this.number('PCNT', value);
        return this;
    }
    playlistDelay(value) {
        this.text('TDLY', value);
        return this;
    }
    popularimeter(email, rating, count) {
        this.rawBuilder.popularimeter('POPM', email, rating, count);
        return this;
    }
    priv(id, binary) {
        this.idBin('PRIV', id, binary);
        return this;
    }
    averageLevel(value) {
        this.rawBuilder.idNum('PRIV', 'AverageLevel', value);
        return this;
    }
    peakValue(value) {
        this.rawBuilder.idNum('PRIV', 'PeakValue', value);
        return this;
    }
    wmMediaClassPrimaryID(guid) {
        this.rawBuilder.idGuid('PRIV', 'WM/MediaClassPrimaryID', guid);
        return this;
    }
    wmMediaClassSecondaryID(guid) {
        this.rawBuilder.idGuid('PRIV', 'WM/MediaClassSecondaryID', guid);
        return this;
    }
    wmProvider(value) {
        this.rawBuilder.idText('PRIV', 'WM/Provider', value);
        return this;
    }
    wmUniqueFileIdentifier(value) {
        this.rawBuilder.idText('PRIV', 'WM/UniqueFileIdentifier', value);
        return this;
    }
    wmMood(value) {
        this.rawBuilder.idText('PRIV', 'WM/Mood', value);
        return this;
    }
    relativeVolumeAdjustment(right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass) {
        this.rawBuilder.relativeVolumeAdjustment('RVAD', right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass);
        return this;
    }
    remixer(value) {
        this.text('TPE4', value);
        return this;
    }
    script(value) {
        this.idText('TXXX', 'SCRIPT', value);
        return this;
    }
    subtitle(value) {
        this.text('TIT3', value);
        return this;
    }
    synchronisedLyrics(id, language, timestampFormat, contentType, events) {
        this.rawBuilder.synchronisedLyrics('SYLT', id, language, timestampFormat, contentType, events);
        return this;
    }
    termsOfUse(id, language, text) {
        this.langText('USER', language, text);
        return this;
    }
    title(value) {
        this.text('TIT2', value);
        return this;
    }
    track(trackNr, trackTotal) {
        this.nrAndTotal('TRCK', trackNr, trackTotal);
        return this;
    }
    trackLength(value) {
        this.text('TLEN', value ? value.toString() : undefined);
        return this;
    }
    url(id, value) {
        this.idText('WXXX', id, value);
        return this;
    }
    website(value) {
        this.text('WOAR', value);
        return this;
    }
    writer(value) {
        this.idText('TXXX', 'Writer', value);
        return this;
    }
    unknown(id, binary) {
        this.rawBuilder.unknown(id, binary);
        return this;
    }
    text(id, text) {
        this.rawBuilder.text(id, text);
        return this;
    }
    idText(id, key, value) {
        this.rawBuilder.idText(id, key, value);
        return this;
    }
    idLangText(id, value, lang, key) {
        this.rawBuilder.idLangText(id, value, lang, key);
        return this;
    }
    langText(id, language, text) {
        this.rawBuilder.langText(id, language, text);
        return this;
    }
    idBin(id, key, bin) {
        this.rawBuilder.idBin(id, key, bin);
        return this;
    }
    idNum(id, key, num) {
        this.rawBuilder.idNum(id, key, num);
        return this;
    }
    idGuid(id, key, guid) {
        this.rawBuilder.idGuid(id, key, guid);
        return this;
    }
    idBinRaw(id, key, binary) {
        this.rawBuilder.idBin(id, key, binary);
        return this;
    }
    nrAndTotal(id, value, total) {
        this.rawBuilder.nrAndTotal(id, value, total);
        return this;
    }
    number(id, num) {
        this.rawBuilder.number(id, num);
        return this;
    }
    bool(id, b) {
        this.rawBuilder.bool(id, b);
        return this;
    }
    keyTextList(id, group, value) {
        this.rawBuilder.keyTextList(id, group, value);
        return this;
    }
    clearAudioEncryption() {
        this.rawBuilder.clearFrames('AENC');
        return this;
    }
    clearComments() {
        this.rawBuilder.clearFrames('COMM');
        return this;
    }
    clearCustom() {
        this.rawBuilder.clearFrames('TXXX');
        return this;
    }
    clearEventTimingCodes() {
        this.rawBuilder.clearFrames('ETCO');
        return this;
    }
    clearLinkedInformation() {
        this.rawBuilder.clearFrames('LINK');
        return this;
    }
    clearLyrics() {
        this.rawBuilder.clearFrames('USLT');
        return this;
    }
    clearObjects() {
        this.rawBuilder.clearFrames('GEOB');
        return this;
    }
    clearPictures() {
        this.rawBuilder.clearFrames('APIC');
        return this;
    }
    clearPopularimeters() {
        this.rawBuilder.clearFrames('POPM');
        return this;
    }
    clearPriv() {
        this.rawBuilder.clearFrames('PRIV');
        return this;
    }
    clearRelativeVolumeAdjustment() {
        this.rawBuilder.clearFrames('RVAD');
        return this;
    }
    clearSynchronisedLyrics() {
        this.rawBuilder.clearFrames('SYLT');
        return this;
    }
    clearTermsOfUse() {
        this.rawBuilder.clearFrames('USER');
        return this;
    }
    clearUniqueFileIDs() {
        this.rawBuilder.clearFrames('UFID');
        return this;
    }
    clearURLs() {
        this.rawBuilder.clearFrames('WXXX');
        return this;
    }
    clearUnknown(id) {
        this.rawBuilder.clearFrames(id);
        return this;
    }
}
exports.ID3V2TagBuilder = ID3V2TagBuilder;
//# sourceMappingURL=id3v2.builder.v2.js.map