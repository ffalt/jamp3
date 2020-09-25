import { IMP3Analyzer } from './mp3.analyzer.types';
export declare class MP3Analyzer {
    private analyzeID3v2;
    private analyzeID3v1;
    private analyzeMPEG;
    private analyzeXING;
    read(filename: string, options: IMP3Analyzer.Options): Promise<IMP3Analyzer.Report>;
}
