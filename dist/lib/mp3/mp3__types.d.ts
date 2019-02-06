import { IID3V2 } from '../id3v2/id3v2__types';
import { IID3V1 } from '../id3v1/id3v1__types';
import { ITag } from '../common/types';
export declare namespace IMP3 {
    interface ReadOptions {
        filename: string;
        mpeg?: boolean;
        mpegQuick?: boolean;
        id3v2?: boolean;
        id3v1?: boolean;
        id3v1IfNotid3v2?: boolean;
        raw?: boolean;
        fileSize?: number;
    }
    interface MPEG {
        durationEstimate: number;
        durationRead: number;
        channels: number;
        bitRate: number;
        sampleRate: number;
        sampleCount: number;
        frameCount: number;
        frameCountDeclared: number;
        audioBytes: number;
        audioBytesDeclared: number;
        encoded: string;
        mode: string;
        version: string;
        layer: string;
    }
    interface Result {
        size: number;
        mpeg?: MPEG;
        id3v2?: IID3V2.Tag;
        id3v1?: IID3V1.Tag;
        frames?: Array<IMP3.Frame>;
        raw?: IMP3.Layout;
    }
    interface FrameRawHeader {
        offset: number;
        size: number;
        versionIdx: number;
        layerIdx: number;
        sampleIdx: number;
        bitrateIdx: number;
        modeIdx: number;
        modeExtIdx: number;
        emphasisIdx: number;
        padded: boolean;
        protected: boolean;
        copyright: boolean;
        original: boolean;
        privatebit: number;
    }
    interface FrameHeader extends FrameRawHeader {
        version: string;
        layer: string;
        channelMode: string;
        channelType: string;
        channelCount: number;
        extension?: IMP3.FrameHeaderJointExtension;
        emphasis: string;
        time: number;
        samplingRate: number;
        bitRate: number;
        samples: number;
    }
    interface FrameHeaderJointExtension {
        bands_min?: number;
        bands_max?: number;
        intensity?: number;
        ms?: number;
    }
    interface VBRI {
        version: number;
        delay: number;
        quality: number;
        bytes: number;
        frames: number;
        toc_entries: number;
        toc_scale: number;
        toc_entry_size: number;
        toc_frames: number;
        toc: Buffer;
    }
    interface Xing {
        frames?: number;
        bytes?: number;
        quality?: number;
        toc?: Buffer;
        fields: {
            frames: boolean;
            bytes: boolean;
            toc: boolean;
            quality: boolean;
        };
    }
    interface RawFrame {
        header: IMP3.FrameRawHeader;
        mode?: string;
        xing?: Xing;
        vbri?: VBRI;
    }
    interface Frame extends RawFrame {
        header: IMP3.FrameHeader;
    }
    interface Layout {
        frames: Array<IMP3.RawFrame>;
        tags: Array<ITag>;
        size: number;
    }
}
