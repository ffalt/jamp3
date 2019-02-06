export declare class Markers {
    static MARKERS: {
        [name: string]: Array<number>;
    };
    static makeMarker(str: string): Array<number>;
    static isMarker(buffer: Buffer, offset: number, marker: Array<number>): boolean;
}
