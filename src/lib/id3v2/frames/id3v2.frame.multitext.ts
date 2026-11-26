import { IEncoding } from '../../common/encodings.js';
import { BufferReader } from '../../common/buffer-reader.js';
import { WriterStream } from '../../common/stream-writer.js';

/**
ID3v2.4 §4.2: a text field may hold several strings, separated by the
termination code of the character encoding. Reads them up to the end of the frame.
*/
export function readMultiTextValues(reader: BufferReader, enc: IEncoding): Array<string> {
	const list: Array<string> = [];
	while (reader.hasData()) {
		const text = reader.readStringTerminated(enc);
		if (text.length > 0) {
			list.push(text);
		}
	}
	return list;
}

export async function writeMultiTextValues(stream: WriterStream, list: Array<string>, enc: IEncoding): Promise<void> {
	for (const [index, text] of list.entries()) {
		await stream.writeString(text, enc);
		if (index !== list.length - 1) {
			await stream.writeTerminator(enc);
		}
	}
}
