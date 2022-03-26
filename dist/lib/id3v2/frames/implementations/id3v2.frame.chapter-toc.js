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
exports.FrameCTOC = void 0;
const encodings_1 = require("../../../common/encodings");
const utils_1 = require("../../../common/utils");
const id3v2_frame_write_1 = require("../id3v2.frame.write");
const id3v2_frame_read_1 = require("../id3v2.frame.read");
exports.FrameCTOC = {
    parse: (reader, frame, head) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
        const bits = reader.readBitsByte();
        const ordered = (0, utils_1.isBitSetAt)(bits, 0);
        const topLevel = (0, utils_1.isBitSetAt)(bits, 1);
        let entrycount = reader.readBitsByte();
        if (entrycount < 0) {
            entrycount = (entrycount * -1) + 2;
        }
        const children = [];
        while (reader.hasData()) {
            const childId = reader.readStringTerminated(encodings_1.ascii);
            children.push(childId);
            if (entrycount <= children.length) {
                break;
            }
        }
        const bin = reader.rest();
        const subframes = yield (0, id3v2_frame_read_1.readSubFrames)(bin, head);
        const value = { id, ordered, topLevel, children };
        return { value, encoding: encodings_1.ascii, subframes };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeStringTerminated(value.id, encodings_1.ascii);
        yield stream.writeByte((value.ordered ? 1 : 0) + ((value.topLevel ? 1 : 0) * 2));
        yield stream.writeByte(value.children.length);
        for (const childId of value.children) {
            yield stream.writeStringTerminated(childId, encodings_1.ascii);
        }
        if (frame.subframes) {
            yield (0, id3v2_frame_write_1.writeRawSubFrames)(frame.subframes, stream, head, defaultEncoding);
        }
    }),
    simplify: (value) => {
        if (value && value.children && value.children.length > 0) {
            return `<toc ${value.children.length}entries>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.chapter-toc.js.map