"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("./buffer");
const utils_1 = require("./utils");
const encodings_1 = require("./encodings");
const MemoryStream = require('memory-stream');
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
        this.writeUInt(utils_1.synchsafe(int), 4);
    }
    writeUInt(int, byteLength) {
        const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
        buf.writeUIntBE(int, 0, byteLength);
        this.wstream.write(buf);
    }
    writeUInt2Byte(int) {
        this.writeUInt(int, 2);
    }
    writeUInt3Byte(int) {
        this.writeUInt(int, 3);
    }
    writeUInt4Byte(int) {
        this.writeUInt(int, 4);
    }
    writeSInt(int, byteLength) {
        const buf = buffer_1.BufferUtils.zeroBuffer(byteLength);
        buf.writeIntBE(int, 0, byteLength);
        this.wstream.write(buf);
    }
    writeSInt2Byte(int) {
        this.writeSInt(int, 2);
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
    writeFixedBuffer(buffer, size) {
        const padding = size - buffer.length;
        if (padding > 0) {
            const pad = buffer_1.BufferUtils.zeroBuffer(padding);
            buffer = buffer_1.BufferUtils.concatBuffer(buffer, pad);
        }
        this.writeBuffer(buffer);
    }
    writeFixedAsciiString(val, size) {
        const buf = encodings_1.ascii.encode(val.slice(0, size)).slice(0, size);
        this.writeFixedBuffer(buf, size);
    }
}
exports.WriterStream = WriterStream;
//# sourceMappingURL=stream-writer.js.map