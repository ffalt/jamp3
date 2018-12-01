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
const streams_1 = require("../common/streams");
class Writer {
    constructor(filename, version, tag) {
        this.filename = filename;
        this.version = version;
        this.tag = tag;
    }
    writeTag(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            stream.writeAscii('TAG');
            stream.writeFixedAsciiString(this.tag.value.title || '', 30);
            stream.writeFixedAsciiString(this.tag.value.artist || '', 30);
            stream.writeFixedAsciiString(this.tag.value.album || '', 30);
            stream.writeFixedAsciiString(this.tag.value.year || '', 4);
            if (this.version === 0) {
                stream.writeFixedAsciiString(this.tag.value.comment || '', 30);
            }
            else {
                stream.writeFixedAsciiString(this.tag.value.comment || '', 28);
                stream.writeByte(0);
                stream.writeByte(this.tag.value.track || 0);
            }
            stream.writeByte(this.tag.value.genreIndex || 0);
        });
    }
    openFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = new streams_1.FileWriterStream();
            yield stream.open(this.filename);
            return stream;
        });
    }
    closeFile(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            yield stream.close();
        });
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = yield this.openFile();
            try {
                yield this.writeTag(stream);
            }
            catch (e) {
                yield this.closeFile(stream);
                return Promise.reject(e);
            }
            yield this.closeFile(stream);
        });
    }
}
class ID3v1Writer {
    write(filename, tag, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const writer = new Writer(filename, version, tag);
            yield writer.write();
        });
    }
}
exports.ID3v1Writer = ID3v1Writer;
//# sourceMappingURL=id3v1_writer.js.map