/// <reference types="node" />
import { IID3V2 } from '../id3v2.types';
export declare function buildID3v2(tag: IID3V2.RawTag): Promise<IID3V2.Tag>;
export declare function readSubFrames(bin: Buffer, head: IID3V2.TagHeader): Promise<Array<IID3V2.Frame>>;
export declare function readID3v2Frame(rawFrame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<IID3V2.Frame>;
