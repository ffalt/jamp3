/// <reference types="node" />
import { IID3V2 } from './id3v2__types';
interface ID3V2Frames {
    [key: string]: Array<IID3V2.Frame>;
}
export declare class ID3V2RawBuilder {
    private frameValues;
    build(): ID3V2Frames;
    text(key: string, text: string | undefined): void;
    idText(key: string, id: string, value: string | undefined): void;
    nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined): void;
    keyTextList(key: string, group: string, value?: string): void;
    bool(key: string, bool: boolean): void;
    idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined): void;
    picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer): void;
    idBin(key: string, id: string, binary: Buffer): void;
    chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): void;
}
export declare class ID3V24TagBuilder {
    rawBuilder: ID3V2RawBuilder;
    buildFrames(): Array<IID3V2.Frame>;
    buildTag(): IID3V2.Tag;
    artist(value?: string): this;
    artistSort(value?: string): ID3V24TagBuilder;
    albumArtist(value?: string): ID3V24TagBuilder;
    albumArtistSort(value?: string): ID3V24TagBuilder;
    album(value?: string): ID3V24TagBuilder;
    albumSort(value?: string): ID3V24TagBuilder;
    originalAlbum(value?: string): ID3V24TagBuilder;
    originalArtist(value: string): ID3V24TagBuilder;
    originalDate(value: string): ID3V24TagBuilder;
    title(value?: string): ID3V24TagBuilder;
    work(value?: string): ID3V24TagBuilder;
    titleSort(value?: string): ID3V24TagBuilder;
    genre(value?: string): ID3V24TagBuilder;
    bmp(value?: string | number): ID3V24TagBuilder;
    mood(value?: string): ID3V24TagBuilder;
    media(value?: string): ID3V24TagBuilder;
    language(value?: string): ID3V24TagBuilder;
    grouping(value?: string): ID3V24TagBuilder;
    date(value?: string): ID3V24TagBuilder;
    track(trackNr?: string | number, trackTotal?: string | number): ID3V24TagBuilder;
    disc(discNr?: string | number, discTotal?: string | number): ID3V24TagBuilder;
    year(year?: number): ID3V24TagBuilder;
    artists(value?: string): ID3V24TagBuilder;
    isCompilation(value?: boolean | number | string): ID3V24TagBuilder;
    originalYear(value?: string): ID3V24TagBuilder;
    composer(value?: string): ID3V24TagBuilder;
    composerSort(value?: string): ID3V24TagBuilder;
    remixer(value?: string): ID3V24TagBuilder;
    label(value?: string): ID3V24TagBuilder;
    subtitle(value?: string): ID3V24TagBuilder;
    discSubtitle(value?: string): ID3V24TagBuilder;
    lyricist(value?: string): ID3V24TagBuilder;
    lyrics(value?: string, lang?: string, id?: string): ID3V24TagBuilder;
    encoder(value?: string): ID3V24TagBuilder;
    encoderSettings(value?: string): ID3V24TagBuilder;
    key(value?: string): ID3V24TagBuilder;
    copyright(value?: string): ID3V24TagBuilder;
    isrc(value?: string): ID3V24TagBuilder;
    barcode(value?: string): ID3V24TagBuilder;
    asin(value?: string): ID3V24TagBuilder;
    catalogNumber(value?: string): ID3V24TagBuilder;
    script(value?: string): ID3V24TagBuilder;
    license(value?: string): ID3V24TagBuilder;
    website(value?: string): ID3V24TagBuilder;
    movement(value?: string): ID3V24TagBuilder;
    movementNr(nr?: string | number, total?: string | number): ID3V24TagBuilder;
    writer(value?: string): ID3V24TagBuilder;
    custom(id: string, value?: string): ID3V24TagBuilder;
    musicianCredit(group: string, value?: string): ID3V24TagBuilder;
    involved(group: string, value?: string): ID3V24TagBuilder;
    mbAlbumStatus(value?: string): ID3V24TagBuilder;
    mbAlbumType(value?: string): ID3V24TagBuilder;
    mbAlbumReleaseCountry(value?: string): ID3V24TagBuilder;
    mbTrackID(value?: string): ID3V24TagBuilder;
    mbReleaseTrackID(value?: string): ID3V24TagBuilder;
    mbAlbumID(value?: string): ID3V24TagBuilder;
    mbOriginalAlbumID(value?: string): ID3V24TagBuilder;
    mbArtistID(value?: string): ID3V24TagBuilder;
    mbOriginalArtistID(value?: string): ID3V24TagBuilder;
    mbAlbumArtistID(value?: string): ID3V24TagBuilder;
    mbReleaseGroupID(value?: string): ID3V24TagBuilder;
    mbWorkID(value?: string): ID3V24TagBuilder;
    mbTRMID(value?: string): ID3V24TagBuilder;
    mbDiscID(value?: string): ID3V24TagBuilder;
    acoustidID(value?: string): ID3V24TagBuilder;
    acoustidFingerprint(value?: string): ID3V24TagBuilder;
    musicIPPUID(value?: string): ID3V24TagBuilder;
    comment(id: string, value?: string): ID3V24TagBuilder;
    trackLength(value?: number | string): ID3V24TagBuilder;
    mbTrackDisambiguation(value?: string): ID3V24TagBuilder;
    picture(pictureType: number, description: string, mimeType: string, binary: Buffer): ID3V24TagBuilder;
    chapter(id: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): ID3V24TagBuilder;
    priv(id: string, binary: Buffer): ID3V24TagBuilder;
}
export {};
