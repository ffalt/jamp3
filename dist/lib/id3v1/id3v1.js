"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const id3v1_reader_1 = require("./id3v1_reader");
const id3v1_writer_1 = require("./id3v1_writer");
class ID3v1 {
    read(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new id3v1_reader_1.ID3v1Reader();
            return yield reader.read(filename);
        });
    }
    write(filename, tag, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const writer = new id3v1_writer_1.ID3v1Writer();
            yield writer.write(filename, tag, version);
        });
    }
}
exports.ID3v1 = ID3v1;
//# sourceMappingURL=id3v1.js.map