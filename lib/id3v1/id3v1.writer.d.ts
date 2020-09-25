import { IID3V1 } from './id3v1.types';
import { WriterStream } from '../common/stream-writer';
export declare class ID3v1Writer {
    write(stream: WriterStream, tag: IID3V1.ID3v1Tag, version: number): Promise<void>;
}
