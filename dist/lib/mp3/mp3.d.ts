/// <reference types="node" />
import { Readable } from 'stream';
import { IMP3 } from './mp3.types';
export declare class MP3 {
    readStream(stream: Readable, options: IMP3.ReadOptions, streamSize?: number): Promise<IMP3.Result>;
    read(filename: string, options: IMP3.ReadOptions): Promise<IMP3.Result>;
    removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<IMP3.RemoveResult | undefined>;
}
