/// <reference types="node" />
import { IID3V2 } from '../id3v2/id3v2.types';
import { IID3V1 } from '../id3v1/id3v1.types';
import { ITag } from '../common/types';
export declare namespace IMP3 {
    interface ReadOptions {
        mpeg?: boolean;
        mpegQuick?: boolean;
        id3v2?: boolean;
        id3v1?: boolean;
        id3v1IfNotID3v2?: boolean;
        detectDuplicateID3v2?: boolean;
        raw?: boolean;
    }
    interface Result {
        size: number;
        id3v2?: IID3V2.Tag;
        id3v1?: IID3V1.Tag;
        mpeg?: MPEG;
        frames?: MPEGFrames;
        raw?: RawLayout;
    }
    interface RemoveTagsOptions {
        id3v2: boolean;
        id3v1: boolean;
        keepBackup?: boolean;
    }
    interface RemoveResult {
        id3v2: boolean;
        id3v1: boolean;
    }
    interface MPEGFrames {
        headers: Array<IMP3.Frame>;
        audio: Array<IMP3.FrameRawHeaderArray>;
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
    interface FrameRawHeader {
        offset: number;
        front: number;
        back: number;
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
    interface Frame {
        header: FrameHeader;
        mode?: string;
        xing?: Xing;
        vbri?: VBRI;
    }
    type FrameRawHeaderArray = Array<number>;
    interface RawFrame {
        header: FrameRawHeaderArray;
        mode?: string;
        xing?: Xing;
        vbri?: VBRI;
    }
    interface RawLayout {
        frameheaders: Array<FrameRawHeaderArray>;
        headframes: Array<RawFrame>;
        tags: Array<ITag>;
        size: number;
    }
}