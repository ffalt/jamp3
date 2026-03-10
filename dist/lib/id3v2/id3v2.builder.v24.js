"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3V24TagBuilder = void 0;
const id3v2_builder_v2_1 = require("./id3v2.builder.v2");
class ID3V24TagBuilder extends id3v2_builder_v2_1.ID3V2TagBuilder {
    constructor(encoding) {
        super(encoding);
    }
    version() {
        return 4;
    }
    rev() {
        return 0;
    }
    albumSort(value) {
        this.text('TSOA', value);
        return this;
    }
    albumArtistSort(value) {
        this.text('TSO2', value);
        return this;
    }
    artistSort(value) {
        this.text('TSOP', value);
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
    composerSort(value) {
        this.text('TSOC', value);
        return this;
    }
    date(value) {
        this.text('TDRC', value);
        return this;
    }
    discSubtitle(value) {
        this.text('TSST', value);
        return this;
    }
    encodingDate(value) {
        this.text('TDEN', value);
        return this;
    }
    involved(group, value) {
        this.keyTextList('TIPL', group, value);
        return this;
    }
    isPodcast(value) {
        if (value !== undefined) {
            this.number('PCST', value === 1 || value === 'true' || value === true ? 1 : 0);
        }
        return this;
    }
    mood(value) {
        this.text('TMOO', value);
        return this;
    }
    movement(value) {
        this.text('MVNM', value);
        return this;
    }
    movementNr(nr, total) {
        this.nrAndTotal('MVIN', nr, total);
        return this;
    }
    musicianCredit(group, value) {
        this.keyTextList('TMCL', group, value);
        return this;
    }
    originalDate(value) {
        this.text('TDOR', value);
        return this;
    }
    podcastDescription(value) {
        this.text('TDES', value);
        return this;
    }
    podcastFeedURL(value) {
        this.text('WFED', value);
        return this;
    }
    podcastKeywords(value) {
        this.text('TKWD', value);
        return this;
    }
    podcastURL(value) {
        this.text('TGID', value);
        return this;
    }
    productionNotice(value) {
        this.text('TPRO', value);
        return this;
    }
    relativeVolumeAdjustment2(id, channels) {
        this.rawBuilder.relativeVolumeAdjustment2('RVA2', id, channels);
        return this;
    }
    releaseDate(value) {
        this.text('TDRL', value);
        return this;
    }
    replayGainAdjustment(peak, radioAdjustment, audiophileAdjustment) {
        this.rawBuilder.replayGainAdjustment('RGAD', peak, radioAdjustment, audiophileAdjustment);
        return this;
    }
    taggingDate(value) {
        this.text('TDTG', value);
        return this;
    }
    titleSort(value) {
        this.text('TSOT', value);
        return this;
    }
    work(value) {
        this.text('GRP1', value);
        return this;
    }
    clearChapters() {
        this.rawBuilder.clearFrames('CHAP');
        return this;
    }
    clearChapterTOCs() {
        this.rawBuilder.clearFrames('CTOC');
        return this;
    }
    clearRelativeVolumeAdjustment2() {
        this.rawBuilder.clearFrames('RVA2');
        return this;
    }
    clearReplayGainAdjustment() {
        this.rawBuilder.clearFrames('RGAD');
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