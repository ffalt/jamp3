/// <reference types="node" />
import { IMP3 } from './mp3__types';
export declare function colapseRawHeader(header: IMP3.FrameRawHeader): IMP3.FrameRawHeaderArray;
export declare function rawHeaderOffSet(header: IMP3.FrameRawHeaderArray): number;
export declare function rawHeaderSize(header: IMP3.FrameRawHeaderArray): number;
export declare function rawHeaderVersionIdx(header: IMP3.FrameRawHeaderArray): number;
export declare function rawHeaderLayerIdx(header: IMP3.FrameRawHeaderArray): number;
export declare function expandMPEGFrameFlags(front: number, back: number, offset: number): IMP3.FrameRawHeader | null;
export declare function expandRawHeaderArray(header: IMP3.FrameRawHeaderArray): IMP3.FrameRawHeader;
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
