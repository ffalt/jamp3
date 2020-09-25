import { IID3V1, IID3V2 } from '../..';
export declare namespace IMP3Analyzer {
    export import Warning = IID3V2.Warning;
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
