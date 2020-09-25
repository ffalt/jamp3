import { IMP3 } from './mp3.types';
import { IID3V1, IID3V2 } from '../..';
export declare function prepareResultID3v1(layout: IMP3.RawLayout): Promise<IID3V1.Tag | undefined>;
export declare function prepareResultID3v2(layout: IMP3.RawLayout): Promise<IID3V2.Tag | undefined>;
export declare function prepareResult(options: IMP3.ReadOptions, layout: IMP3.RawLayout): Promise<IMP3.Result>;
