import { IID3V2 } from './id3v2.types';
export declare class ID3V2FramesCollect {
    protected encoding?: string | undefined;
    protected frameValues: IID3V2.Frames.Map;
    constructor(encoding?: string | undefined);
    protected replace(key: string, frame: IID3V2.Frame): void;
    protected replaceFrame<T>(key: string, value: T): void;
    protected add(key: string, frame: IID3V2.Frame): void;
    protected addFrame<T>(key: string, value: T): void;
    protected addIDFrame<T extends {
        id: string;
    }>(key: string, value: T): void;
    protected head(): IID3V2.FrameHeader;
    build(): IID3V2.Frames.Map;
}
