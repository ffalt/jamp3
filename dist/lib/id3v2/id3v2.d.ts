/// <reference types="node" />
import { IID3V2 } from './id3v2__types';
import { Readable } from 'stream';
export declare function buildID3v2(tag: IID3V2.RawTag): Promise<IID3V2.Tag>;
export declare class ID3v2 {
    read(filename: string): Promise<IID3V2.Tag | undefined>;
    readStream(stream: Readable): Promise<IID3V2.Tag | undefined>;
    extractRaw(filename: string): Promise<Buffer | undefined>;
    private writeTag;
    private replaceTag;
    write(filename: string, tag: IID3V2.Tag, version: number, rev: number, keepBackup?: boolean, paddingSize?: number): Promise<void>;
}
