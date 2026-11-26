import { IID3V2 } from '../id3v2.types.js';
import { WriterStream } from '../../common/stream-writer.js';
import { IEncoding } from '../../common/encodings.js';
export declare function writeRawSubFrames(frames: Array<IID3V2.Frame>, stream: WriterStream, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<void>;
export declare function writeRawFrames(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<Array<IID3V2.RawFrame>>;
export declare function getWriteTextEncoding(frame: IID3V2.Frame, head: IID3V2.TagHeader, defaultEncoding?: string): IEncoding;
