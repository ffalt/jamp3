import { WriterStream } from './stream-writer';
export declare class FileWriterStream extends WriterStream {
    constructor();
    open(filename: string): Promise<void>;
    close(): Promise<void>;
    private pipeStream;
    copyRange(filename: string, start: number, finish: number): Promise<void>;
    copyFrom(filename: string, position: number): Promise<void>;
}
