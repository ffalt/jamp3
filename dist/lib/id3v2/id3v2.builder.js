"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_builder_collect_1 = require("./id3v2.builder.collect");
class ID3V2RawBuilder extends id3v2_builder_collect_1.ID3V2FramesCollect {
    audioEncryption(key, id, previewStart, previewLength, bin) {
        this.addFrame(key, { id, previewStart, previewLength, bin });
    }
    bool(key, bool) {
        if (bool !== undefined) {
            this.replaceFrame(key, { bool });
        }
    }
    chapter(key, chapterID, start, end, offset, offsetEnd, subframes) {
        const frame = {
            id: key,
            value: { id: chapterID, start, end, offset, offsetEnd },
            subframes,
            head: this.head()
        };
        this.add(key, frame);
    }
    chapterTOC(key, id, ordered, topLevel, children) {
        this.addFrame(key, { id, ordered, topLevel, children });
    }
    eventTimingCodes(key, timeStampFormat, events) {
        this.addFrame(key, { format: timeStampFormat, events });
    }
    idBin(key, id, binary) {
        this.addFrame(key, { id, bin: binary });
    }
    idLangText(key, value, lang, id) {
        if (value) {
            this.addIDFrame(key, { id: id || '', language: lang || '', text: value });
        }
    }
    idText(key, id, value) {
        if (value) {
            this.addIDFrame(key, { id: id || '', text: value });
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
    langText(key, language, text) {
        this.addFrame(key, { language, text });
    }
    linkedInformation(key, id, url, additional) {
        this.addFrame(key, { id, url, additional });
    }
    nrAndTotal(key, value, total) {
        if (value) {
            const text = value.toString() + (total ? '/' + total.toString() : '');
            this.replaceFrame(key, { text });
        }
    }
    number(key, num) {
        if (num !== undefined) {
            this.replaceFrame(key, { num });
        }
    }
    object(key, filename, mimeType, contentDescription, bin) {
        this.addFrame(key, { filename, mimeType, contentDescription, bin });
    }
    picture(key, pictureType, description, mimeType, binary) {
        this.addFrame(key, { description: description || '', pictureType, bin: binary, mimeType: mimeType });
    }
    popularimeter(key, email, rating, count) {
        this.addFrame(key, { email, rating, count });
    }
    relativeVolumeAdjustment(key, right, left, peakRight, peakLeft, rightBack, leftBack, peakRightBack, peakLeftBack, center, peakCenter, bass, peakBass) {
        this.addFrame(key, {
            right, left, peakRight, peakLeft,
            rightBack, leftBack, peakRightBack, peakLeftBack,
            center, peakCenter, bass, peakBass
        });
    }
    relativeVolumeAdjustment2(key, id, channels) {
        this.addFrame(key, { id, channels });
    }
    replayGainAdjustment(key, peak, radioAdjustment, audiophileAdjustment) {
        this.addFrame(key, { peak, radioAdjustment, audiophileAdjustment });
    }
    synchronisedLyrics(key, id, language, timestampFormat, contentType, events) {
        this.addFrame(key, { id, language, timestampFormat, contentType, events });
    }
    text(key, text) {
        if (text) {
            this.replaceFrame(key, { text });
        }
    }
    unknown(key, binary) {
        this.addFrame(key, { bin: binary });
    }
}
exports.ID3V2RawBuilder = ID3V2RawBuilder;
//# sourceMappingURL=id3v2.builder.js.map