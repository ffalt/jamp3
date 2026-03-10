"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utf8 = exports.binary = exports.ascii = exports.Encodings = void 0;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const buffer_1 = require("./buffer");
exports.Encodings = {};
exports.Encodings['iso-8859-1'] = {
    name: 'iso-8859-1',
    byte: 0,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: s => iconv_lite_1.default.encode(s, 'iso-8859-1'),
    decode: buffer => iconv_lite_1.default.decode(buffer, 'iso-8859-1')
};
exports.Encodings['ascii'] = exports.Encodings['iso-8859-1'];
exports.Encodings['binary'] = {
    name: 'binary',
    byte: 0,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: s => iconv_lite_1.default.encode(s, 'hex'),
    decode: buffer => iconv_lite_1.default.decode(buffer, 'hex')
};
exports.Encodings['ucs2'] = {
    name: 'ucs2',
    byte: 1,
    bom: [0xFF, 0xFE],
    terminator: buffer_1.BufferUtils.fromArray([0, 0]),
    encode: s => iconv_lite_1.default.encode(s, 'ucs2'),
    decode: buffer => {
        if ((buffer[0] === 0xFF) && (buffer[1] === 0xFE)) {
            return iconv_lite_1.default.decode(buffer.subarray(2), 'ucs2');
        }
        if ((buffer[0] === 0xFE) && (buffer[1] === 0xFF)) {
            return iconv_lite_1.default.decode(buffer.subarray(2), 'utf16-be');
        }
        let isAscii = true;
        for (const element of buffer) {
            if (element === 0) {
                isAscii = false;
                break;
            }
        }
        if (isAscii && buffer.length > 4) {
            return iconv_lite_1.default.decode(buffer, 'iso-8859-1');
        }
        return iconv_lite_1.default.decode(buffer, 'ucs2');
    }
};
exports.Encodings['ucs2-le'] = exports.Encodings['ucs2'];
exports.Encodings['ucs2le'] = exports.Encodings['ucs2'];
exports.Encodings['utf16-be'] = {
    name: 'utf16-be',
    byte: 2,
    terminator: buffer_1.BufferUtils.fromArray([0, 0]),
    encode: s => iconv_lite_1.default.encode(s, 'utf16-be'),
    decode: buffer => {
        if ((buffer[0] === 0xFE) && (buffer[1] === 0xFF)) {
            return iconv_lite_1.default.decode(buffer.subarray(2), 'utf16-be');
        }
        if ((buffer[0] === 0xFF) && (buffer[1] === 0xFE)) {
            return buffer.subarray(2).toString('ucs2');
        }
        return iconv_lite_1.default.decode(buffer, 'utf16-be');
    }
};
exports.Encodings['ucs2-be'] = exports.Encodings['utf16-be'];
exports.Encodings['utf16be'] = exports.Encodings['utf16-be'];
exports.Encodings['utf8'] = {
    name: 'utf8',
    byte: 3,
    terminator: buffer_1.BufferUtils.fromArray([0]),
    encode: s => iconv_lite_1.default.encode(s, 'utf8'),
    decode: buffer => {
        if ((buffer[0] === 0xEF) && ((buffer[1] === 0xBB) || (buffer[1] === 0xBF))) {
            return buffer.subarray(2).toString('utf8');
        }
        return buffer.toString('utf8');
    }
};
exports.Encodings['utf-8'] = exports.Encodings['utf8'];
exports.ascii = exports.Encodings['ascii'];
exports.binary = exports.Encodings['binary'];
exports.utf8 = exports.Encodings['utf8'];
//# sourceMappingURL=encodings.js.map