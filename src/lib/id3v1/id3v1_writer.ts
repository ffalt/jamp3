import {WriterStream} from '../common/streams';
import {IID3V1} from './id3v1__types';

class Id3v1RawWriter {
	version: number;
	tag: IID3V1.Tag;
	stream: WriterStream;

	constructor(stream: WriterStream, tag: IID3V1.Tag, version: number) {
		this.stream = stream;
		this.version = version;
		this.tag = tag;
	}

	async write(): Promise<void> {
		this.stream.writeAscii('TAG'); // ID3v1/file identifier
		/* v1
		 Song Title		30 characters
		 Artist	 		30 characters
		 Album			30 characters
		 Year			4 characters
		 Comment		30 characters
		 Genre			1 byte
		 */

		/* v1.1
		 Song Title		30 characters
		 Artist	 		30 characters
		 Album			30 characters
		 Year			4 characters
		 Comment		28 characters + null
		 Track			1 byte
		 Genre			1 byte
		 */

		this.stream.writeFixedAsciiString(this.tag.value.title || '', 30);
		this.stream.writeFixedAsciiString(this.tag.value.artist || '', 30);
		this.stream.writeFixedAsciiString(this.tag.value.album || '', 30);
		this.stream.writeFixedAsciiString(this.tag.value.year || '', 4);
		if (this.version === 0) {
			this.stream.writeFixedAsciiString(this.tag.value.comment || '', 30);
		} else {
			this.stream.writeFixedAsciiString(this.tag.value.comment || '', 28);
			this.stream.writeByte(0);
			this.stream.writeByte(this.tag.value.track || 0);
		}
		this.stream.writeByte(this.tag.value.genreIndex || 0);
	}

}

export class ID3v1Writer {

	async write(stream: WriterStream, tag: IID3V1.Tag, version: number): Promise<void> {
		if (version < 0 || version > 1) {
			return Promise.reject(Error('Unsupported Version'));
		}
		const writer = new Id3v1RawWriter(stream, tag, version);
		await writer.write();
	}

}
