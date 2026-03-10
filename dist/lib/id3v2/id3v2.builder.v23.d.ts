import { ID3V2TagBuilder } from './id3v2.builder.v2';
export declare class ID3V23TagBuilder extends ID3V2TagBuilder {
    static encodings: {
        iso88591: string;
        ucs2: string;
    };
    constructor(encoding?: string);
    version(): number;
    rev(): number;
    albumSort(value?: string): ID3V23TagBuilder;
    albumArtistSort(value?: string): ID3V23TagBuilder;
    artistSort(value?: string): ID3V23TagBuilder;
    composerSort(value?: string): ID3V23TagBuilder;
    date(value?: string): ID3V23TagBuilder;
    involved(group: string, value?: string): ID3V23TagBuilder;
    originalDate(value?: string): ID3V23TagBuilder;
    titleSort(value?: string): ID3V23TagBuilder;
}
