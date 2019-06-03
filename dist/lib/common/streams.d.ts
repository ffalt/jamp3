/// <reference types="node" />
import fs from 'fs';
import { IEncoding } from './encodings';
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
export declare class WriterStream {
    protected wstream: fs.WriteStream;
    constructor();
    writeByte(byte: number): void;
    writeBytes(bytes: Array<number>): void;
    writeBitsByte(bits: Array<number>): void;
    writeBuffer(buffer: Buffer): void;
    writeSyncSafeInt(int: number): void;
    writeUInt(int: number, byteLength: number): void;
    writeUByte(int: number): void;
    writeUInt2Byte(int: number): void;
    writeSInt2Byte(int: number): void;
    writeUInt3Byte(int: number): void;
    writeUInt4Byte(int: number): void;
    writeSInt(int: number, byteLength: number): void;
    writeEncoding(enc: IEncoding): void;
    writeString(val: string, enc: IEncoding): void;
    writeStringTerminated(val: string, enc: IEncoding): void;
    writeAsciiString(val: string, length: number): void;
    writeAscii(val: string): void;
    writeTerminator(enc: IEncoding): void;
    writeFixedAsciiString(val: string, amount: number): void;
    writeFixedUTF8String(val: string, amount: number): void;
}
export declare class FileWriterStream extends WriterStream {
    constructor();
    open(filename: string): Promise<void>;
    close(): Promise<void>;
    copyRange(filename: string, start: number, finish: number): Promise<void>;
    copyFrom(filename: string, position: number): Promise<void>;
}
export declare class MemoryWriterStream extends WriterStream {
    constructor();
    toBuffer(): Buffer;
}
export declare class DataReader {
    data: Buffer;
    position: number;
    constructor(data: Buffer);
    readStringTerminated(enc: IEncoding): string;
    readString(amount: number, enc: IEncoding): string;
    rest(): Buffer;
    readByte(): number;
    readBitsByte(): number;
    readUInt(byteLength: number): number;
    readSInt(byteLength: number): number;
    readUInt2Byte(): number;
    readSInt2Byte(): number;
    readUInt4Byte(): number;
    readEncoding(): IEncoding;
    readFixedAsciiString(amount: number): string;
    readFixedUTF8String(amount: number): string;
    readFixedAutodectectString(amount: number): string;
    unread(): number;
    hasData(): boolean;
    readBuffer(amount: number): Buffer;
    readUnsyncedBuffer(amount: number): Buffer;
}
