import { BufferReader } from '../../common/buffer-reader.js';
import { IID3V2 } from '../id3v2.types.js';
import { IEncoding } from '../../common/encodings.js';
import { WriterStream } from '../../common/stream-writer.js';

export interface IFrameImplParseResult {
	value: IID3V2.FrameValue.Base;
	encoding?: IEncoding;
	subframes?: Array<IID3V2.Frame>;
}

export interface IFrameImpl {
	parse: (reader: BufferReader, frame: IID3V2.RawFrame, head: IID3V2.TagHeader) => Promise<IFrameImplParseResult>;
	write: (frame: IID3V2.Frame, stream: WriterStream, head: IID3V2.TagHeader, defaultEncoding?: string) => Promise<void>;
	simplify: (value: any) => string | null;
}
