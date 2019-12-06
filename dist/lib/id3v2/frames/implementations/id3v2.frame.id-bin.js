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
const encodings_1 = require("../../../common/encodings");
exports.FrameIdBin = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const id = reader.readStringTerminated(encodings_1.ascii);
        const bin = reader.rest();
        const value = { id, bin };
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, encodings_1.ascii);
        stream.writeBuffer(value.bin);
    }),
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return '<bin ' + value.bin.length + 'bytes>';
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.id-bin.js.map