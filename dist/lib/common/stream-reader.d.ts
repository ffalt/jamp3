/// <reference types="node" />
import { Readable } from 'stream';
export declare class ReaderStream {
    readableStream: Readable | null;
    buffers: Array<Buffer>;
    buffersLength: number;
    waiting: (() => void) | null;
    private streamEnd;
    private streamOnData;
    end: boolean;
    pos: number;
    constructor();
    private onData;
    private onSkip;
    openStream(stream: Readable): Promise<void>;
    open(filename: string): Promise<void>;
    consumeToEnd(): Promise<void>;
    close(): void;
    private getBufferLength;
    private resume;
    get(amount: number): Buffer;
    skip(amount: number): void;
    getAndPrepend(amount: number, prepend: Array<Buffer>): Buffer;
    read(amount: number): Promise<Buffer>;
    unshift(buffer: Buffer): void;
    scan(buffer: Buffer): Promise<number>;
}
