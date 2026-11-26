import { IMP3 } from './mp3.types.js';
import { IID3V1 } from '../id3v1/id3v1.types.js';
import { IID3V2 } from '../id3v2/id3v2.types.js';
export declare function prepareResultID3v1(layout: IMP3.RawLayout): Promise<IID3V1.Tag | undefined>;
export declare function prepareResultID3v2(layout: IMP3.RawLayout): Promise<IID3V2.Tag | undefined>;
export declare function prepareResult(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<IMP3.Result>;
