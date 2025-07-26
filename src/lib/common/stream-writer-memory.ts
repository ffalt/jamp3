import { WriterStream } from './stream-writer';

export class MemoryWriterStream extends WriterStream {
	toBuffer(): Buffer {
		return (this.wstream as any).toBuffer(); // TODO: type Memorystream
	}
}
