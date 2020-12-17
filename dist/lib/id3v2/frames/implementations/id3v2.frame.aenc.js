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
exports.FrameAENC = void 0;
const encodings_1 = require("../../../common/encodings");
exports.FrameAENC = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
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
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeStringTerminated(value.id, encodings_1.ascii);
        yield stream.writeUInt2Byte(value.previewStart);
        yield stream.writeUInt2Byte(value.previewLength);
        yield stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.aenc.js.map