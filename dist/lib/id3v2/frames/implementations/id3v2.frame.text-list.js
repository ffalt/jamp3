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
const id3v2_frame_write_1 = require("../id3v2.frame.write");
exports.FrameTextList = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
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
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const enc = id3v2_frame_write_1.getWriteTextEncoding(frame, head, defaultEncoding);
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
//# sourceMappingURL=id3v2.frame.text-list.js.map