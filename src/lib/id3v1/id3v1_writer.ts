import {FileWriterStream, WriterStream} from '../common/streams';
import {IID3V1} from './id3v1__types';

class Writer {
	filename: string;
	version: number;
	tag: IID3V1.Tag;

	constructor(filename: string, version: number, tag: IID3V1.Tag) {
		this.filename = filename;
		this.version = version;
		this.tag = tag;
	}

	private async writeTag(stream: WriterStream): Promise<void> {
		stream.writeAscii('TAG'); // ID3v1/file identifier
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

		stream.writeFixedAsciiString(this.tag.value.title || '', 30);
		stream.writeFixedAsciiString(this.tag.value.artist || '', 30);
		stream.writeFixedAsciiString(this.tag.value.album || '', 30);
		stream.writeFixedAsciiString(this.tag.value.year || '', 4);
		if (this.version === 0) {
			stream.writeFixedAsciiString(this.tag.value.comment || '', 30);
		} else {
			stream.writeFixedAsciiString(this.tag.value.comment || '', 28);
			stream.writeByte(0);
			stream.writeByte(this.tag.value.track || 0);
		}
		stream.writeByte(this.tag.value.genreIndex || 0);
	}

	private async openFile(): Promise<FileWriterStream> {
		const stream = new FileWriterStream();
		await stream.open(this.filename);
		return stream;
	}

	private async closeFile(stream: FileWriterStream): Promise<void> {
		await stream.close();
	}

	async write(): Promise<void> {
		const stream = await this.openFile();
		try {
			await this.writeTag(stream);
		} catch (e) {
			await this.closeFile(stream);
			return Promise.reject(e);
		}
		await this.closeFile(stream);
	}
}

export class ID3v1Writer {

	async write(filename: string, tag: IID3V1.Tag, version: number): Promise<void> {
		const writer = new Writer(filename, version, tag);
		await writer.write();
	}

}
