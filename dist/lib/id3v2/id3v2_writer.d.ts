import { WriterStream } from '../common/streams';
import { IID3V2 } from './id3v2__types';
export declare class Id3v2RawWriter {
    paddingSize: number;
    stream: WriterStream;
    frames: Array<IID3V2.RawFrame>;
    head: IID3V2.TagHeader;
    constructor(stream: WriterStream, head: IID3V2.TagHeader, frames?: Array<IID3V2.RawFrame>);
    private writeHeader;
    private writeExtHeader;
    writeFrame(frame: IID3V2.RawFrame): Promise<void>;
    private writeFrames;
    private writeEnd;
    write(): Promise<void>;
}
export declare class ID3v2Writer {
    write(stream: WriterStream, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader): Promise<void>;
}
