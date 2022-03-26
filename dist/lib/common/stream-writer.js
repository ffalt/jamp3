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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriterStream = void 0;
const buffer_1 = require("./buffer");
const utils_1 = require("./utils");
const encodings_1 = require("./encodings");
const memory_stream_1 = __importDefault(require("memory-stream"));
class WriterStream {
    constructor() {
        this.wstream = new memory_stream_1.default();
    }
    _write(something) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wstream.write(something)) {
                return new Promise((resolve, reject) => {
                    this.wstream.once('drain', () => {
                        resolve();
                    });
                });
            }
        });
    }
    _writeString(something, encoding) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wstream.write(something, encoding)) {
                return new Promise((resolve, reject) => {
                    this.wstream.once('drain', () => {
                        resolve();
                    });
                });
            }
        });
    }
    writeByte(byte) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = buffer_1.BufferUtils.zeroBuffer(1);
            buf.writeUInt8(byte, 0);
            return this._write(buf);
        });
    }
    writeBytes(bytes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._write(buffer_1.BufferUtils.fromArray(bytes));
        });
    }
    writeBitsByte(bits) {
        return __awaiter(this, void 0, void 0, function* () {
            while (bits.length < 8) {
                bits.push(0);
            }
            return this.writeByte((0, utils_1.unbitarray)(bits));
        });
    }
    writeBuffer(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._write(buffer);
        });
    }
    writeSyncSafeInt(int) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeUInt((0, utils_1.synchsafe)(int), 4);
        });
    }
    writeUInt(int, byteLength) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
            buf.writeUIntBE(int, 0, byteLength);
            return this._write(buf);
        });
    }
    writeUInt2Byte(int) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeUInt(int, 2);
        });
    }
    writeUInt3Byte(int) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeUInt(int, 3);
        });
    }
    writeUInt4Byte(int) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeUInt(int, 4);
        });
    }
    writeSInt(int, byteLength) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
            buf.writeIntBE(int, 0, byteLength);
            return this._write(buf);
        });
    }
    writeSInt2Byte(int) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeSInt(int, 2);
        });
    }
    writeEncoding(enc) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeByte(enc.byte);
        });
    }
    writeString(val, enc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (enc.bom) {
                yield this.writeBytes(enc.bom);
            }
            return this._write(enc.encode(val));
        });
    }
    writeStringTerminated(val, enc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (enc.bom) {
                yield this.writeBytes(enc.bom);
            }
            yield this._write(enc.encode(val));
            return this.writeTerminator(enc);
        });
    }
    writeAsciiString(val, length) {
        return __awaiter(this, void 0, void 0, function* () {
            while (val.length < length) {
                val += ' ';
            }
            return this._writeString(val.slice(0, length), 'ascii');
        });
    }
    writeAscii(val) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._writeString(val, 'ascii');
        });
    }
    writeTerminator(enc) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeBuffer(enc.terminator);
        });
    }
    writeFixedBuffer(buffer, size) {
        return __awaiter(this, void 0, void 0, function* () {
            const padding = size - buffer.length;
            if (padding > 0) {
                const pad = buffer_1.BufferUtils.zeroBuffer(padding);
                buffer = buffer_1.BufferUtils.concatBuffer(buffer, pad);
            }
            return this.writeBuffer(buffer);
        });
    }
    writeFixedAsciiString(val, size) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = encodings_1.ascii.encode(val.slice(0, size)).slice(0, size);
            return this.writeFixedBuffer(buf, size);
        });
    }
}
exports.WriterStream = WriterStream;
//# sourceMappingURL=stream-writer.js.map