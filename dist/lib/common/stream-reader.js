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
exports.ReaderStream = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const buffer_1 = require("./buffer");
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
                this.readableStream.on('error', error => reject(error));
                this.readableStream.on('end', () => {
                    this.end = true;
                    this.streamEnd = true;
                    if (this.waiting) {
                        const w = this.waiting;
                        this.waiting = null;
                        w();
                    }
                });
                this.readableStream.on('data', chunk => {
                    if (this.streamOnData) {
                        this.streamOnData(chunk);
                    }
                });
                this.waiting = () => resolve();
            });
        });
    }
    open(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.readableStream = node_fs_1.default.createReadStream(filename);
            }
            catch (error) {
                return Promise.reject(error);
            }
            if (!this.readableStream) {
                return Promise.reject(new Error(`Could not open file ${filename}`));
            }
            yield this.openStream(this.readableStream);
        });
    }
    consumeToEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pos += this.buffersLength;
            this.buffers = [];
            this.streamOnData = this.onSkip;
            while (!this.streamEnd) {
                yield this.resume();
            }
        });
    }
    close() {
        const stream = this.readableStream;
        this.readableStream = null;
        if (stream) {
            if (typeof stream.close === 'function') {
                stream.close();
            }
            stream.destroy();
        }
    }
    getBufferLength() {
        let result = 0;
        for (const buffer of this.buffers) {
            result += buffer.length;
        }
        return result;
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.readableStream) {
                this.streamEnd = true;
                return;
            }
            return new Promise((resolve, _reject) => {
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
                this.buffers[i] = b.subarray(need);
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
                destBuffers.push(b.subarray(0, need));
                this.buffers[i] = b.subarray(need);
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
            const toRead = Math.max(1, amount);
            if ((this.buffersLength >= toRead)) {
                const result = this.get(toRead);
                this.end = this.streamEnd && this.buffersLength === 0;
                return result;
            }
            if (this.streamEnd) {
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
            else {
                yield this.resume();
                return yield this.read(toRead);
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
                this.buffers = [result.subarray(index)];
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
//# sourceMappingURL=stream-reader.js.map