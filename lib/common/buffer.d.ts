/// <reference types="node" />
export declare class BufferUtils {
    static indexOfNr(buffer: Buffer, num: number, start?: number): number;
    static indexOfNrs(buffer: Buffer, num: Array<number> | Buffer, start: number, stepWidth: number): number;
    static scanBufferTextPos(buffer: Buffer, search: Array<number> | Buffer, start?: number): number;
    static concatBuffer(buffer: Buffer, appendbuffer: Buffer): Buffer;
    static concatBuffers(buffers: Array<Buffer>): Buffer;
    static indexOfBuffer(buffer: Buffer, search: Array<number> | Buffer, start?: number): number;
    private static indexOfBufferStep;
    static compareBuffer(buffer: Buffer, buffer2: Buffer): boolean;
    static fromString(s: string): Buffer;
    static fromArray(bytes: Array<number>): Buffer;
    static zeroBuffer(size: number): Buffer;
}
