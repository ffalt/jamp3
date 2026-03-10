export declare class Markers {
    static MARKERS: Record<string, Array<number>>;
    static makeMarker(str: string): Array<number>;
    static isMarker(buffer: Buffer, offset: number, marker: Array<number>): boolean;
}
