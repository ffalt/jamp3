/// <reference types="node" />
import { IID3V1 } from './id3v1__types';
import { Readable } from 'stream';
import { ReaderStream } from '../common/stream-reader';
export declare class ID3v1Reader {
    readTag(data: Buffer): IID3V1.Tag | null;
    readReaderStream(reader: ReaderStream): Promise<IID3V1.Tag | undefined>;
    readStream(stream: Readable): Promise<IID3V1.Tag | undefined>;
    read(filename: string): Promise<IID3V1.Tag | undefined>;
}
