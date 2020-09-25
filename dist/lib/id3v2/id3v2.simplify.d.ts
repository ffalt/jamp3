import { IID3V2 } from './id3v2.types';
export declare function simplifyInvolvedPeopleList(id: string, frame: IID3V2.Frame): Array<{
    slug: string;
    text: string;
}> | undefined;
export declare function simplifyFrame(frame: IID3V2.Frame, dropIDsList?: Array<string>): Array<{
    slug: string;
    text: string;
}> | undefined;
export declare function simplifyTag(tag: IID3V2.Tag, dropIDsList?: Array<string>): IID3V2.TagSimplified;
