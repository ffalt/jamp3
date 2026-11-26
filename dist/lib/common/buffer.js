export class BufferUtils {
    static indexOfNr(buffer, num, start = 0) {
        const len = buffer.length;
        for (let i = start; i < len; i++) {
            if (buffer[i] === num) {
                return i;
            }
        }
        return -1;
    }
    static indexOfNrs(buffer, num, start, stepWidth) {
        const len = buffer.length;
        for (let i = start; i < len; i = stepWidth + i) {
            if (this.matchesNrsAt(buffer, num, i)) {
                return i;
            }
        }
        return -1;
    }
    static matchesNrsAt(buffer, num, position) {
        const slen = num.length;
        for (let j = 0; j < slen; j++) {
            if (buffer[position + j] !== num[j]) {
                return false;
            }
        }
        return slen > 0;
    }
    static scanBufferTextPos(buffer, search, start = 0) {
        const i = this.indexOfBufferStep(buffer, search, start, search.length);
        return i < 0 ? buffer.length : i;
    }
    static concatBuffer(buffer, appendbuffer) {
        return Buffer.concat([buffer, appendbuffer]);
    }
    static concatBuffers(buffers) {
        return Buffer.concat(buffers);
    }
    static indexOfBuffer(buffer, search, start = 0) {
        return this.indexOfBufferStep(buffer, search, start, 1);
    }
    static indexOfBufferStep(buffer, search, start, stepWidth) {
        return search.length === 1 ?
            this.indexOfNr(buffer, search[0], start) :
            this.indexOfNrs(buffer, search, start, stepWidth);
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
//# sourceMappingURL=buffer.js.map