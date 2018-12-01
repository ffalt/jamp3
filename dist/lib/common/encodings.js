"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const buffer_1 = require("./buffer");
exports.Encodings = {};
exports.Encodings['iso-8859-1'] = {
    name: 'iso-8859-1',
    byte: 0,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: (s) => {
        return iconv_lite_1.default.encode(s, 'iso-8859-1');
    },
    decode: (buf) => {
        return iconv_lite_1.default.decode(buf, 'iso-8859-1');
    }
};
exports.Encodings['ascii'] = exports.Encodings['iso-8859-1'];
exports.Encodings['binary'] = {
    name: 'binary',
    byte: 0,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: (s) => {
        return iconv_lite_1.default.encode(s, 'hex');
    },
    decode: (buf) => {
        return iconv_lite_1.default.decode(buf, 'hex');
    }
};
exports.Encodings['ucs2'] = {
    name: 'ucs2',
    byte: 1,
    bom: [0xFF, 0xFE],
    terminator: buffer_1.BufferUtils.fromArray([0, 0]),
    encode: (s) => {
        return iconv_lite_1.default.encode(s, 'ucs2');
    },
    decode: (buf) => {
        if ((buf[0] === 0xFF) && (buf[1] === 0xFE)) {
            return iconv_lite_1.default.decode(buf.slice(2), 'ucs2');
        }
        if ((buf[0] === 0xFE) && (buf[1] === 0xFF)) {
            return iconv_lite_1.default.decode(buf.slice(2), 'utf16-be');
        }
        let isAscii = true;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                isAscii = false;
                break;
            }
        }
        if (isAscii && buf.length > 4) {
            return iconv_lite_1.default.decode(buf, 'iso-8859-1');
        }
        return iconv_lite_1.default.decode(buf, 'ucs2');
    }
};
exports.Encodings['ucs2-le'] = exports.Encodings['ucs2'];
exports.Encodings['ucs2le'] = exports.Encodings['ucs2'];
exports.Encodings['utf16-be'] = {
    name: 'utf16-be',
    byte: 2,
    terminator: buffer_1.BufferUtils.fromArray([0, 0]),
    encode: (s) => {
        return iconv_lite_1.default.encode(s, 'utf16-be');
    },
    decode: (buf) => {
        if ((buf[0] === 0xFE) && (buf[1] === 0xFF)) {
            return iconv_lite_1.default.decode(buf.slice(2), 'utf16-be');
        }
        if ((buf[0] === 0xFF) && (buf[1] === 0xFE)) {
            return buf.slice(2).toString('ucs2');
        }
        return iconv_lite_1.default.decode(buf, 'utf16-be');
    }
};
exports.Encodings['ucs2-be'] = exports.Encodings['utf16-be'];
exports.Encodings['utf16be'] = exports.Encodings['utf16-be'];
exports.Encodings['utf8'] = {
    name: 'utf8',
    byte: 3,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: (s) => {
        return iconv_lite_1.default.encode(s, 'utf8');
    },
    decode: (buf) => {
        if ((buf[0] === 0xEF) && (buf[1] === 0xBB) && (buf[1] === 0xBF)) {
            buf = buf.slice(2);
        }
        return buf.toString('utf8');
    }
};
exports.Encodings['utf-8'] = exports.Encodings['utf8'];
//# sourceMappingURL=encodings.js.map