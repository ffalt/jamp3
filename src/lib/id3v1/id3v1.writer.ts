import {IID3V1} from './id3v1.types';
import {WriterStream} from '../common/stream-writer';

class Id3v1RawWriter {
	version: number;
	tag: IID3V1.ID3v1Tag;
	stream: WriterStream;

	constructor(stream: WriterStream, tag: IID3V1.ID3v1Tag, version: number) {
		this.stream = stream;
		this.version = version;
		this.tag = tag;
	}

	async write(): Promise<void> {
		await this.stream.writeAscii('TAG'); // ID3v1/file identifier
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

		await this.stream.writeFixedAsciiString(this.tag.title || '', 30);
		await this.stream.writeFixedAsciiString(this.tag.artist || '', 30);
		await this.stream.writeFixedAsciiString(this.tag.album || '', 30);
		await this.stream.writeFixedAsciiString(this.tag.year || '', 4);
		if (this.version === 0) {
			await this.stream.writeFixedAsciiString(this.tag.comment || '', 30);
		} else {
			await this.stream.writeFixedAsciiString(this.tag.comment || '', 28);
			await this.stream.writeByte(0);
			await this.stream.writeByte(this.tag.track || 0);
		}
		await this.stream.writeByte(this.tag.genreIndex || 0);
	}

}

export class ID3v1Writer {

	async write(stream: WriterStream, tag: IID3V1.ID3v1Tag, version: number): Promise<void> {
		if (version < 0 || version > 1) {
			return Promise.reject(Error('Unsupported Version'));
		}
		const writer = new Id3v1RawWriter(stream, tag, version);
		await writer.write();
	}

}
