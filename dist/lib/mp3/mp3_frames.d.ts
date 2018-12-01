import { IMP3 } from './mp3__types';
export interface IMPEGFrameChain {
    frame: IMP3.RawFrame;
    pos: number;
    count: number;
}
export declare function getBestMPEGChain(frames: Array<IMP3.RawFrame>, followMaxChain: number): IMPEGFrameChain | undefined;
export declare function filterBestMPEGChain(frames: Array<IMP3.RawFrame>, followMaxChain: number): Array<IMP3.RawFrame>;
