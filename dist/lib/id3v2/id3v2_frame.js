"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const encodings_1 = require("../common/encodings");
const utils_1 = require("../common/utils");
const id3v2_frames_1 = require("./id3v2_frames");
const id3v2__consts_1 = require("./id3v2__consts");
const ascii = encodings_1.Encodings['ascii'];
const binary = encodings_1.Encodings['binary'];
const utf8 = encodings_1.Encodings['utf-8'];
function getWriteTextEncoding(frame, head, defaultEncoding) {
    let encoding = (frame.head ? frame.head.encoding : undefined) || defaultEncoding;
    if (!encoding || !encodings_1.Encodings[encoding]) {
        encoding = (head.ver === 4) ? 'utf-8' : 'ucs2';
    }
    return encodings_1.Encodings[encoding] || ascii;
}
exports.FrameIdAscii = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const id = reader.readStringTerminated(ascii);
        const text = reader.readStringTerminated(ascii);
        const value = { id, text };
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, ascii);
        stream.writeString(value.text, ascii);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameLangDescText = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const language = utils_1.removeZeroString(reader.readString(3, ascii)).trim();
        const id = reader.readStringTerminated(enc);
        const text = reader.readStringTerminated(enc);
        const value = { id, language, text };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeAsciiString(value.language || '', 3);
        stream.writeStringTerminated(value.id || '', enc);
        stream.writeString(value.text, enc);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameLangText = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const language = utils_1.removeZeroString(reader.readString(3, ascii)).trim();
        const text = reader.readStringTerminated(enc);
        const value = { language, text };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeAsciiString(value.language || '', 3);
        stream.writeString(value.text, enc);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameIdBin = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const id = reader.readStringTerminated(ascii);
        const bin = reader.rest();
        const value = { id, bin };
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, ascii);
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return '<bin ' + value.bin.length + 'bytes>';
        }
        return null;
    }
};
exports.FrameCTOC = {
    parse: (reader, frame, head) => __awaiter(this, void 0, void 0, function* () {
        const id = reader.readStringTerminated(ascii);
        const bits = reader.readBitsByte();
        const ordered = utils_1.isBitSetAt(bits, 0);
        const topLevel = utils_1.isBitSetAt(bits, 1);
        let entrycount = reader.readBitsByte();
        if (entrycount < 0) {
            entrycount = (entrycount * -1) + 2;
        }
        const children = [];
        while (reader.hasData()) {
            const childId = reader.readStringTerminated(ascii);
            children.push(childId);
            if (entrycount <= children.length) {
                break;
            }
        }
        const bin = reader.rest();
        const subframes = yield id3v2_frames_1.readSubFrames(bin, head);
        const value = { id, ordered, topLevel, children };
        return { value, encoding: ascii, subframes };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, ascii);
        stream.writeByte((value.ordered ? 1 : 0) + ((value.topLevel ? 1 : 0) * 2));
        stream.writeByte(value.children.length);
        value.children.forEach(childId => {
            stream.writeStringTerminated(childId, ascii);
        });
        if (frame.subframes) {
            yield id3v2_frames_1.writeSubFrames(frame.subframes, stream, head, defaultEncoding);
        }
    }),
    simplify: (value) => {
        if (value && value.children && value.children.length > 0) {
            return '<toc ' + value.children.length + 'entries>';
        }
        return null;
    }
};
exports.FrameCHAP = {
    parse: (reader, frame, head) => __awaiter(this, void 0, void 0, function* () {
        const id = reader.readStringTerminated(ascii);
        const start = reader.readUInt4Byte();
        const end = reader.readUInt4Byte();
        const offset = reader.readUInt4Byte();
        const offsetEnd = reader.readUInt4Byte();
        const bin = reader.rest();
        const subframes = yield id3v2_frames_1.readSubFrames(bin, head);
        const value = { id, start, end, offset, offsetEnd };
        return { value, encoding: ascii, subframes };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = encodings_1.Encodings['ascii'];
        stream.writeStringTerminated(value.id, enc);
        stream.writeUInt4Byte(value.start);
        stream.writeUInt4Byte(value.end);
        stream.writeUInt4Byte(value.offset);
        stream.writeUInt4Byte(value.offsetEnd);
        if (frame.subframes) {
            yield id3v2_frames_1.writeSubFrames(frame.subframes, stream, head, defaultEncoding);
        }
    }),
    simplify: (value) => {
        if (value && value.id && value.id.length > 0) {
            return '<chapter ' + value.id + '>';
        }
        return null;
    }
};
exports.FramePic = {
    parse: (reader, frame, head) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        let mimeType;
        if (head.ver <= 2) {
            mimeType = reader.readString(3, ascii);
        }
        else {
            mimeType = reader.readStringTerminated(ascii);
        }
        const pictureType = reader.readByte();
        const description = reader.readStringTerminated(enc);
        const value = { mimeType, pictureType: pictureType, description };
        if (mimeType === '-->') {
            value.url = reader.readStringTerminated(enc);
        }
        else {
            value.bin = reader.rest();
        }
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        if (head.ver <= 2) {
            if (value.url) {
                stream.writeString('-->', ascii);
            }
            else {
                stream.writeAsciiString(value.mimeType || '', 3);
            }
        }
        else {
            stream.writeStringTerminated(value.url ? value.url : (value.mimeType || ''), ascii);
        }
        stream.writeByte(value.pictureType);
        stream.writeStringTerminated(value.description, enc);
        if (value.url) {
            stream.writeString(value.url, enc);
        }
        else if (value.bin) {
            stream.writeBuffer(value.bin);
        }
    }),
    simplify: (value) => {
        if (value) {
            return '<pic ' + (id3v2__consts_1.ID3V2ValueTypes.pictureType[value.pictureType] || 'unknown') + ';' + value.mimeType + ';' +
                (value.bin ? value.bin.length + 'bytes' : value.url) + '>';
        }
        return null;
    }
};
exports.FrameText = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: { text: '' }, encoding: utf8 };
        }
        const enc = reader.readEncoding();
        const text = reader.readStringTerminated(enc);
        const value = { text };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeString(value.text, enc);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameTextConcatList = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: { text: '' }, encoding: utf8 };
        }
        const enc = reader.readEncoding();
        let text = reader.readStringTerminated(enc);
        while (reader.hasData()) {
            const appendtext = reader.readStringTerminated(enc);
            if (appendtext.length > 0) {
                text += '/' + appendtext;
            }
        }
        const value = { text };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeString(value.text, enc);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameTextList = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const list = [];
        while (reader.hasData()) {
            const text = reader.readStringTerminated(enc);
            if (text.length > 0) {
                list.push(text);
            }
        }
        const value = { list };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        value.list.forEach((entry, index) => {
            stream.writeString(entry, enc);
            if (index !== value.list.length - 1) {
                stream.writeTerminator(enc);
            }
        });
    }),
    simplify: (value) => {
        if (value && value.list && value.list.length > 0) {
            return value.list.join(' / ');
        }
        return null;
    }
};
exports.FrameAsciiValue = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const text = reader.readStringTerminated(ascii);
        const value = { text };
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeString(value.text, ascii);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameIdText = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const id = reader.readStringTerminated(enc);
        const text = reader.readStringTerminated(enc);
        const value = { id, text };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeStringTerminated(value.id, enc);
        stream.writeString(value.text, enc);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
exports.FrameMusicCDId = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        const value = { bin: frame.data };
        return { value, encoding: binary };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return '<bin ' + value.bin.length + 'bytes>';
        }
        return null;
    }
};
exports.FramePlayCounter = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        let num = 0;
        try {
            num = reader.readUInt(frame.data.length);
        }
        catch (e) {
        }
        const value = { num };
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const byteLength = utils_1.neededStoreBytes(value.num, 4);
        stream.writeUInt(value.num, byteLength);
    }),
    simplify: (value) => {
        if (value && value.num !== undefined) {
            return value.num.toString();
        }
        return null;
    }
};
exports.FramePopularimeter = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const email = reader.readStringTerminated(ascii);
        const rating = reader.readByte();
        let count = 0;
        if (reader.hasData()) {
            try {
                count = reader.readUInt(reader.unread());
            }
            catch (e) {
                count = 0;
            }
        }
        const value = { count, rating, email };
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.email, ascii);
        stream.writeByte(value.rating);
        if (value.count > 0) {
            const byteLength = utils_1.neededStoreBytes(value.count, 4);
            stream.writeUInt(value.count, byteLength);
        }
    }),
    simplify: (value) => {
        if (value && value.email !== undefined) {
            return value.email + (value.count !== undefined ? ';count=' + value.count : '') + (value.rating !== undefined ? ';rating=' + value.rating : '');
        }
        return null;
    }
};
exports.FrameRelativeVolumeAdjustment = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const flags = reader.readBitsByte();
        const bitLength = reader.readBitsByte();
        const byteLength = bitLength / 8;
        if (byteLength <= 1 || byteLength > 4) {
            return Promise.reject(Error('Unsupported description bit size of: ' + bitLength));
        }
        let val = reader.readUInt(byteLength);
        const right = (utils_1.isBitSetAt(flags, 0) || (val === 0) ? 1 : -1) * val;
        val = reader.readUInt(byteLength);
        const left = (utils_1.isBitSetAt(flags, 1) || (val === 0) ? 1 : -1) * val;
        const value = {
            right, left
        };
        if (reader.unread() >= byteLength * 2) {
            value.peakRight = reader.readUInt(byteLength);
            value.peakLeft = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.peakRight = reader.readUInt(byteLength);
            value.peakLeft = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.rightBack = (utils_1.isBitSetAt(flags, 4) ? 1 : -1) * reader.readUInt(byteLength);
            value.leftBack = (utils_1.isBitSetAt(flags, 8) ? 1 : -1) * reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.peakRightBack = reader.readUInt(byteLength);
            value.peakLeftBack = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.center = (utils_1.isBitSetAt(flags, 10) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakCenter = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.bass = (utils_1.isBitSetAt(flags, 20) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakBass = reader.readUInt(byteLength);
        }
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const flags = [
            0,
            0,
            value.bass !== undefined ? (value.bass >= 0 ? 0 : 1) : 0,
            value.center !== undefined ? (value.center >= 0 ? 0 : 1) : 0,
            value.leftBack !== undefined ? (value.leftBack >= 0 ? 0 : 1) : 0,
            value.rightBack !== undefined ? (value.rightBack >= 0 ? 0 : 1) : 0,
            value.left < 0 ? 0 : 1,
            value.right < 0 ? 0 : 1
        ];
        stream.writeBitsByte(flags);
        let byteLength = 2;
        Object.keys(value).forEach(key => {
            const num = value[key];
            if (!isNaN(num)) {
                byteLength = Math.max(utils_1.neededStoreBytes(Math.abs(num), 2), byteLength);
            }
        });
        stream.writeByte(byteLength * 8);
        stream.writeUInt(Math.abs(value.right), byteLength);
        stream.writeUInt(Math.abs(value.left), byteLength);
        if (value.peakRight !== undefined && value.peakLeft !== undefined) {
            stream.writeUInt(value.peakRight, byteLength);
            stream.writeUInt(value.peakLeft, byteLength);
            if (value.rightBack !== undefined && value.leftBack !== undefined) {
                stream.writeUInt(Math.abs(value.rightBack), byteLength);
                stream.writeUInt(Math.abs(value.leftBack), byteLength);
                if (value.peakRightBack !== undefined && value.peakLeftBack !== undefined) {
                    stream.writeUInt(value.peakRightBack, byteLength);
                    stream.writeUInt(value.peakLeftBack, byteLength);
                    if (value.center !== undefined && value.peakCenter !== undefined) {
                        stream.writeUInt(Math.abs(value.center), byteLength);
                        stream.writeUInt(value.peakLeftBack, byteLength);
                        if (value.bass !== undefined && value.peakBass !== undefined) {
                            stream.writeUInt(Math.abs(value.center), byteLength);
                            stream.writeUInt(value.peakCenter, byteLength);
                        }
                    }
                }
            }
        }
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameRelativeVolumeAdjustment2 = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const id = reader.readStringTerminated(ascii);
        const channels = [];
        while (reader.unread() >= 3) {
            const type = reader.readByte();
            const adjustment = reader.readSInt(2);
            const channel = { type, adjustment };
            while (reader.unread() >= 1) {
                const bitspeakvolume = reader.readByte();
                const bytesInPeak = bitspeakvolume > 0 ? Math.ceil(bitspeakvolume / 8) : 0;
                if (bytesInPeak > 0 && reader.unread() >= bytesInPeak) {
                    channel.peak = reader.readUInt(bytesInPeak);
                }
            }
            channels.push(channel);
        }
        const value = { id, channels };
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, ascii);
        value.channels.forEach(channel => {
            stream.writeByte(channel.type);
            stream.writeSInt(channel.adjustment, 2);
            const bytes = channel.peak === undefined ? 0 : utils_1.neededStoreBytes(channel.peak, 2);
            stream.writeUInt(bytes * 8, 2);
            if (channel.peak !== undefined && bytes > 0) {
                stream.writeUInt(channel.peak, bytes);
            }
        });
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FramePartOfCompilation = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const intAsString = reader.readStringTerminated(enc);
        const i = parseInt(intAsString, 10).toString();
        const value = { bool: i === '1' };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeStringTerminated(value.bool ? '1' : '0', enc);
    }),
    simplify: (value) => {
        if (value) {
            return value.bool ? 'true' : 'false';
        }
        return null;
    }
};
exports.FramePCST = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const num = reader.readUInt4Byte();
        const value = { num };
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeUInt4Byte(value.num);
    }),
    simplify: (value) => {
        return value.num.toString();
    }
};
exports.FrameETCO = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const format = reader.readBitsByte();
        const events = [];
        while (reader.unread() >= 5) {
            const type = reader.readBitsByte();
            const timestamp = reader.readUInt4Byte();
            events.push({ type, timestamp });
        }
        const value = { format, events };
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeByte(value.format);
        (value.events || []).forEach(event => {
            stream.writeUByte(event.type);
            stream.writeUInt4Byte(event.timestamp);
        });
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameAENC = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const id = reader.readStringTerminated(ascii);
        if (reader.unread() < 2) {
            return Promise.reject(Error('Not enough data'));
        }
        const previewStart = reader.readUInt2Byte();
        if (reader.unread() < 2) {
            return Promise.reject(Error('Not enough data'));
        }
        const previewLength = reader.readUInt2Byte();
        const bin = reader.rest();
        const value = { id, previewStart, previewLength, bin };
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, ascii);
        stream.writeUInt2Byte(value.previewStart);
        stream.writeUInt2Byte(value.previewLength);
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameLINK = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const url = reader.readStringTerminated(ascii);
        const id = reader.readStringTerminated(ascii);
        const value = { url, id, additional: [] };
        while (reader.hasData()) {
            const additional = reader.readStringTerminated(ascii);
            if (additional.length > 0) {
                value.additional.push(additional);
            }
        }
        return { value, encoding: ascii };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.url, ascii);
        stream.writeStringTerminated(value.id, ascii);
        value.additional.forEach(additional => {
            stream.writeStringTerminated(additional, ascii);
        });
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameSYLT = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const language = utils_1.removeZeroString(reader.readString(3, ascii)).trim();
        const timestampFormat = reader.readByte();
        const contentType = reader.readByte();
        const id = reader.readStringTerminated(enc);
        const events = [];
        while (reader.hasData()) {
            const text = reader.readStringTerminated(enc);
            if (reader.unread() >= 4) {
                const timestamp = reader.readUInt4Byte();
                events.push({ timestamp, text });
            }
        }
        const value = { language, timestampFormat, contentType, id, events };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeAsciiString(value.language, 3);
        stream.writeByte(value.timestampFormat);
        stream.writeByte(value.contentType);
        stream.writeStringTerminated(value.id, enc);
        value.events.forEach(event => {
            stream.writeStringTerminated(event.text, enc);
            stream.writeUInt4Byte(event.timestamp);
        });
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameGEOB = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const mimeType = reader.readStringTerminated(ascii);
        const filename = reader.readStringTerminated(enc);
        const contentDescription = reader.readStringTerminated(enc);
        const bin = reader.rest();
        const value = { mimeType, filename, contentDescription, bin };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeStringTerminated(value.mimeType, ascii);
        stream.writeStringTerminated(value.filename, enc);
        stream.writeStringTerminated(value.contentDescription, enc);
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameRGAD = {
    parse: (reader) => __awaiter(this, void 0, void 0, function* () {
        const peak = reader.readUInt4Byte();
        const radioAdjustment = reader.readSInt2Byte();
        const audiophileAdjustment = reader.readSInt2Byte();
        const value = { peak, radioAdjustment, audiophileAdjustment };
        return { value };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeUInt4Byte(value.peak);
        stream.writeSInt2Byte(value.radioAdjustment);
        stream.writeSInt2Byte(value.audiophileAdjustment);
    }),
    simplify: (value) => {
        return null;
    }
};
exports.FrameUnknown = {
    parse: (reader, frame) => __awaiter(this, void 0, void 0, function* () {
        const value = { bin: frame.data };
        return { value, encoding: binary };
    }),
    write: (frame, stream) => __awaiter(this, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return '<bin ' + value.bin.length + 'bytes>';
        }
        return null;
    }
};
//# sourceMappingURL=id3v2_frame.js.map