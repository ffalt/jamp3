export interface IMP3Warning {
    msg: string;
    expected: number | string | boolean;
    actual: number | string | boolean;
}
export interface IMP3AnalyzerOptions {
    xing: boolean;
    mpeg: boolean;
    id3v2: boolean;
    id3v1: boolean;
}
export interface IMP3Report {
    filename: string;
    format: string;
    mode: string;
    durationMS: number;
    bitRate: number;
    frames: number;
    header?: string;
    channelMode?: string;
    channels: number;
    id3v2: boolean;
    id3v1: boolean;
    msgs: Array<IMP3Warning>;
}
export declare class MP3Analyzer {
    read(filename: string, options: IMP3AnalyzerOptions): Promise<IMP3Report>;
}
