import { ID3V2TagBuilder } from './id3v2.builder.v2.js';
const NON_V23_ENCODINGS = new Set(['utf8', 'utf-8', 'utf16-be', 'utf16be', 'utf-8-bom']);
export class ID3V23TagBuilder extends ID3V2TagBuilder {
    constructor(encoding) {
        let enc = encoding;
        if (enc) {
            const e = enc.toLowerCase();
            if (NON_V23_ENCODINGS.has(e)) {
                enc = 'ucs2';
            }
        }
        super(enc);
    }
    version() {
        return 3;
    }
    rev() {
        return 0;
    }
    albumSort(value) {
        this.idText('TXXX', 'ALBUMSORT', value);
        return this;
    }
    albumArtistSort(value) {
        this.idText('TXXX', 'ALBUMARTISTSORT', value);
        return this;
    }
    artistSort(value) {
        this.idText('TXXX', 'ARTISTSORT', value);
        return this;
    }
    composerSort(value) {
        this.idText('TXXX', 'COMPOSERSORT', value);
        return this;
    }
    date(value) {
        this.text('TYER', value);
        return this;
    }
    involved(group, value) {
        this.keyTextList('IPLS', group, value);
        return this;
    }
    originalDate(value) {
        this.text('TORY', value);
        return this;
    }
    titleSort(value) {
        this.idText('TXXX', 'TITLESORT', value);
        return this;
    }
}
ID3V23TagBuilder.encodings = {
    iso88591: 'iso-8859-1',
    ucs2: 'ucs2'
};
//# sourceMappingURL=id3v2.builder.v23.js.map