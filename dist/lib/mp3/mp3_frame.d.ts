/// <reference types="node" />
import { IMP3 } from './mp3__types';
export declare function expandRawHeader(header: IMP3.FrameRawHeader): IMP3.FrameHeader;
export declare class MPEGFrameReader {
    readMPEGFrameHeader(buffer: Buffer, offset: number): IMP3.FrameRawHeader | null;
    private verfiyCRC;
    private readLame;
    private readVbri;
    private readXing;
    readFrame(chunk: Buffer, offset: number, header: IMP3.FrameRawHeader): {
        offset: number;
        frame: IMP3.RawFrame;
    };
}
