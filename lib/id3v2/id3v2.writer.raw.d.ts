import { WriterStream } from '../common/stream-writer';
import { IID3V2 } from './id3v2.types';
export interface Id3v2RawWriterOptions {
    paddingSize?: number;
}
export declare class Id3v2RawWriter {
    stream: WriterStream;
    frames: Array<IID3V2.RawFrame>;
    head: IID3V2.TagHeader;
    paddingSize: number;
    constructor(stream: WriterStream, head: IID3V2.TagHeader, options: Id3v2RawWriterOptions, frames?: Array<IID3V2.RawFrame>);
    private buildHeaderFlagsV4;
    private writeExtHeaderV4;
    private buildHeaderFlagsV3;
    private writeExtHeaderV3;
    private buildHeaderFlagsV2;
    private buildHeaderFlags;
    private calculateTagSize;
    private writeHeader;
    private writeFrames;
    private writeEnd;
    writeFrame(frame: IID3V2.RawFrame): Promise<void>;
    write(): Promise<void>;
}
