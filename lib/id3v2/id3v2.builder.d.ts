/// <reference types="node" />
import { IID3V2 } from './id3v2.types';
import { ID3V2FramesCollect } from './id3v2.builder.collect';
export declare class ID3V2RawBuilder extends ID3V2FramesCollect {
    audioEncryption(key: string, id: string, previewStart: number, previewLength: number, bin: Buffer): void;
    bool(key: string, bool: boolean): void;
    chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): void;
    chapterTOC(key: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>): void;
    eventTimingCodes(key: string, timeStampFormat: number, events: Array<{
        type: number;
        timestamp: number;
    }>): void;
    idBin(key: string, id: string, binary: Buffer): void;
    idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined): void;
    idText(key: string, id: string, value: string | undefined): void;
    keyTextList(key: string, group: string, value?: string): void;
    langText(key: string, language: string, text: string): void;
    linkedInformation(key: string, id: string, url: string, additional: Array<string>): void;
    nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined): void;
    number(key: string, num: number | undefined): void;
    object(key: string, filename: string, mimeType: string, contentDescription: string, bin: Buffer): void;
    picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer): void;
    popularimeter(key: string, email: string, rating: number, count: number): void;
    relativeVolumeAdjustment(key: string, right: number, left: number, peakRight?: number, peakLeft?: number, rightBack?: number, leftBack?: number, peakRightBack?: number, peakLeftBack?: number, center?: number, peakCenter?: number, bass?: number, peakBass?: number): void;
    relativeVolumeAdjustment2(key: string, id: string, channels: Array<{
        type: number;
        adjustment: number;
        peak?: number;
    }>): void;
    replayGainAdjustment(key: string, peak: number, radioAdjustment: number, audiophileAdjustment: number): void;
    synchronisedLyrics(key: string, id: string, language: string, timestampFormat: number, contentType: number, events: Array<{
        timestamp: number;
        text: string;
    }>): void;
    text(key: string, text: string | undefined): void;
    unknown(key: string, binary: Buffer): void;
}
