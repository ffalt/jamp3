/// <reference types="node" />
import { IID3V1 } from './id3v1__types';
import { Readable } from 'stream';
export declare class ID3v1 {
    read(filename: string): Promise<IID3V1.Tag | undefined>;
    readStream(stream: Readable): Promise<IID3V1.Tag | undefined>;
    write(filename: string, tag: IID3V1.Tag, version: number): Promise<void>;
}
