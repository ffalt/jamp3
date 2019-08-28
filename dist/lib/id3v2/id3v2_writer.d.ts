import { WriterStream } from '../common/streams';
import { IID3V2 } from './id3v2__types';
export interface Id3v2RawWriterOptions {
    paddingSize?: number;
}
export declare class Id3v2RawWriter {
    stream: WriterStream;
    frames: Array<IID3V2.RawFrame>;
    head: IID3V2.TagHeader;
    paddingSize: number;
    constructor(stream: WriterStream, head: IID3V2.TagHeader, options: Id3v2RawWriterOptions, frames?: Array<IID3V2.RawFrame>);
    private writeHeader;
    private writeExtHeaderV3;
    private writeExtHeaderV4;
    private writeFrames;
    private writeEnd;
    writeFrame(frame: IID3V2.RawFrame): Promise<void>;
    write(): Promise<void>;
}
export interface Id3v2WriterOptions extends Id3v2RawWriterOptions {
    paddingSize?: number;
}
export declare class ID3v2Writer {
    write(stream: WriterStream, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader, options: Id3v2WriterOptions): Promise<void>;
}
