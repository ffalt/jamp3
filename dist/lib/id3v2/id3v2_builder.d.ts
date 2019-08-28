/// <reference types="node" />
import { IID3V2 } from './id3v2__types';
export declare class ID3V2RawBuilder {
    private encoding?;
    constructor(encoding?: string | undefined);
    private frameValues;
    build(): IID3V2.Frames.Map;
    private replace;
    private add;
    private head;
    text(key: string, text: string | undefined): void;
    number(key: string, num: number | undefined): void;
    idText(key: string, id: string, value: string | undefined): void;
    nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined): void;
    keyTextList(key: string, group: string, value?: string): void;
    bool(key: string, bool: boolean): void;
    idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined): void;
    picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer): void;
    idBin(key: string, id: string, binary: Buffer): void;
    chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): void;
    synchronisedLyrics(key: string, id: string, language: string, timestampFormat: number, contentType: number, events: Array<{
        timestamp: number;
        text: string;
    }>): void;
    relativeVolumeAdjustment(key: string, right: number, left: number, peakRight?: number, peakLeft?: number, rightBack?: number, leftBack?: number, peakRightBack?: number, peakLeftBack?: number, center?: number, peakCenter?: number, bass?: number, peakBass?: number): void;
    relativeVolumeAdjustment2(key: string, id: string, channels: Array<{
        type: number;
        adjustment: number;
        peak?: number;
    }>): void;
    eventTimingCodes(key: string, timeStampFormat: number, events: Array<{
        type: number;
        timestamp: number;
    }>): void;
    unknown(key: string, binary: Buffer): void;
    object(key: string, filename: string, mimeType: string, contentDescription: string, bin: Buffer): void;
    popularimeter(key: string, email: string, rating: number, count: number): void;
    audioEncryption(key: string, id: string, previewStart: number, previewLength: number, bin: Buffer): void;
    linkedInformation(key: string, id: string, url: string, additional: Array<string>): void;
    langText(key: string, language: string, text: string): void;
    replayGainAdjustment(key: string, peak: number, radioAdjustment: number, audiophileAdjustment: number): void;
    chapterTOC(key: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>): void;
}
