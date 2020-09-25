/// <reference types="node" />
import { IEncoding } from './encodings';
export declare class BufferReader {
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
    readStringBuffer(amount: number): Buffer;
    readFixedAsciiString(amount: number): string;
    readFixedAutodectectString(amount: number): string;
    unread(): number;
    hasData(): boolean;
    readBuffer(amount: number): Buffer;
    readUnsyncedBuffer(amount: number): Buffer;
}
