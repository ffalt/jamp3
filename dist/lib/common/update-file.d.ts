/// <reference types="node" />
import { FileWriterStream } from './streams';
import { IMP3 } from '../..';
import fs from 'fs';
export declare function updateFile(filename: string, keepBackup: boolean, process: (stat: fs.Stats, layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>): Promise<undefined>;
