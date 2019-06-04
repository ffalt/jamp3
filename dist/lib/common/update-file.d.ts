import { MP3ReaderOptions } from '../mp3/mp3_reader';
import { FileWriterStream } from './streams';
import { IMP3 } from '../..';
export declare function updateFile(filename: string, opts: MP3ReaderOptions, keepBackup: boolean, canProcess: (layout: IMP3.RawLayout) => boolean, process: (layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>): Promise<undefined>;
