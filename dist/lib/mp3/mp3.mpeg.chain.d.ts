import { IMP3 } from './mp3.types';
export interface IMPEGFrameChain {
    frame: Array<number>;
    pos: number;
    count: number;
}
export declare function getBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): IMPEGFrameChain | undefined;
export declare function filterBestMPEGChain(frames: Array<IMP3.FrameRawHeaderArray>, followMaxChain: number): Array<IMP3.FrameRawHeaderArray>;
