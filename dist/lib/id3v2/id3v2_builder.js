"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ID3V2RawBuilder {
    constructor(encoding) {
        this.encoding = encoding;
        this.frameValues = {};
    }
    build() {
        return this.frameValues;
    }
    replace(key, frame) {
        this.frameValues[key] = [frame];
    }
    add(key, frame) {
        this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
    }
    head() {
        return {
            size: 0,
            statusFlags: {},
            formatFlags: {},
            encoding: this.encoding
        };
    }
    text(key, text) {
        if (text) {
            const frame = { id: key, value: { text }, head: this.head() };
            this.replace(key, frame);
        }
    }
    number(key, num) {
        if (num !== undefined) {
            const frame = { id: key, value: { num }, head: this.head() };
            this.replace(key, frame);
        }
    }
    idText(key, id, value) {
        if (value) {
            const frame = { id: key, value: { id, text: value }, head: this.head() };
            const list = (this.frameValues[key] || []).filter(f => f.value.id !== id);
            this.frameValues[key] = list.concat([frame]);
        }
    }
    nrAndTotal(key, value, total) {
        if (value) {
            const text = value.toString() + (total ? '/' + total.toString() : '');
            const frame = { id: key, value: { text }, head: this.head() };
            this.replace(key, frame);
        }
    }
    keyTextList(key, group, value) {
        if (value) {
            const frames = (this.frameValues[key] || []);
            const frame = (frames.length > 0) ? frames[0] : { id: key, value: { list: [] }, head: this.head() };
            frame.value.list.push(group);
            frame.value.list.push(value);
            this.replace(key, frame);
        }
    }
    bool(key, bool) {
        if (bool !== undefined) {
            const frame = { id: key, value: { bool }, head: this.head() };
            this.replace(key, frame);
        }
    }
    idLangText(key, value, lang, id) {
        if (value) {
            id = id || '';
            lang = lang || '';
            const list = (this.frameValues[key] || [])
                .filter(f => f.value.id !== id);
            const frame = { id: key, value: { id, language: lang, text: value }, head: this.head() };
            this.frameValues[key] = list.concat([frame]);
        }
    }
    picture(key, pictureType, description, mimeType, binary) {
        const frame = {
            id: key,
            value: {
                description: description || '',
                pictureType,
                bin: binary,
                mimeType: mimeType
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    idBin(key, id, binary) {
        const frame = {
            id: key,
            value: { id, bin: binary },
            head: this.head()
        };
        this.add(key, frame);
    }
    chapter(key, chapterID, start, end, offset, offsetEnd, subframes) {
        const frame = {
            id: key,
            value: { id: chapterID, start, end, offset, offsetEnd },
            subframes, head: this.head()
        };
        this.add(key, frame);
    }
    synchronisedLyrics(key, id, language, timestampFormat, contentType, events) {
        const frame = {
            id: key,
            value: { id, language, timestampFormat, contentType, events },
            head: this.head()
        };
        this.add(key, frame);
    }
    relativeVolumeAdjustment(key, right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass) {
        const frame = {
            id: key,
            value: {
                right, left,
                peakRight, peakLeft,
                rightBack, leftBack,
                peakRightBack, peakLeftBack,
                center, peakCenter,
                bass, peakBass
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    relativeVolumeAdjustment2(key, id, channels) {
        const frame = {
            id: key,
            value: {
                id,
                channels
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    eventTimingCodes(key, timeStampFormat, events) {
        const frame = {
            id: key,
            value: {
                format: timeStampFormat,
                events
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    unknown(key, binary) {
        const frame = {
            id: key,
            value: {
                bin: binary
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    object(key, filename, mimeType, contentDescription, bin) {
        const frame = {
            id: key,
            value: {
                filename, mimeType, contentDescription, bin
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    popularimeter(key, email, rating, count) {
        const frame = {
            id: key,
            value: {
                email, rating, count
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    audioEncryption(key, id, previewStart, previewLength, bin) {
        const frame = {
            id: key,
            value: {
                id, previewStart, previewLength, bin
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    linkedInformation(key, id, url, additional) {
        const frame = {
            id: key,
            value: {
                id, url, additional
            },
            head: this.head()
        };
        this.add(key, frame);
    }
    langText(key, language, text) {
        const frame = {
            id: key,
            value: { language, text },
            head: this.head()
        };
        this.add(key, frame);
    }
    replayGainAdjustment(key, peak, radioAdjustment, audiophileAdjustment) {
        const frame = {
            id: key,
            value: { peak, radioAdjustment, audiophileAdjustment },
            head: this.head()
        };
        this.add(key, frame);
    }
    chapterTOC(key, id, ordered, topLevel, children) {
        const frame = {
            id: key,
            value: { id, ordered, topLevel, children },
            head: this.head()
        };
        this.add(key, frame);
    }
}
exports.ID3V2RawBuilder = ID3V2RawBuilder;
//# sourceMappingURL=id3v2_builder.js.map