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
exports.FramePopularimeter = void 0;
const encodings_1 = require("../../../common/encodings");
const utils_1 = require("../../../common/utils");
exports.FramePopularimeter = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const email = reader.readStringTerminated(encodings_1.ascii);
        const rating = reader.readByte();
        let count = 0;
        if (reader.hasData()) {
            try {
                count = reader.readUInt(reader.unread());
            }
            catch (e) {
                count = 0;
            }
        }
        const value = { count, rating, email };
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeStringTerminated(value.email, encodings_1.ascii);
        yield stream.writeByte(value.rating);
        if (value.count > 0) {
            const byteLength = utils_1.neededStoreBytes(value.count, 4);
            yield stream.writeUInt(value.count, byteLength);
        }
    }),
    simplify: (value) => {
        if (value && value.email !== undefined) {
            return value.email + (value.count !== undefined ? ';count=' + value.count : '') + (value.rating !== undefined ? ';rating=' + value.rating : '');
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.popularimeter.js.map