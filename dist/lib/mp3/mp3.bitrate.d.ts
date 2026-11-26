import { IMP3 } from './mp3.types.js';
export declare function analyzeBitrateMode(frames: Array<IMP3.FrameRawHeaderArray>): {
    encoded: string;
    bitRate: number;
    duration: number;
    count: number;
    audioBytes: number;
};
