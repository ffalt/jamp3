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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FramePic = void 0;
const encodings_1 = require("../../../common/encodings");
const id3v2_consts_1 = require("../../id3v2.consts");
const id3v2_frame_write_1 = require("../id3v2.frame.write");
exports.FramePic = {
    parse: (reader, frame, head) => __awaiter(void 0, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        let mimeType;
        if (head.ver <= 2) {
            mimeType = reader.readString(3, encodings_1.ascii);
        }
        else {
            mimeType = reader.readStringTerminated(encodings_1.ascii);
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
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const enc = (0, id3v2_frame_write_1.getWriteTextEncoding)(frame, head, defaultEncoding);
        yield stream.writeEncoding(enc);
        if (head.ver <= 2) {
            if (value.url) {
                yield stream.writeString('-->', encodings_1.ascii);
            }
            else {
                yield stream.writeAsciiString(value.mimeType || '', 3);
            }
        }
        else {
            yield stream.writeStringTerminated(value.url ? value.url : (value.mimeType || ''), encodings_1.ascii);
        }
        yield stream.writeByte(value.pictureType);
        yield stream.writeStringTerminated(value.description, enc);
        if (value.url) {
            yield stream.writeString(value.url, enc);
        }
        else if (value.bin) {
            yield stream.writeBuffer(value.bin);
        }
    }),
    simplify: (value) => {
        if (value) {
            return `<pic ${id3v2_consts_1.ID3V2ValueTypes.pictureType[value.pictureType] || 'unknown'};${value.mimeType};${value.bin ? value.bin.length + 'bytes' : value.url}>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.pic.js.map