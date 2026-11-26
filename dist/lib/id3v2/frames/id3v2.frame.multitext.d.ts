import { IEncoding } from '../../common/encodings.js';
import { BufferReader } from '../../common/buffer-reader.js';
import { WriterStream } from '../../common/stream-writer.js';
export declare function readMultiTextValues(reader: BufferReader, enc: IEncoding): Array<string>;
export declare function writeMultiTextValues(stream: WriterStream, list: Array<string>, enc: IEncoding): Promise<void>;
