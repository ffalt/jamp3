"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferUtils = void 0;
class BufferUtils {
    static indexOfNr(buffer, num, start) {
        const len = buffer.length;
        for (let i = start || 0; i < len; i++) {
            if (buffer[i] === num) {
                return i;
            }
        }
        return -1;
    }
    static indexOfNrs(buffer, num, start, stepWidth) {
        const slen = num.length;
        const len = buffer.length;
        for (let i = start; i < len; i = stepWidth + i) {
            for (let j = 0; j < slen; j++) {
                if (buffer[i + j] !== num[j]) {
                    break;
                }
                if (j === slen - 1) {
                    return i;
                }
            }
        }
        return -1;
    }
    static scanBufferTextPos(buffer, search, start) {
        const i = BufferUtils.indexOfBufferStep(buffer, search, start || 0, search.length);
        return i < 0 ? buffer.length : i;
    }
    static concatBuffer(buffer, appendbuffer) {
        return Buffer.concat([buffer, appendbuffer]);
    }
    static concatBuffers(buffers) {
        return Buffer.concat(buffers);
    }
    static indexOfBuffer(buffer, search, start) {
        return BufferUtils.indexOfBufferStep(buffer, search, start || 0, 1);
    }
    static indexOfBufferStep(buffer, search, start, stepWidth) {
        return search.length === 1 ?
            BufferUtils.indexOfNr(buffer, search[0], start) :
            BufferUtils.indexOfNrs(buffer, search, start, stepWidth);
    }
    static compareBuffer(buffer, buffer2) {
        return (buffer.length === buffer2.length) && (this.indexOfBuffer(buffer, buffer2, 0) === 0 || buffer.length === 0);
    }
    static fromString(s) {
        return Buffer.from(s);
    }
    static fromArray(bytes) {
        return Buffer.from(bytes);
    }
    static zeroBuffer(size) {
        return Buffer.alloc(size, 0);
    }
}
exports.BufferUtils = BufferUtils;
//# sourceMappingURL=buffer.js.map