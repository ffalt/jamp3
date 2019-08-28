import { IID3V2 } from './id3v2__types';
export declare const PRIVMap: {
    [key: string]: string;
};
export declare const COMMMap: {
    [key: string]: string;
};
export declare const UFIDMap: {
    [key: string]: string;
};
export declare const TXXXMap: {
    [key: string]: string;
};
export declare const FramesMap: {
    [key: string]: string;
};
export declare const SplitFrameMap: {
    [key: string]: Array<string>;
};
export declare const DateUpgradeMap: {
    [key: string]: string;
};
export declare function simplifyFrame(frame: IID3V2.Frame, dropIDsList?: Array<string>): Array<{
    slug: string;
    text: string;
}> | null;
