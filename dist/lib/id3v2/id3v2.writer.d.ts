import { IID3V2 } from './id3v2.types';
import { WriterStream } from '../common/stream-writer';
import { Id3v2RawWriterOptions } from './id3v2.writer.raw';
export interface Id3v2WriterOptions extends Id3v2RawWriterOptions {
    paddingSize?: number;
}
export declare class ID3v2Writer {
    write(stream: WriterStream, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader, options: Id3v2WriterOptions): Promise<void>;
}
