/// <reference types="node" />
import { IFrameDef } from './id3v2.frame.defs';
interface IFrameMatch {
    match: (id: string) => boolean;
    matchBin: (id: Buffer) => boolean;
    value: IFrameDef;
}
export declare const Matcher: Array<IFrameMatch>;
export declare function findId3v2FrameDef(id: string): IFrameDef | null;
export declare function matchFrame(id: string): IFrameDef;
export declare function isValidFrameBinId(id: Buffer): boolean;
export {};
