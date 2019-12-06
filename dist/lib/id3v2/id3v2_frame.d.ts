import { IEncoding } from '../common/encodings';
import { IID3V2 } from './id3v2__types';
import { WriterStream } from '../common/stream-writer';
import { BufferReader } from '../common/buffer-reader';
export interface IFrameImpl {
    parse: (reader: BufferReader, frame: IID3V2.RawFrame, head: IID3V2.TagHeader) => Promise<{
        value: IID3V2.FrameValue.Base;
        encoding?: IEncoding;
        subframes?: Array<IID3V2.Frame>;
    }>;
    write: (frame: IID3V2.Frame, stream: WriterStream, head: IID3V2.TagHeader, defaultEncoding?: string) => Promise<void>;
    simplify: (value: any) => string | null;
}
export declare const FrameIdAscii: IFrameImpl;
export declare const FrameLangDescText: IFrameImpl;
export declare const FrameLangText: IFrameImpl;
export declare const FrameIdBin: IFrameImpl;
export declare const FrameCTOC: IFrameImpl;
export declare const FrameCHAP: IFrameImpl;
export declare const FramePic: IFrameImpl;
export declare const FrameText: IFrameImpl;
export declare const FrameTextConcatList: IFrameImpl;
export declare const FrameTextList: IFrameImpl;
export declare const FrameAsciiValue: IFrameImpl;
export declare const FrameIdText: IFrameImpl;
export declare const FrameMusicCDId: IFrameImpl;
export declare const FramePlayCounter: IFrameImpl;
export declare const FramePopularimeter: IFrameImpl;
export declare const FrameRelativeVolumeAdjustment: IFrameImpl;
export declare const FrameRelativeVolumeAdjustment2: IFrameImpl;
export declare const FramePartOfCompilation: IFrameImpl;
export declare const FramePCST: IFrameImpl;
export declare const FrameETCO: IFrameImpl;
export declare const FrameAENC: IFrameImpl;
export declare const FrameLINK: IFrameImpl;
export declare const FrameSYLT: IFrameImpl;
export declare const FrameGEOB: IFrameImpl;
export declare const FrameRGAD: IFrameImpl;
export declare const FrameUnknown: IFrameImpl;
