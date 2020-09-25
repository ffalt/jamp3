/// <reference types="node" />
import { Readable } from 'stream';
import { IID3V2 } from './id3v2.types';
export declare class ID3v2 {
    static check(tag: IID3V2.Tag): Array<IID3V2.Warning>;
    static simplify(tag: IID3V2.Tag, dropIDsList?: Array<string>): IID3V2.TagSimplified;
    read(filename: string): Promise<IID3V2.Tag | undefined>;
    readStream(stream: Readable): Promise<IID3V2.Tag | undefined>;
    readRaw(filename: string): Promise<Buffer | undefined>;
    remove(filename: string, options: IID3V2.RemoveOptions): Promise<boolean>;
    writeBuilder(filename: string, builder: IID3V2.Builder, options: IID3V2.WriteOptions): Promise<void>;
    write(filename: string, tag: IID3V2.ID3v2Tag, version: number, rev: number, options: IID3V2.WriteOptions): Promise<void>;
    private buildHead;
    private writeTag;
    private copyAudio;
    private replaceTag;
}
