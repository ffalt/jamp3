import MemoryStream from 'memory-stream';
import { WriterStream } from './stream-writer.js';

export class MemoryWriterStream extends WriterStream {
	toBuffer(): Buffer {
		return (this.wstream as MemoryStream).toBuffer();
	}
}
