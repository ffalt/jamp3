/// <reference types="node" />
export declare function isBitSetAt(byte: number, bit: number): boolean;
export declare function flags(names: Array<string>, values: Array<number>): {
    [name: string]: boolean;
};
export declare function unflags(names: Array<string>, flagsObj?: {
    [name: string]: boolean | undefined;
}): Array<number>;
export declare function synchsafe(input: number): number;
export declare function unsynchsafe(input: number): number;
export declare function log2(x: number): number;
export declare function bitarray(byte: number): Array<number>;
export declare function unbitarray(bitsarray: Array<number>): number;
export declare function bitarray2(byte: number): Array<number>;
export declare function isBit(field: number, nr: number): boolean;
export declare function removeZeroString(s: string): string;
export declare function neededStoreBytes(num: number, min: number): number;
export declare function fileRangeToBuffer(filename: string, start: number, end: number): Promise<Buffer>;
export declare function collectFiles(dir: string, ext: Array<string>, recursive: boolean, onFileCB: (filename: string) => Promise<void>): Promise<void>;
