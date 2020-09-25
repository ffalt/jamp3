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
exports.FrameTextConcatList = void 0;
const encodings_1 = require("../../../common/encodings");
const id3v2_frame_write_1 = require("../id3v2.frame.write");
exports.FrameTextConcatList = {
    parse: (reader, frame) => __awaiter(void 0, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: { text: '' }, encoding: encodings_1.utf8 };
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
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const enc = id3v2_frame_write_1.getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        const list = value.text.split('/');
        for (const s of list) {
            stream.writeStringTerminated(s, enc);
        }
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.text-concat-list.js.map