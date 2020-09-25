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
exports.FrameLINK = void 0;
const encodings_1 = require("../../../common/encodings");
exports.FrameLINK = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const url = reader.readStringTerminated(encodings_1.ascii);
        const id = reader.readStringTerminated(encodings_1.ascii);
        const value = { url, id, additional: [] };
        while (reader.hasData()) {
            const additional = reader.readStringTerminated(encodings_1.ascii);
            if (additional.length > 0) {
                value.additional.push(additional);
            }
        }
        return { value, encoding: encodings_1.ascii };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.url, encodings_1.ascii);
        stream.writeStringTerminated(value.id, encodings_1.ascii);
        value.additional.forEach(additional => {
            stream.writeStringTerminated(additional, encodings_1.ascii);
        });
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.linked-info.js.map