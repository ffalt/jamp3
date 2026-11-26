import fs from 'node:fs';
import { BufferUtils } from './buffer.js';
export class ReaderStream {
    constructor() {
        this.readableStream = null;
        this.buffers = [];
        this.buffersLength = 0;
        this.waiting = null;
        this.streamEnd = false;
        this.streamError = null;
        this.pendingReject = null;
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
            this.pendingReject = null;
            w();
        }
    }
    onSkip(chunk) {
        this.pos += chunk.length;
    }
    async openStream(stream) {
        this.readableStream = stream;
        return new Promise((resolve, reject) => {
            if (!this.readableStream) {
                return Promise.reject('Invalid Stream');
            }
            this.readableStream.on('error', error => {
                this.streamError = error;
                const pendingReject = this.pendingReject;
                this.pendingReject = null;
                this.waiting = null;
                (pendingReject || reject)(error);
            });
            this.readableStream.on('end', () => {
                this.end = true;
                this.streamEnd = true;
                if (this.waiting) {
                    const w = this.waiting;
                    this.waiting = null;
                    this.pendingReject = null;
                    w();
                }
            });
            this.readableStream.on('data', chunk => {
                if (this.streamOnData) {
                    this.streamOnData(chunk);
                }
            });
            this.waiting = () => resolve();
            this.pendingReject = reject;
        });
    }
    async open(filename) {
        try {
            this.readableStream = fs.createReadStream(filename);
        }
        catch (error) {
            return Promise.reject(error);
        }
        if (!this.readableStream) {
            return Promise.reject(new Error(`Could not open file ${filename}`));
        }
        await this.openStream(this.readableStream);
    }
    async consumeToEnd() {
        this.pos += this.buffersLength;
        this.buffers = [];
        this.streamOnData = this.onSkip;
        while (!this.streamEnd) {
            await this.resume();
        }
    }
    close() {
        const stream = this.readableStream;
        this.readableStream = null;
        if (!stream) {
            return;
        }
        if (typeof stream.close === 'function') {
            stream.close();
        }
        stream.destroy();
    }
    getBufferLength() {
        let result = 0;
        for (const buffer of this.buffers) {
            result += buffer.length;
        }
        return result;
    }
    async resume() {
        if (this.streamError) {
            throw this.streamError;
        }
        if (!this.readableStream) {
            this.streamEnd = true;
            return;
        }
        return new Promise((resolve, reject) => {
            this.waiting = () => {
                resolve();
            };
            this.pendingReject = reject;
            if (this.readableStream) {
                this.readableStream.resume();
            }
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
                this.buffers[i] = b.subarray(need);
                break;
            }
            givenLength += b.length;
            i++;
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
                destBuffers.push(b.subarray(0, need));
                givenLength += need;
                this.buffers[i] = b.subarray(need);
                break;
            }
            destBuffers.push(b);
            givenLength += b.length;
            i++;
        }
        this.buffers = this.buffers.slice(i);
        this.buffersLength = this.getBufferLength();
        const result = BufferUtils.concatBuffers(destBuffers);
        this.pos += givenLength;
        return result;
    }
    async read(amount) {
        if (amount <= 0) {
            return BufferUtils.zeroBuffer(0);
        }
        if (this.buffersLength >= amount) {
            const result = this.get(amount);
            this.end = this.streamEnd && this.buffersLength === 0;
            return result;
        }
        if (this.streamEnd) {
            if (this.buffersLength === 0) {
                return BufferUtils.zeroBuffer(0);
            }
            const result = BufferUtils.concatBuffers(this.buffers);
            this.buffers = [];
            this.buffersLength = 0;
            this.pos += result.length;
            this.end = this.streamEnd;
            return result;
        }
        await this.resume();
        return await this.read(amount);
    }
    unshift(buffer) {
        if (buffer.length === 0) {
            return;
        }
        this.buffers.unshift(buffer);
        this.buffersLength = this.getBufferLength();
        this.pos -= buffer.length;
        this.end = this.streamEnd && this.buffersLength === 0;
    }
    async scan(buffer) {
        const result = BufferUtils.concatBuffers(this.buffers);
        const index = BufferUtils.indexOfBuffer(result, buffer);
        if (index >= 0) {
            this.pos += index;
            this.buffers = [result.subarray(index)];
            this.buffersLength = this.getBufferLength();
            return this.pos;
        }
        if (this.end) {
            return -1;
        }
        const keepLength = Math.min(result.length, Math.max(buffer.length - 1, 0));
        const discardLength = result.length - keepLength;
        this.pos += discardLength;
        this.buffers = keepLength > 0 ? [result.subarray(discardLength)] : [];
        this.buffersLength = this.getBufferLength();
        await this.resume();
        return this.scan(buffer);
    }
}
//# sourceMappingURL=stream-reader.js.map