"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BufferUtils {
    static scanBufferText(buffer, search, start) {
        const slen = search.length;
        const len = buffer.length;
        if (slen === 1) {
            const c = search[0];
            for (let i = start || 0; i < len; i++) {
                if (buffer[i] === c) {
                    return i;
                }
            }
        }
        else {
            for (let i = start || 0; i < len; i = i + slen) {
                for (let j = 0; j < slen; j++) {
                    if (buffer[i + j] !== search[j]) {
                        break;
                    }
                    else if (j === slen - 1) {
                        return i;
                    }
                }
            }
        }
        return buffer.length;
    }
    static concatBuffer(buffer, appendbuffer) {
        return Buffer.concat([buffer, appendbuffer]);
    }
    static concatBuffers(buffers) {
        return Buffer.concat(buffers);
    }
    static indexOfBuffer(buffer, search, start) {
        const slen = search.length;
        const len = buffer.length;
        if (slen === 1) {
            const c = search[0];
            for (let i = start || 0; i < len; i++) {
                if (buffer[i] === c) {
                    return i;
                }
            }
        }
        else {
            for (let i = start || 0; i < len; i++) {
                for (let j = 0; j < slen; j++) {
                    if (buffer[i + j] !== search[j]) {
                        break;
                    }
                    else if (j === slen - 1) {
                        return i;
                    }
                }
            }
        }
        return -1;
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