/// <reference types="node" />
export interface IEncoding {
    name: string;
    byte: number;
    bom?: Array<number>;
    terminator: Buffer;
    encode: (val: string) => Buffer;
    decode: (buffer: Buffer) => string;
}
export declare const Encodings: {
    [name: string]: IEncoding;
};
