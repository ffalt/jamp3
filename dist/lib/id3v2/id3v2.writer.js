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
exports.ID3v2Writer = void 0;
const id3v2_writer_raw_1 = require("./id3v2.writer.raw");
class ID3v2Writer {
    write(stream, frames, head, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (head.ver === 0 || head.ver > 4) {
                return Promise.reject(Error('Unsupported Version'));
            }
            const writer = new id3v2_writer_raw_1.Id3v2RawWriter(stream, head, options, frames);
            yield writer.write();
        });
    }
}
exports.ID3v2Writer = ID3v2Writer;
//# sourceMappingURL=id3v2.writer.js.map