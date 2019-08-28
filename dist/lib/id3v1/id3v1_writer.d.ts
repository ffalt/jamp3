import { WriterStream } from '../common/streams';
import { IID3V1 } from './id3v1__types';
export declare class ID3v1Writer {
    write(stream: WriterStream, tag: IID3V1.ID3v1Tag, version: number): Promise<void>;
}
