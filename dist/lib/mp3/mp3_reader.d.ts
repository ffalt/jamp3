import { IMP3 } from './mp3__types';
export declare class MP3Reader {
    private opts;
    private layout;
    private id3v2reader;
    private id3v1reader;
    private mpegFramereader;
    private stream;
    private finished;
    private scanMpeg;
    private scanid3v1;
    private scanid3v2;
    private scanMPEGFrame;
    private hasMPEGHeadFrame;
    constructor();
    private readID3V1;
    private readID3V2;
    private readMPEGFrame;
    private processChunk;
    private scan;
    read(opts: IMP3.ReadOptions): Promise<IMP3.Layout>;
}
