import { ascii, utf8, Encodings } from './encodings.js';
import { BufferUtils } from './buffer.js';
import { ID3v2_UnifiedENCODINGS } from '../id3v2/id3v2.header.consts.js';
import { removeUnsync } from '../id3v2/frames/id3v2.frame.unsync.js';
export class BufferReader {
    constructor(data) {
        this.position = 0;
        this.data = data;
    }
    readStringTerminated(enc) {
        const i = BufferUtils.scanBufferTextPos(this.data, enc.terminator, this.position);
        const buf = this.data.subarray(this.position, i);
        const result = (buf.length === 0) ? '' : enc.decode(buf);
        this.position = (i === this.data.length) ? i : i + enc.terminator.length;
        return result;
    }
    readString(amount, enc) {
        const result = enc.decode(this.data.subarray(this.position, this.position + amount));
        this.position += amount;
        return result;
    }
    rest() {
        const result = this.data.subarray(this.position);
        this.position += result.length;
        return result;
    }
    readByte() {
        if (this.position >= this.data.length) {
            throw new RangeError(`Buffer read out of bounds: offset ${this.position}, length ${this.data.length}`);
        }
        const result = this.data[this.position];
        this.position += 1;
        return result;
    }
    readBitsByte() {
        return this.readByte();
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
    readUIntDynamic(byteLength) {
        const length = Math.min(byteLength, this.unread());
        let result = 0;
        for (let i = 0; i < length; i++) {
            const byte = this.data[this.position + i];
            if (result > ((Number.MAX_SAFE_INTEGER - byte) / 256)) {
                this.position += length;
                return Number.MAX_SAFE_INTEGER;
            }
            result = (result * 256) + byte;
        }
        this.position += length;
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
        const encoding = ID3v2_UnifiedENCODINGS[encid] || 'ascii';
        this.position += 1;
        return Encodings[encoding] || ascii;
    }
    readStringBuffer(amount) {
        let buf = this.data.subarray(this.position, this.position + amount);
        this.position += amount;
        for (let i = 0; i < buf.length; i++) {
            if (buf[i] === 0) {
                buf = buf.subarray(0, i);
                break;
            }
        }
        return buf;
    }
    readFixedAsciiString(amount) {
        const buf = this.readStringBuffer(amount);
        return ascii.decode(buf);
    }
    readFixedAutodectectString(amount) {
        const buf = this.readStringBuffer(amount);
        let result = utf8.decode(buf);
        if (result.includes('�')) {
            result = ascii.decode(buf);
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
        const result = this.data.subarray(this.position, this.position + amount);
        this.position += amount;
        return result;
    }
    readUnsyncedBuffer(amount) {
        let window = Math.min(amount, this.data.length - this.position);
        let unsynced = removeUnsync(this.data.subarray(this.position, this.position + window));
        while (unsynced.length < amount) {
            const remaining = this.data.length - this.position - window;
            if (remaining <= 0) {
                this.position = this.data.length;
                throw new RangeError(`Unsynchronised frame data truncated: needed ${amount} bytes, got ${unsynced.length}`);
            }
            window += Math.min(amount - unsynced.length, remaining);
            unsynced = removeUnsync(this.data.subarray(this.position, this.position + window));
        }
        if ((window > 0) && (this.data[this.position + window - 1] === 0xFF) && (this.data[this.position + window] === 0x00)) {
            window++;
            unsynced = removeUnsync(this.data.subarray(this.position, this.position + window));
        }
        this.position += window;
        return unsynced;
    }
}
//# sourceMappingURL=buffer-reader.js.map