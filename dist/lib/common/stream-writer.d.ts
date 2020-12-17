/// <reference types="node" />
import fs from 'fs';
import { IEncoding } from './encodings';
export declare class WriterStream {
    protected wstream: fs.WriteStream;
    constructor();
    private _write;
    private _writeString;
    writeByte(byte: number): Promise<void>;
    writeBytes(bytes: Array<number>): Promise<void>;
    writeBitsByte(bits: Array<number>): Promise<void>;
    writeBuffer(buffer: Buffer): Promise<void>;
    writeSyncSafeInt(int: number): Promise<void>;
    writeUInt(int: number, byteLength: number): Promise<void>;
    writeUInt2Byte(int: number): Promise<void>;
    writeUInt3Byte(int: number): Promise<void>;
    writeUInt4Byte(int: number): Promise<void>;
    writeSInt(int: number, byteLength: number): Promise<void>;
    writeSInt2Byte(int: number): Promise<void>;
    writeEncoding(enc: IEncoding): Promise<void>;
    writeString(val: string, enc: IEncoding): Promise<void>;
    writeStringTerminated(val: string, enc: IEncoding): Promise<void>;
    writeAsciiString(val: string, length: number): Promise<void>;
    writeAscii(val: string): Promise<void>;
    writeTerminator(enc: IEncoding): Promise<void>;
    writeFixedBuffer(buffer: Buffer, size: number): Promise<void>;
    writeFixedAsciiString(val: string, size: number): Promise<void>;
}
