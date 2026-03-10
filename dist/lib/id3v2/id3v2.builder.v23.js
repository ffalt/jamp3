"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3V23TagBuilder = void 0;
const id3v2_builder_v2_1 = require("./id3v2.builder.v2");
class ID3V23TagBuilder extends id3v2_builder_v2_1.ID3V2TagBuilder {
    constructor(encoding) {
        let enc = encoding;
        if (enc) {
            const e = enc.toLowerCase();
            if (e === 'utf8' || e === 'utf-8' || e === 'utf16-be' || e === 'utf16be' || e === 'utf-8-bom') {
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
exports.ID3V23TagBuilder = ID3V23TagBuilder;
ID3V23TagBuilder.encodings = {
    iso88591: 'iso-8859-1',
    ucs2: 'ucs2'
};
//# sourceMappingURL=id3v2.builder.v23.js.map