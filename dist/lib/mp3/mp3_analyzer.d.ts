import { IID3V1 } from '../id3v1/id3v1__types';
import { IID3V2 } from '../id3v2/id3v2__types';
export declare namespace IMP3Analyzer {
    interface Warning {
        msg: string;
        expected: number | string | boolean;
        actual: number | string | boolean;
    }
    interface Options {
        mpeg: boolean;
        id3v2: boolean;
        id3v1: boolean;
        xing: boolean;
        ignoreXingOffOne?: boolean;
    }
    interface Report {
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
        warnings: Array<Warning>;
        tags: {
            id3v2?: IID3V2.Tag;
            id3v1?: IID3V1.Tag;
        };
    }
}
export declare class MP3Analyzer {
    private analyzeID3v2;
    private analyzeID3v1;
    private analyzeMPEG;
    private analyzeXING;
    read(filename: string, options: IMP3Analyzer.Options): Promise<IMP3Analyzer.Report>;
}
