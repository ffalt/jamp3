"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryWriterStream = void 0;
const stream_writer_1 = require("./stream-writer");
class MemoryWriterStream extends stream_writer_1.WriterStream {
    constructor() {
        super();
    }
    toBuffer() {
        return this.wstream.toBuffer();
    }
}
exports.MemoryWriterStream = MemoryWriterStream;
//# sourceMappingURL=stream-writer-memory.js.map