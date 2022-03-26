"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferReader = void 0;
const encodings_1 = require("./encodings");
const buffer_1 = require("./buffer");
const id3v2_header_consts_1 = require("../id3v2/id3v2.header.consts");
const id3v2_frame_unsync_1 = require("../id3v2/frames/id3v2.frame.unsync");
class BufferReader {
    constructor(data) {
        this.position = 0;
        this.data = data;
    }
    readStringTerminated(enc) {
        const i = buffer_1.BufferUtils.scanBufferTextPos(this.data, enc.terminator, this.position);
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
        const encoding = id3v2_header_consts_1.ID3v2_UnifiedENCODINGS[encid] || 'ascii';
        this.position += 1;
        return encodings_1.Encodings[encoding] || encodings_1.ascii;
    }
    readStringBuffer(amount) {
        let buf = this.data.slice(this.position, this.position + amount);
        this.position += amount;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                buf = buf.slice(0, i);
                break;
            }
        }
        return buf;
    }
    readFixedAsciiString(amount) {
        const buf = this.readStringBuffer(amount);
        return encodings_1.ascii.decode(buf);
    }
    readFixedAutodectectString(amount) {
        const buf = this.readStringBuffer(amount);
        let result = encodings_1.utf8.decode(buf);
        if (result.indexOf('�') >= 0) {
            result = encodings_1.ascii.decode(buf);
        }
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
        let unsynced = (0, id3v2_frame_unsync_1.removeUnsync)(result);
        let stuffed = 0;
        while (unsynced.length < amount && (this.position + amount + stuffed < this.data.length)) {
            stuffed += amount - unsynced.length;
            result = this.data.slice(this.position, this.position + amount + stuffed);
            unsynced = (0, id3v2_frame_unsync_1.removeUnsync)(result);
        }
        this.position = this.position + amount + stuffed;
        return unsynced;
    }
}
exports.BufferReader = BufferReader;
//# sourceMappingURL=buffer-reader.js.map