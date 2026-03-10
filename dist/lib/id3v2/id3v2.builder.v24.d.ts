import { ID3V2TagBuilder } from './id3v2.builder.v2';
import { IID3V2 } from './id3v2.types';
export declare class ID3V24TagBuilder extends ID3V2TagBuilder {
    static encodings: {
        iso88591: string;
        ucs2: string;
        utf16be: string;
        utf8: string;
    };
    constructor(encoding?: string);
    version(): number;
    rev(): number;
    albumSort(value?: string): ID3V24TagBuilder;
    albumArtistSort(value?: string): ID3V24TagBuilder;
    artistSort(value?: string): ID3V24TagBuilder;
    chapter(id: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): ID3V24TagBuilder;
    chapterTOC(value: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>): ID3V24TagBuilder;
    composerSort(value?: string): ID3V24TagBuilder;
    date(value?: string): ID3V24TagBuilder;
    discSubtitle(value?: string): ID3V24TagBuilder;
    encodingDate(value?: string): ID3V24TagBuilder;
    involved(group: string, value?: string): ID3V24TagBuilder;
    isPodcast(value?: boolean | number | string): ID3V24TagBuilder;
    mood(value?: string): ID3V24TagBuilder;
    movement(value?: string): ID3V24TagBuilder;
    movementNr(nr?: string | number, total?: string | number): ID3V24TagBuilder;
    musicianCredit(group: string, value?: string): ID3V24TagBuilder;
    originalDate(value?: string): ID3V24TagBuilder;
    podcastDescription(value?: string): ID3V24TagBuilder;
    podcastFeedURL(value?: string): ID3V24TagBuilder;
    podcastKeywords(value?: string): ID3V24TagBuilder;
    podcastURL(value?: string): ID3V24TagBuilder;
    productionNotice(value?: string): ID3V24TagBuilder;
    relativeVolumeAdjustment2(id: string, channels: Array<{
        type: number;
        adjustment: number;
        peak?: number;
    }>): ID3V24TagBuilder;
    releaseDate(value?: string): ID3V24TagBuilder;
    replayGainAdjustment(peak: number, radioAdjustment: number, audiophileAdjustment: number): ID3V24TagBuilder;
    taggingDate(value?: string): ID3V24TagBuilder;
    titleSort(value?: string): ID3V24TagBuilder;
    work(value?: string): ID3V24TagBuilder;
    clearChapters(): ID3V24TagBuilder;
    clearChapterTOCs(): ID3V24TagBuilder;
    clearRelativeVolumeAdjustment2(): ID3V24TagBuilder;
    clearReplayGainAdjustment(): ID3V24TagBuilder;
}
