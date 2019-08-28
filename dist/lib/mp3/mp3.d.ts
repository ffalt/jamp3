/// <reference types="node" />
import { IMP3 } from './mp3__types';
import { Readable } from 'stream';
export declare class MP3 {
    private prepareResult;
    readStream(stream: Readable, options: IMP3.ReadOptions, streamSize?: number): Promise<IMP3.Result>;
    read(filename: string, options: IMP3.ReadOptions): Promise<IMP3.Result>;
    removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<IMP3.RemoveResult | undefined>;
}
