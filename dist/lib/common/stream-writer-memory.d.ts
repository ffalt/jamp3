/// <reference types="node" />
import { WriterStream } from './stream-writer';
export declare class MemoryWriterStream extends WriterStream {
    constructor();
    toBuffer(): Buffer;
}
