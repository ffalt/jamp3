/// <reference types="node" />
import { WriterStream } from '../common/streams';
import { IFrameImpl } from './id3v2_frame';
import { IID3V2 } from './id3v2__types';
interface IFrameDef {
    title: string;
    impl: IFrameImpl;
    versions: Array<number>;
    upgrade?: string;
    upgradeValue?: (value: any) => IID3V2.FrameValue.Base | undefined;
}
export declare const FrameDefs: {
    [id: string]: IFrameDef;
};
export declare function findId3v2FrameDef(id: string): IFrameDef | null;
export declare function matchFrame(id: string): IFrameDef;
export declare function removeUnsync(data: Buffer): Buffer;
export declare function isKnownFrameId(id: string): boolean;
export declare function isValidFrameBinId(id: Buffer): boolean;
export declare function isValidFrameId(id: string): boolean;
export declare function writeSubFrames(frames: Array<IID3V2.Frame>, stream: WriterStream, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<void>;
export declare function readSubFrames(bin: Buffer, head: IID3V2.TagHeader): Promise<Array<IID3V2.Frame>>;
export declare function writeToRawFrames(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<Array<IID3V2.RawFrame>>;
export declare function upgrade23DateFramesTov24Date(dateFrames: Array<IID3V2.Frame>): IID3V2.Frame | undefined;
export declare function ensureID3v2FrameVersionDef(id: string, dest: number): string | null;
export declare function readID3v2Frame(rawFrame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<IID3V2.Frame>;
export {};
