"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ID3V2RawBuilder {
    constructor() {
        this.frameValues = {};
    }
    build() {
        return this.frameValues;
    }
    text(key, text) {
        if (text) {
            const frame = { id: key, value: { text } };
            this.frameValues[key] = [frame];
        }
    }
    idText(key, id, value) {
        if (value) {
            const frame = { id: key, value: { id, text: value } };
            const list = (this.frameValues[key] || [])
                .filter(f => f.value.id !== id);
            this.frameValues[key] = list.concat([frame]);
        }
    }
    nrAndTotal(key, value, total) {
        if (value) {
            const text = value.toString() + (total ? '/' + total.toString() : '');
            const frame = { id: key, value: { text } };
            this.frameValues[key] = [frame];
        }
    }
    keyTextList(key, group, value) {
        if (value) {
            const frames = (this.frameValues[key] || []);
            const frame = (frames.length > 0) ? frames[0] : { id: key, value: { list: [] } };
            frame.value.list.push(group);
            frame.value.list.push(value);
            this.frameValues[key] = [frame];
        }
    }
    bool(key, bool) {
        if (bool !== undefined) {
            const frame = { id: key, value: { bool } };
            this.frameValues[key] = [frame];
        }
    }
    idLangText(key, value, lang, id) {
        if (value) {
            id = id || '';
            lang = lang || '';
            const list = (this.frameValues[key] || [])
                .filter(f => f.value.id !== id);
            const frame = { id: key, value: { id, language: lang, text: value } };
            this.frameValues[key] = list.concat([frame]);
        }
    }
    picture(key, pictureType, description, mimeType, binary) {
        const frame = {
            id: key, value: {
                description: description || '',
                pictureType,
                bin: binary,
                mimeType: mimeType
            }
        };
        this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
    }
    idBin(key, id, binary) {
        const frame = {
            id: key,
            value: {
                id,
                bin: binary
            }
        };
        this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
    }
    chapter(key, chapterID, start, end, offset, offsetEnd, subframes) {
        const frame = {
            id: key,
            value: {
                id: chapterID,
                start,
                end,
                offset,
                offsetEnd
            },
            subframes
        };
        this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
    }
}
exports.ID3V2RawBuilder = ID3V2RawBuilder;
class ID3V24TagBuilder {
    constructor() {
        this.rawBuilder = new ID3V2RawBuilder();
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
    buildTag() {
        const result = {
            id: 'ID3v2',
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
        return result;
    }
    artist(value) {
        this.rawBuilder.text('TPE1', value);
        return this;
    }
    artistSort(value) {
        this.rawBuilder.text('TSOP', value);
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
    album(value) {
        this.rawBuilder.text('TALB', value);
        return this;
    }
    albumSort(value) {
        this.rawBuilder.text('TSOA', value);
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
    title(value) {
        this.rawBuilder.text('TIT2', value);
        return this;
    }
    work(value) {
        this.rawBuilder.text('TIT1', value);
        return this;
    }
    titleSort(value) {
        this.rawBuilder.text('TSOT', value);
        return this;
    }
    genre(value) {
        this.rawBuilder.text('TCON', value);
        return this;
    }
    bmp(value) {
        this.rawBuilder.text('TBPM', value ? value.toString() : undefined);
        return this;
    }
    mood(value) {
        this.rawBuilder.text('TMOO', value);
        return this;
    }
    media(value) {
        this.rawBuilder.text('TMED', value);
        return this;
    }
    language(value) {
        this.rawBuilder.text('TLAN', value);
        return this;
    }
    grouping(value) {
        this.rawBuilder.text('GRP1', value);
        return this;
    }
    date(value) {
        this.rawBuilder.text('TDRC', value);
        return this;
    }
    track(trackNr, trackTotal) {
        this.rawBuilder.nrAndTotal('TRCK', trackNr, trackTotal);
        return this;
    }
    disc(discNr, discTotal) {
        this.rawBuilder.nrAndTotal('TPOS', discNr, discTotal);
        return this;
    }
    year(year) {
        this.rawBuilder.text('TORY', year ? year.toString() : undefined);
        return this;
    }
    artists(value) {
        this.rawBuilder.idText('TXXX', 'Artists', value);
        return this;
    }
    isCompilation(value) {
        if (value !== undefined) {
            this.rawBuilder.bool('TCMP', value === 1 || value === 'true' || value === true);
        }
        return this;
    }
    originalYear(value) {
        this.rawBuilder.text('TYER', value);
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
    remixer(value) {
        this.rawBuilder.text('TPE4', value);
        return this;
    }
    label(value) {
        this.rawBuilder.text('TPUB', value);
        return this;
    }
    subtitle(value) {
        this.rawBuilder.text('TIT3', value);
        return this;
    }
    discSubtitle(value) {
        this.rawBuilder.text('TSST', value);
        return this;
    }
    lyricist(value) {
        this.rawBuilder.text('TEXT', value);
        return this;
    }
    lyrics(value, lang, id) {
        this.rawBuilder.idLangText('USLT', value, lang, id);
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
    key(value) {
        this.rawBuilder.text('TKEY', value);
        return this;
    }
    copyright(value) {
        this.rawBuilder.text('TCOP', value);
        return this;
    }
    isrc(value) {
        this.rawBuilder.text('TSRC', value);
        return this;
    }
    barcode(value) {
        this.rawBuilder.idText('TXXX', 'BARCODE', value);
        return this;
    }
    asin(value) {
        this.rawBuilder.idText('TXXX', 'ASIN', value);
        return this;
    }
    catalogNumber(value) {
        this.rawBuilder.idText('TXXX', 'CATALOGNUMBER', value);
        return this;
    }
    script(value) {
        this.rawBuilder.idText('TXXX', 'SCRIPT', value);
        return this;
    }
    license(value) {
        this.rawBuilder.idText('TXXX', 'LICENSE', value);
        return this;
    }
    website(value) {
        this.rawBuilder.text('WOAR', value);
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
    writer(value) {
        this.rawBuilder.idText('TXXX', 'Writer', value);
        return this;
    }
    custom(id, value) {
        this.rawBuilder.idText('TXXX', 'VERSION', value);
        return this;
    }
    musicianCredit(group, value) {
        this.rawBuilder.keyTextList('TMCL', group, value);
        return this;
    }
    involved(group, value) {
        this.rawBuilder.keyTextList('TIPL', group, value);
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
    mbAlbumReleaseCountry(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Release Country', value);
        return this;
    }
    mbTrackID(value) {
        this.rawBuilder.idText('UFID', 'http://musicbrainz.org', value);
        return this;
    }
    mbReleaseTrackID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Release Track Id', value);
        return this;
    }
    mbAlbumID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Id', value);
        return this;
    }
    mbOriginalAlbumID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Original Album Id', value);
        return this;
    }
    mbArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Artist Id', value);
        return this;
    }
    mbOriginalArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Original Artist Id', value);
        return this;
    }
    mbAlbumArtistID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Album Artist Id', value);
        return this;
    }
    mbReleaseGroupID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Release Group Id', value);
        return this;
    }
    mbWorkID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Work Id', value);
        return this;
    }
    mbTRMID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz TRM Id', value);
        return this;
    }
    mbDiscID(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Disc Id', value);
        return this;
    }
    acoustidID(value) {
        this.rawBuilder.idText('TXXX', 'Acoustid Id', value);
        return this;
    }
    acoustidFingerprint(value) {
        this.rawBuilder.idText('TXXX', 'Acoustid Fingerprint', value);
        return this;
    }
    musicIPPUID(value) {
        this.rawBuilder.idText('TXXX', 'MusicIP PUID', value);
        return this;
    }
    comment(id, value) {
        this.rawBuilder.idText('COMM', id, value);
        return this;
    }
    trackLength(value) {
        this.rawBuilder.text('TLEN', value ? value.toString() : undefined);
        return this;
    }
    mbTrackDisambiguation(value) {
        this.rawBuilder.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
        return this;
    }
    picture(pictureType, description, mimeType, binary) {
        this.rawBuilder.picture('APIC', pictureType, description, mimeType, binary);
        return this;
    }
    chapter(id, start, end, offset, offsetEnd, subframes) {
        this.rawBuilder.chapter('CHAP', id, start, end, offset, offsetEnd, subframes);
        return this;
    }
    priv(id, binary) {
        this.rawBuilder.idBin('PRIV', id, binary);
        return this;
    }
}
exports.ID3V24TagBuilder = ID3V24TagBuilder;
//# sourceMappingURL=id3v2_builder.js.map