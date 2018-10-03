import { IMP3 } from './mp3__types';
export declare function isHeadFrame(frame: IMP3.Frame): boolean;
export declare function analyzeBitrateMode(frames: Array<IMP3.Frame>): {
    encoded: string;
    bitRate: number;
    duration: number;
    count: number;
    audioBytes: number;
};
export declare class MP3 {
    prepareResult(opts: IMP3.ReadOptions, layout: IMP3.Layout): Promise<IMP3.Result>;
    read(opts: IMP3.ReadOptions): Promise<IMP3.Result>;
}
