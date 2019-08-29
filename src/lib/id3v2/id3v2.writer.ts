import {IID3V2} from './id3v2.types';
import {WriterStream} from '../common/stream-writer';
import {Id3v2RawWriter, Id3v2RawWriterOptions} from './id3v2.writer.raw';

export interface Id3v2WriterOptions extends Id3v2RawWriterOptions {
	paddingSize?: number;
}

export class ID3v2Writer {

	async write(stream: WriterStream, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader, options: Id3v2WriterOptions): Promise<void> {
		if (head.ver === 0 || head.ver > 4) {
			return Promise.reject(Error('Unsupported Version'));
		}
		const writer = new Id3v2RawWriter(stream, head, options, frames);
		await writer.write();
	}
}

