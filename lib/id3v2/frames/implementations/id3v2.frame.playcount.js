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
exports.FramePlayCount = void 0;
const utils_1 = require("../../../common/utils");
exports.FramePlayCount = {
    parse: (reader, frame) => __awaiter(void 0, void 0, void 0, function* () {
        let num;
        try {
            num = reader.readUInt(frame.data.length);
        }
        catch (e) {
            num = 0;
        }
        const value = { num };
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const byteLength = utils_1.neededStoreBytes(value.num, 4);
        stream.writeUInt(value.num, byteLength);
    }),
    simplify: (value) => {
        if (value && value.num !== undefined) {
            return value.num.toString();
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.playcount.js.map