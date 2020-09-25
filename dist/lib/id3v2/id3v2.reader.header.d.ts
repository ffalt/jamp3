/// <reference types="node" />
import { IID3V2 } from './id3v2.types';
import { ReaderStream } from '../common/stream-reader';
export declare class ID3v2HeaderReader {
    private readID3ExtendedHeaderV3;
    private readID3ExtendedHeaderV4;
    private readID3v22Header;
    private readID3v23Header;
    private readID3v24Header;
    readID3v2Header(buffer: Buffer, offset: number): IID3V2.TagHeader | undefined;
    readHeader(reader: ReaderStream): Promise<{
        rest?: Buffer;
        header?: IID3V2.TagHeader;
    }>;
}
