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
exports.FramePCST = void 0;
exports.FramePCST = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const num = reader.readUInt4Byte();
        const value = { num };
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeUInt4Byte(value.num);
    }),
    simplify: (value) => {
        return value.num.toString();
    }
};
//# sourceMappingURL=id3v2.frame.pcst.js.map