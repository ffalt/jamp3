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
exports.FrameCHAP = void 0;
const encodings_1 = require("../../../common/encodings");
const id3v2_frame_write_1 = require("../id3v2.frame.write");
const id3v2_frame_read_1 = require("../id3v2.frame.read");
exports.FrameCHAP = {
    parse: (reader, frame, head) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
        const start = reader.readUInt4Byte();
        const end = reader.readUInt4Byte();
        const offset = reader.readUInt4Byte();
        const offsetEnd = reader.readUInt4Byte();
        const bin = reader.rest();
        const subframes = yield id3v2_frame_read_1.readSubFrames(bin, head);
        const value = { id, start, end, offset, offsetEnd };
        return { value, encoding: encodings_1.ascii, subframes };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, encodings_1.ascii);
        stream.writeUInt4Byte(value.start);
        stream.writeUInt4Byte(value.end);
        stream.writeUInt4Byte(value.offset);
        stream.writeUInt4Byte(value.offsetEnd);
        if (frame.subframes) {
            yield id3v2_frame_write_1.writeRawSubFrames(frame.subframes, stream, head, defaultEncoding);
        }
    }),
    simplify: (value) => {
        if (value && value.id && value.id.length > 0) {
            return '<chapter ' + value.id + '>';
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.chapter.js.map