/// <reference types="node" />
import { Readable } from 'stream';
import { IMP3 } from './mp3.types';
export interface MP3ReaderOptions extends IMP3.ReadOptions {
    streamSize?: number;
}
export declare class MP3Reader {
    private options;
    private layout;
    private id3v2reader;
    private id3v1reader;
    private mpegFramereader;
    private stream;
    private scanMpeg;
    private scanid3v1;
    private scanid3v2;
    private scanMPEGFrame;
    private hasMPEGHeadFrame;
    private readFullMPEGFrame;
    private readMPEGFrame;
    private readID3V1;
    private readID3V2;
    private processChunkToEnd;
    private processChunkID3v1;
    private processChunkID3v1AndID3v2AndMpeg;
    private processChunkID3v1AndID3v2;
    private demandData;
    private processChunk;
    private scan;
    private setOptions;
    read(filename: string, options: MP3ReaderOptions): Promise<IMP3.RawLayout>;
    readStream(stream: Readable, options: MP3ReaderOptions): Promise<IMP3.RawLayout>;
}
