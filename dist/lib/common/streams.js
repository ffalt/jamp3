"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const buffer_1 = require("./buffer");
const utils_1 = require("./utils");
const encodings_1 = require("./encodings");
const id3v2_consts_1 = require("../id3v2/id3v2_consts");
const id3v2_frames_1 = require("../id3v2/id3v2_frames");
const MemoryStream = require('memory-stream');
const ascii = encodings_1.Encodings['ascii'];
const utf8 = encodings_1.Encodings['utf8'];
class ReaderStream {
    constructor() {
        this.readableStream = null;
        this.buffers = [];
        this.buffersLength = 0;
        this.waiting = null;
        this.streamEnd = false;
        this.streamOnData = null;
        this.end = false;
        this.pos = 0;
        this.streamOnData = this.onData;
    }
    onData(chunk) {
        if (this.readableStream) {
            this.readableStream.pause();
        }
        this.buffers.push(chunk);
        this.buffersLength = this.getBufferLength();
        if (this.waiting) {
            const w = this.waiting;
            this.waiting = null;
            w();
        }
    }
    onSkip(chunk) {
        this.pos += chunk.length;
    }
    openStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            this.readableStream = stream;
            return new Promise((resolve, reject) => {
                if (!this.readableStream) {
                    return Promise.reject('Invalid Stream');
                }
                this.readableStream.on('error', (err) => {
                    return reject(err);
                });
                this.readableStream.on('end', () => {
                    this.end = true;
                    this.streamEnd = true;
                    if (this.waiting) {
                        const w = this.waiting;
                        this.waiting = null;
                        w();
                    }
                });
                this.readableStream.on('data', (chunk) => {
                    if (this.streamOnData) {
                        this.streamOnData(chunk);
                    }
                });
                this.waiting = () => {
                    resolve();
                };
            });
        });
    }
    open(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.readableStream = fs_1.default.createReadStream(filename);
            }
            catch (err) {
                return Promise.reject(err);
            }
            if (!this.readableStream) {
                return Promise.reject(Error('Could not open file ' + filename));
            }
            yield this.openStream(this.readableStream);
        });
    }
    consumeToEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pos += this.buffersLength;
            this.buffers = [];
            this.streamOnData = this.onSkip;
            yield this.resume();
        });
    }
    close() {
        if (this.readableStream) {
            if (typeof this.readableStream.close === 'function') {
                this.readableStream.close();
            }
            this.readableStream.destroy();
            this.readableStream = null;
        }
    }
    getBufferLength() {
        let result = 0;
        this.buffers.forEach(buf => {
            result += buf.length;
        });
        return result;
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.readableStream) {
                this.streamEnd = true;
                return;
            }
            return new Promise((resolve, reject) => {
                this.waiting = () => {
                    resolve();
                };
                if (this.readableStream) {
                    this.readableStream.resume();
                }
            });
        });
    }
    get(amount) {
        return this.getAndPrepend(amount, []);
    }
    skip(amount) {
        let givenLength = 0;
        let i = 0;
        while (i < this.buffers.length) {
            const b = this.buffers[i];
            const need = amount - givenLength;
            if (need < b.length) {
                givenLength += need;
                this.buffers[i] = b.slice(need);
                break;
            }
            else {
                givenLength += b.length;
                i++;
            }
        }
        this.pos += givenLength;
        this.buffers = this.buffers.slice(i);
        this.buffersLength = this.getBufferLength();
    }
    getAndPrepend(amount, prepend) {
        const destBuffers = prepend;
        let givenLength = 0;
        let i = 0;
        while (i < this.buffers.length) {
            const b = this.buffers[i];
            const need = amount - givenLength;
            if (need < b.length) {
                destBuffers.push(b.slice(0, need));
                this.buffers[i] = b.slice(need);
                break;
            }
            else {
                destBuffers.push(b);
                givenLength += b.length;
                i++;
            }
        }
        this.buffers = this.buffers.slice(i);
        this.buffersLength = this.getBufferLength();
        const result = buffer_1.BufferUtils.concatBuffers(destBuffers);
        this.pos += amount;
        return result;
    }
    read(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            amount = Math.max(1, amount);
            if ((this.buffersLength >= amount)) {
                const result = this.get(amount);
                this.end = this.streamEnd && this.buffersLength === 0;
                return result;
            }
            if (!this.streamEnd) {
                yield this.resume();
                return yield this.read(amount);
            }
            else {
                if (this.buffersLength === 0) {
                    return buffer_1.BufferUtils.zeroBuffer(0);
                }
                const result = buffer_1.BufferUtils.concatBuffers(this.buffers);
                this.buffers = [];
                this.buffersLength = 0;
                this.pos += result.length;
                this.end = this.streamEnd;
                return result;
            }
        });
    }
    unshift(buffer) {
        if (buffer.length > 0) {
            this.buffers.unshift(buffer);
            this.buffersLength = this.getBufferLength();
            this.pos -= buffer.length;
            this.end = this.streamEnd && this.buffersLength === 0;
        }
    }
    scan(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.end) {
                return -1;
            }
            const result = buffer_1.BufferUtils.concatBuffers(this.buffers);
            const index = buffer_1.BufferUtils.indexOfBuffer(result, buffer);
            if (index >= 0) {
                this.pos += index;
                this.buffers = [result.slice(index)];
                return this.pos;
            }
            else {
                if (this.end) {
                    return -1;
                }
                this.pos += result.length;
                this.buffers = [];
                this.buffersLength = 0;
                yield this.resume();
                return this.scan(buffer);
            }
        });
    }
}
exports.ReaderStream = ReaderStream;
class WriterStream {
    constructor() {
        this.wstream = new MemoryStream();
    }
    writeByte(byte) {
        const buf = buffer_1.BufferUtils.zeroBuffer(1);
        buf.writeUInt8(byte, 0);
        this.wstream.write(buf);
    }
    writeBytes(bytes) {
        this.wstream.write(buffer_1.BufferUtils.fromArray(bytes));
    }
    writeBitsByte(bits) {
        while (bits.length < 8) {
            bits.push(0);
        }
        this.writeByte(utils_1.unbitarray(bits));
    }
    writeBuffer(buffer) {
        this.wstream.write(buffer);
    }
    writeSyncSafeInt(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(4);
        buf.writeUIntBE(utils_1.synchsafe(int), 0, 4);
        this.wstream.write(buf);
    }
    writeUInt(int, byteLength) {
        const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
        buf.writeUIntBE(int, 0, byteLength);
        this.wstream.write(buf);
    }
    writeUByte(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(1);
        buf.writeUInt8(int, 0);
        this.wstream.write(buf);
    }
    writeUInt2Byte(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(2);
        buf.writeUIntBE(int, 0, 2);
        this.wstream.write(buf);
    }
    writeSInt2Byte(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(2);
        buf.writeIntBE(int, 0, 2);
        this.wstream.write(buf);
    }
    writeUInt3Byte(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(3);
        buf.writeUIntBE(int, 0, 3);
        this.wstream.write(buf);
    }
    writeUInt4Byte(int) {
        const buf = buffer_1.BufferUtils.zeroBuffer(4);
        buf.writeUIntBE(int, 0, 4);
        this.wstream.write(buf);
    }
    writeSInt(int, byteLength) {
        const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
        buf.writeIntBE(int, 0, byteLength);
        this.wstream.write(buf);
    }
    writeEncoding(enc) {
        this.writeByte(enc.byte);
    }
    writeString(val, enc) {
        if (enc.bom) {
            this.writeBytes(enc.bom);
        }
        this.wstream.write(enc.encode(val));
    }
    writeStringTerminated(val, enc) {
        if (enc.bom) {
            this.writeBytes(enc.bom);
        }
        this.wstream.write(enc.encode(val));
        this.writeTerminator(enc);
    }
    writeAsciiString(val, length) {
        while (val.length < length) {
            val += ' ';
        }
        this.wstream.write(val.slice(0, length), 'ascii');
    }
    writeAscii(val) {
        this.wstream.write(val, 'ascii');
    }
    writeTerminator(enc) {
        this.writeBuffer(enc.terminator);
    }
    writeFixedAsciiString(val, amount) {
        let buf = ascii.encode(val.slice(0, amount)).slice(0, amount);
        const padding = amount - buf.length;
        if (padding > 0) {
            const pad = buffer_1.BufferUtils.zeroBuffer(padding);
            buf = buffer_1.BufferUtils.concatBuffer(buf, pad);
        }
        this.writeBuffer(buf);
    }
    writeFixedUTF8String(val, amount) {
        let buf = utf8.encode(val.slice(0, amount)).slice(0, amount);
        const padding = amount - buf.length;
        if (padding > 0) {
            const pad = buffer_1.BufferUtils.zeroBuffer(padding);
            buf = buffer_1.BufferUtils.concatBuffer(buf, pad);
        }
        this.writeBuffer(buf);
    }
}
exports.WriterStream = WriterStream;
class FileWriterStream extends WriterStream {
    constructor() {
        super();
    }
    open(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.wstream = fs_1.default.createWriteStream(filename);
            }
            catch (err) {
                return Promise.reject(err);
            }
            return new Promise((resolve, reject) => {
                this.wstream.once('open', (fd) => {
                    resolve();
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.wstream.on('close', () => {
                    resolve();
                });
                this.wstream.end();
            });
        });
    }
    copyRange(filename, start, finish) {
        return __awaiter(this, void 0, void 0, function* () {
            const readstream = fs_1.default.createReadStream(filename, { start, end: finish });
            return new Promise((resolve, reject) => {
                readstream.on('error', (err) => {
                    return reject(err);
                });
                readstream.on('end', (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
                readstream.pipe(this.wstream, { end: false });
            });
        });
    }
    copyFrom(filename, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const readstream = fs_1.default.createReadStream(filename, { start: position });
            return new Promise((resolve, reject) => {
                readstream.on('error', (err) => {
                    return reject(err);
                });
                readstream.on('end', (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
                readstream.pipe(this.wstream, { end: false });
            });
        });
    }
}
exports.FileWriterStream = FileWriterStream;
class MemoryWriterStream extends WriterStream {
    constructor() {
        super();
    }
    toBuffer() {
        return this.wstream.toBuffer();
    }
}
exports.MemoryWriterStream = MemoryWriterStream;
class DataReader {
    constructor(data) {
        this.position = 0;
        this.data = data;
    }
    readStringTerminated(enc) {
        const i = buffer_1.BufferUtils.scanBufferText(this.data, enc.terminator, this.position);
        const buf = this.data.slice(this.position, i);
        const result = (buf.length === 0) ? '' : enc.decode(buf);
        this.position = i + enc.terminator.length;
        return result;
    }
    readString(amount, enc) {
        const result = enc.decode(this.data.slice(this.position, this.position + amount));
        this.position += amount;
        return result;
    }
    rest() {
        const result = this.data.slice(this.position);
        this.position += result.length;
        return result;
    }
    readByte() {
        const result = this.data[this.position];
        this.position += 1;
        return result;
    }
    readBitsByte() {
        const result = this.data.readInt8(this.position);
        this.position += 1;
        return result;
    }
    readUInt(byteLength) {
        const result = this.data.readUIntBE(this.position, byteLength);
        this.position += byteLength;
        return result;
    }
    readSInt(byteLength) {
        const result = this.data.readIntBE(this.position, byteLength);
        this.position += byteLength;
        return result;
    }
    readUInt2Byte() {
        const result = this.data.readUIntBE(this.position, 2);
        this.position += 2;
        return result;
    }
    readSInt2Byte() {
        const result = this.data.readIntBE(this.position, 2);
        this.position += 2;
        return result;
    }
    readUInt4Byte() {
        const result = this.data.readUInt32BE(this.position);
        this.position += 4;
        return result;
    }
    readEncoding() {
        const encid = this.data[this.position].toString();
        const encoding = id3v2_consts_1.ID3v2_UnifiedENCODINGS[encid] || 'ascii';
        this.position += 1;
        return encodings_1.Encodings[encoding] || ascii;
    }
    readFixedAsciiString(amount) {
        let buf = this.data.slice(this.position, this.position + amount);
        this.position += amount;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                buf = buf.slice(0, i);
                break;
            }
        }
        return ascii.decode(buf);
    }
    readFixedUTF8String(amount) {
        let buf = this.data.slice(this.position, this.position + amount);
        this.position += amount;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                buf = buf.slice(0, i);
                break;
            }
        }
        return utf8.decode(buf);
    }
    readFixedAutodectectString(amount) {
        let buf = this.data.slice(this.position, this.position + amount);
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                buf = buf.slice(0, i);
                break;
            }
        }
        let result = utf8.decode(buf);
        if (result.indexOf('�') >= 0) {
            result = ascii.decode(buf);
        }
        this.position += amount;
        return result;
    }
    unread() {
        return this.data.length - this.position;
    }
    hasData() {
        return this.position < this.data.length;
    }
    readBuffer(amount) {
        const result = this.data.slice(this.position, this.position + amount);
        this.position += amount;
        return result;
    }
    readUnsyncedBuffer(amount) {
        let result = this.data.slice(this.position, this.position + amount);
        let unsynced = id3v2_frames_1.removeUnsync(result);
        let stuffed = 0;
        while (unsynced.length < amount && (this.position + amount + stuffed < this.data.length)) {
            stuffed += amount - unsynced.length;
            result = this.data.slice(this.position, this.position + amount + stuffed);
            unsynced = id3v2_frames_1.removeUnsync(result);
        }
        this.position = this.position + amount + stuffed;
        return unsynced;
    }
}
exports.DataReader = DataReader;
//# sourceMappingURL=streams.js.map