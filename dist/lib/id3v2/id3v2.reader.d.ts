/// <reference types="node" />
import { IID3V2 } from './id3v2.types';
import { Readable } from 'stream';
import { ReaderStream } from '../common/stream-reader';
import { ID3v2HeaderReader } from './id3v2.reader.header';
export declare class ID3v2Reader {
    headerReader: ID3v2HeaderReader;
    private readRawTag;
    private scan;
    private scanReaderStream;
    readReaderStream(reader: ReaderStream): Promise<{
        rest?: Buffer;
        tag?: IID3V2.RawTag;
    }>;
    readStream(stream: Readable): Promise<IID3V2.RawTag | undefined>;
    read(filename: string): Promise<IID3V2.RawTag | undefined>;
    readFrames(data: Buffer, tag: IID3V2.RawTag): Promise<Buffer>;
    private defaultRawFrame;
    private readFrame;
}
