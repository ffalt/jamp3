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
exports.FrameIdAscii = void 0;
const encodings_1 = require("../../../common/encodings");
exports.FrameIdAscii = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
        const text = reader.readStringTerminated(encodings_1.ascii);
        const value = { id, text };
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeStringTerminated(value.id, encodings_1.ascii);
        yield stream.writeString(value.text, encodings_1.ascii);
    }),
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.id-ascii.js.map