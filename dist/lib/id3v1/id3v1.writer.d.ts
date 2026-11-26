import { IID3V1 } from './id3v1.types.js';
import { WriterStream } from '../common/stream-writer.js';
export declare class ID3v1Writer {
    write(stream: WriterStream, tag: IID3V1.ID3v1Tag, version: number): Promise<void>;
}
