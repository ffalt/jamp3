import { WriterStream } from './stream-writer.js';
export class MemoryWriterStream extends WriterStream {
    toBuffer() {
        return this.wstream.toBuffer();
    }
}
//# sourceMappingURL=stream-writer-memory.js.map