import MemoryStream from 'memory-stream';
import { BufferUtils } from './buffer.js';
import { synchsafe, unbitarray } from './utils.js';
import { ascii } from './encodings.js';
export class WriterStream {
    constructor() {
        this.wstream = new MemoryStream();
        this.attachErrorHandler();
    }
    attachErrorHandler() {
        this.wstream.on('error', error => {
            this.writeError = error;
        });
    }
    async _write(something) {
        if (this.writeError) {
            return Promise.reject(this.writeError);
        }
        if (!this.wstream.write(something)) {
            return new Promise((resolve, reject) => {
                this.wstream.once('drain', () => {
                    resolve();
                });
                this.wstream.once('error', reject);
            });
        }
    }
    async _writeString(something, encoding) {
        if (this.writeError) {
            return Promise.reject(this.writeError);
        }
        if (!this.wstream.write(something, encoding)) {
            return new Promise((resolve, reject) => {
                this.wstream.once('drain', () => {
                    resolve();
                });
                this.wstream.once('error', reject);
            });
        }
    }
    async writeByte(byte) {
        const buf = BufferUtils.zeroBuffer(1);
        buf.writeUInt8(byte, 0);
        return this._write(buf);
    }
    async writeBytes(bytes) {
        return this._write(BufferUtils.fromArray(bytes));
    }
    async writeBitsByte(bits) {
        while (bits.length < 8) {
            bits.push(0);
        }
        return this.writeByte(unbitarray(bits));
    }
    async writeBuffer(buffer) {
        return this._write(buffer);
    }
    async writeSyncSafeInt(int) {
        return this.writeUInt(synchsafe(int), 4);
    }
    async writeUInt(int, byteLength) {
        const buf = BufferUtils.zeroBuffer(byteLength);
        buf.writeUIntBE(int, 0, byteLength);
        return this._write(buf);
    }
    async writeUInt2Byte(int) {
        return this.writeUInt(int, 2);
    }
    async writeUInt3Byte(int) {
        return this.writeUInt(int, 3);
    }
    async writeUInt4Byte(int) {
        return this.writeUInt(int, 4);
    }
    async writeSInt(int, byteLength) {
        const buf = BufferUtils.zeroBuffer(byteLength);
        buf.writeIntBE(int, 0, byteLength);
        return this._write(buf);
    }
    async writeBigUInt(int, byteLength) {
        if ((byteLength <= 6) && (int <= Number.MAX_SAFE_INTEGER)) {
            return this.writeUInt(int, byteLength);
        }
        const buf = BufferUtils.zeroBuffer(byteLength);
        let current = Math.min(int, Number.MAX_SAFE_INTEGER);
        for (let i = byteLength - 1; i >= 0; i--) {
            buf[i] = current % 256;
            current = Math.floor(current / 256);
        }
        return this._write(buf);
    }
    async writeSInt2Byte(int) {
        return this.writeSInt(int, 2);
    }
    async writeEncoding(enc) {
        return this.writeByte(enc.byte);
    }
    async writeString(val, enc) {
        if (enc.bom) {
            await this.writeBytes(enc.bom);
        }
        return this._write(enc.encode(val));
    }
    async writeStringTerminated(val, enc) {
        if (enc.bom) {
            await this.writeBytes(enc.bom);
        }
        await this._write(enc.encode(val));
        return this.writeTerminator(enc);
    }
    async writeAsciiString(value, length) {
        let current = value;
        while (current.length < length) {
            current += ' ';
        }
        return this._writeString(current.slice(0, length), 'ascii');
    }
    async writeAscii(val) {
        return this._writeString(val, 'ascii');
    }
    async writeTerminator(enc) {
        return this.writeBuffer(enc.terminator);
    }
    async writeFixedBuffer(buffer, size) {
        const padding = size - buffer.length;
        if (padding > 0) {
            const pad = BufferUtils.zeroBuffer(padding);
            return this.writeBuffer(BufferUtils.concatBuffer(buffer, pad));
        }
        return this.writeBuffer(buffer);
    }
    async writeFixedAsciiString(val, size) {
        const buf = ascii.encode(val.slice(0, size)).subarray(0, size);
        return this.writeFixedBuffer(buf, size);
    }
}
//# sourceMappingURL=stream-writer.js.map