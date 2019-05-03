import { IID3V1 } from '../id3v1/id3v1__types';
import { IID3V2 } from '../id3v2/id3v2__types';
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
    ignoreXingOffOne?: boolean;
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
    tags: {
        id3v2?: IID3V2.Tag;
        id3v1?: IID3V1.Tag;
    };
}
export declare class MP3Analyzer {
    analyseID3v2(id3v2: IID3V2.Tag): Array<IMP3Warning>;
    read(filename: string, options: IMP3AnalyzerOptions): Promise<IMP3Report>;
}
