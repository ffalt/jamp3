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
exports.FrameGEOB = void 0;
const encodings_1 = require("../../../common/encodings");
const id3v2_frame_write_1 = require("../id3v2.frame.write");
exports.FrameGEOB = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const mimeType = reader.readStringTerminated(encodings_1.ascii);
        const filename = reader.readStringTerminated(enc);
        const contentDescription = reader.readStringTerminated(enc);
        const bin = reader.rest();
        const value = { mimeType, filename, contentDescription, bin };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const enc = id3v2_frame_write_1.getWriteTextEncoding(frame, head, defaultEncoding);
        yield stream.writeEncoding(enc);
        yield stream.writeStringTerminated(value.mimeType, encodings_1.ascii);
        yield stream.writeStringTerminated(value.filename, enc);
        yield stream.writeStringTerminated(value.contentDescription, enc);
        yield stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.generic-object.js.map