/// <reference types="node" />
import { ReaderStream } from '../common/streams';
import { IID3V1 } from './id3v1__types';
export declare class ID3v1Reader {
    readTag(data: Buffer): IID3V1.Tag | null;
    readStream(reader: ReaderStream): Promise<IID3V1.Tag | undefined>;
    read(filename: string): Promise<IID3V1.Tag | undefined>;
}
