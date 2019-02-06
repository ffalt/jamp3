import { IID3V2 } from './id3v2__types';
export declare function buildID3v2(tag: IID3V2.RawTag): Promise<IID3V2.Tag>;
export declare class ID3v2 {
    read(filename: string): Promise<IID3V2.Tag | undefined>;
    extractRaw(filename: string): Promise<Buffer | undefined>;
    private writeTag;
    replaceTag(filename: string, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader): Promise<void>;
    write(filename: string, tag: IID3V2.Tag, version: number, rev: number): Promise<void>;
}
