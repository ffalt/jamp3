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
exports.FrameBooleanString = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const enc = reader.readEncoding();
        const intAsString = reader.readStringTerminated(enc);
        const i = parseInt(intAsString, 10).toString();
        const value = { bool: i === '1' };
        return { value, encoding: enc };
    }),
    write: (frame, stream, head, defaultEncoding) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const enc = id3v2_frame_write_1.getWriteTextEncoding(frame, head, defaultEncoding);
        stream.writeEncoding(enc);
        stream.writeStringTerminated(value.bool ? '1' : '0', enc);
    }),
    simplify: (value) => {
        if (value) {
            return value.bool ? 'true' : 'false';
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.boolstring.js.map