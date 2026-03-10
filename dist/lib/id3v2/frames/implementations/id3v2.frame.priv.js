"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FramePriv = void 0;
exports.bufToGuid = bufToGuid;
exports.guidToBuf = guidToBuf;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const encodings_1 = require("../../../common/encodings");
const id3v2_simplify_maps_1 = require("../../id3v2.simplify.maps");
function bufToGuid(buf) {
    const d1 = buf.readUInt32LE(0).toString(16).padStart(8, '0');
    const d2 = buf.readUInt16LE(4).toString(16).padStart(4, '0');
    const d3 = buf.readUInt16LE(6).toString(16).padStart(4, '0');
    const d4a = buf.slice(8, 10).toString('hex');
    const d4b = buf.slice(10, 16).toString('hex');
    return `${d1}-${d2}-${d3}-${d4a}-${d4b}`.toUpperCase();
}
function guidToBuf(guid) {
    const hex = guid.replaceAll('-', '');
    const buf = Buffer.alloc(16);
    buf.writeUInt32LE(Number.parseInt(hex.slice(0, 8), 16), 0);
    buf.writeUInt16LE(Number.parseInt(hex.slice(8, 12), 16), 4);
    buf.writeUInt16LE(Number.parseInt(hex.slice(12, 16), 16), 6);
    Buffer.from(hex.slice(16), 'hex').copy(buf, 8);
    return buf;
}
exports.FramePriv = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
        if (id3v2_simplify_maps_1.PRIVNumericOwners.has(id)) {
            const buf = reader.rest();
            const num = buf.length >= 4 ? buf.readUInt32LE(0) : 0;
            const value = { id, num };
            return { value, encoding: encodings_1.ascii };
        }
        if (id3v2_simplify_maps_1.PRIVGuidOwners.has(id)) {
            const buf = reader.rest();
            const guid = buf.length >= 16 ? bufToGuid(buf) : '00000000-0000-0000-0000-000000000000';
            const value = { id, guid };
            return { value, encoding: encodings_1.ascii };
        }
        if (id3v2_simplify_maps_1.PRIVWideStringOwners.has(id)) {
            const buf = reader.rest();
            let end = buf.length;
            while (end >= 2 && buf[end - 2] === 0 && buf[end - 1] === 0) {
                end -= 2;
            }
            const text = iconv_lite_1.default.decode(buf.slice(0, end), 'ucs2');
            const value = { id, text };
            return { value, encoding: encodings_1.ascii };
        }
        const bin = reader.rest();
        const value = { id, bin };
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeStringTerminated(value.id, encodings_1.ascii);
        if ('num' in value) {
            const buf = Buffer.alloc(4);
            buf.writeUInt32LE(value.num, 0);
            yield stream.writeBuffer(buf);
        }
        else if ('guid' in value) {
            yield stream.writeBuffer(guidToBuf(value.guid));
        }
        else if ('text' in value) {
            yield stream.writeBuffer(iconv_lite_1.default.encode(value.text, 'ucs2'));
            yield stream.writeBuffer(Buffer.from([0, 0]));
        }
        else {
            yield stream.writeBuffer(value.bin);
        }
    }),
    simplify: (value) => {
        if (!value) {
            return null;
        }
        if ('num' in value) {
            return value.num.toString();
        }
        if ('guid' in value) {
            return value.guid;
        }
        if ('text' in value) {
            return value.text || null;
        }
        if (value.bin && value.bin.length > 0) {
            return `<bin ${value.bin.length}bytes>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.priv.js.map