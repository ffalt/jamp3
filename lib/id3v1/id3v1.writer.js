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
exports.ID3v1Writer = void 0;
class Id3v1RawWriter {
    constructor(stream, tag, version) {
        this.stream = stream;
        this.version = version;
        this.tag = tag;
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stream.writeAscii('TAG');
            this.stream.writeFixedAsciiString(this.tag.title || '', 30);
            this.stream.writeFixedAsciiString(this.tag.artist || '', 30);
            this.stream.writeFixedAsciiString(this.tag.album || '', 30);
            this.stream.writeFixedAsciiString(this.tag.year || '', 4);
            if (this.version === 0) {
                this.stream.writeFixedAsciiString(this.tag.comment || '', 30);
            }
            else {
                this.stream.writeFixedAsciiString(this.tag.comment || '', 28);
                this.stream.writeByte(0);
                this.stream.writeByte(this.tag.track || 0);
            }
            this.stream.writeByte(this.tag.genreIndex || 0);
        });
    }
}
class ID3v1Writer {
    write(stream, tag, version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (version < 0 || version > 1) {
                return Promise.reject(Error('Unsupported Version'));
            }
            const writer = new Id3v1RawWriter(stream, tag, version);
            yield writer.write();
        });
    }
}
exports.ID3v1Writer = ID3v1Writer;
//# sourceMappingURL=id3v1.writer.js.map