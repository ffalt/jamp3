export declare const ID3v2_MARKER = "ID3";
export declare const ID3v2_HEADER: {
    SYNCSAVEINT: Array<number>;
    SIZE: number;
};
export declare const ID3v2_HEADER_FLAGS: {
    [ver: number]: Array<string>;
};
export declare const ID3v2_ENCODINGS: {
    [version: number]: {
        [id: string]: string;
    };
};
export declare const ID3v2_UnifiedENCODINGS: {
    [id: string]: string;
};
export declare const ID3v2_FRAME_HEADER: {
    SYNCSAVEINT: Array<number>;
};
export declare const ID3v2_FRAME_HEADER_LENGTHS: {
    [name: string]: {
        [ver: number]: number;
    };
};
export declare const ID3v2_FRAME_FLAGS2: {
    [ver: number]: Array<string>;
};
export declare const ID3v2_FRAME_FLAGS1: {
    [ver: number]: Array<string>;
};
export declare const ID3v2_EXTHEADER: {
    3: {
        FLAGS1: Array<string>;
        FLAGS2: Array<string>;
        CRCDATASIZE: number;
    };
    4: {
        FLAGS: Array<string>;
    };
    SYNCSAVEINT: Array<number>;
};
