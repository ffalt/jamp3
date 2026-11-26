import { MP3ReaderOptions } from '../mp3/mp3.reader.js';
import { FileWriterStream } from './stream-writer-file.js';
import { IMP3 } from '../mp3/mp3.types.js';
export declare function updateFile(filename: string, options: MP3ReaderOptions, keepBackup: boolean, canProcess: (layout: IMP3.RawLayout) => boolean, process: (layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>): Promise<undefined>;
