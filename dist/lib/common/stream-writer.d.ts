/// <reference types="node" />
import fs from 'fs';
import { IEncoding } from './encodings';
export declare class WriterStream {
    protected wstream: fs.WriteStream;
    constructor();
    writeByte(byte: number): void;
    writeBytes(bytes: Array<number>): void;
    writeBitsByte(bits: Array<number>): void;
    writeBuffer(buffer: Buffer): void;
    writeSyncSafeInt(int: number): void;
    writeUInt(int: number, byteLength: number): void;
    writeUInt2Byte(int: number): void;
    writeUInt3Byte(int: number): void;
    writeUInt4Byte(int: number): void;
    writeSInt(int: number, byteLength: number): void;
    writeSInt2Byte(int: number): void;
    writeEncoding(enc: IEncoding): void;
    writeString(val: string, enc: IEncoding): void;
    writeStringTerminated(val: string, enc: IEncoding): void;
    writeAsciiString(val: string, length: number): void;
    writeAscii(val: string): void;
    writeTerminator(enc: IEncoding): void;
    writeFixedBuffer(buffer: Buffer, size: number): void;
    writeFixedAsciiString(val: string, size: number): void;
}
