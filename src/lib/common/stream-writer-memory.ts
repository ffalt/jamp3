import { WriterStream } from './stream-writer';
import MemoryStream from 'memory-stream';

export class MemoryWriterStream extends WriterStream {
	toBuffer(): Buffer {
		return (this.wstream as MemoryStream).toBuffer();
	}
}
