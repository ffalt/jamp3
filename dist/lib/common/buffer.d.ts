/// <reference types="node" />
export declare class BufferUtils {
    static scanBufferText(buffer: Buffer, search: Array<number> | Buffer, start: number): number;
    static concatBuffer(buffer: Buffer, appendbuffer: Buffer): Buffer;
    static concatBuffers(buffers: Array<Buffer>): Buffer;
    static indexOfBuffer(buffer: Buffer, search: Buffer, start?: number): number;
    static compareBuffer(buffer: Buffer, buffer2: Buffer): boolean;
    static fromString(s: string): Buffer;
    static fromArray(bytes: Array<number>): Buffer;
    static zeroBuffer(size: number): Buffer;
}
