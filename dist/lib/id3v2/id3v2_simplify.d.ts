import { IID3V2 } from './id3v2__types';
export declare function simplyfyFrame(frame: IID3V2.Frame): {
    slug: string;
    text: string;
} | null;
export declare function simplifyTag(tag: IID3V2.Tag): IID3V2.TagSimplified;
