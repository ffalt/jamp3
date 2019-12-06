import { IID3V2 } from '../id3v2.types';
export declare function upgrade23DateFramesTov24Date(dateFrames: Array<IID3V2.Frame>): IID3V2.Frame | undefined;
export declare function ensureID3v2FrameVersionDef(id: string, dest: number): string | null;
