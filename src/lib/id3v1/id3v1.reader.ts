import {Markers} from '../common/marker';
import {IID3V1} from './id3v1.types';
import {BufferUtils} from '../common/buffer';
import {Readable} from 'stream';
import Debug from 'debug';
import {ITagID} from '../..';
import {ReaderStream} from '../common/stream-reader';
import {BufferReader} from '../common/buffer-reader';

const debug = Debug('id3v1-reader');
export const ID3v1_MARKER = 'TAG';

export class ID3v1Reader {

	public readTag(data: Buffer): IID3V1.Tag | null {
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
		 Comment		28+null characters
		 Track			1 byte
		 Genre			1 byte
		 */
		if (data.length < 128 || !Markers.isMarker(data, 0, Markers.MARKERS.tag)) {
			return null;
		}
		const tag: IID3V1.Tag = {id: ITagID.ID3v1, start: 0, end: 0, version: 0, value: {}};
		const reader = new BufferReader(data);
		reader.position = 3;
		const value: IID3V1.ID3v1Tag = {};
		value.title = reader.readFixedAutodectectString(30);
		value.artist = reader.readFixedAutodectectString(30);
		value.album = reader.readFixedAutodectectString(30);
		value.year = reader.readFixedAutodectectString(4);
		if ((data[125] === 0) && (data[126] !== 0)) {
			value.comment = reader.readFixedAutodectectString(29);
			tag.version = 1;
			value.track = reader.readByte();
		} else {
			value.comment = reader.readFixedAutodectectString(30);
			tag.version = 0;
		}
		value.genreIndex = reader.readByte();
		tag.value = value;
		return tag;
		// cb(null, tag);
	}

	async readReaderStream(reader: ReaderStream): Promise<IID3V1.Tag | undefined> {
		if (reader.end) {
			return;
		}
		const index = await reader.scan(BufferUtils.fromString(ID3v1_MARKER));
		debug('index', index);
		if (index < 0) {
			return;
		}
		const data = await reader.read(400);
		if (!data || (data.length < 128)) {
			return;
		}
		if (data.length !== 128) {
			// must be last in stream
			reader.unshift(data.slice(1));
			return await this.readReaderStream(reader);
		}
		const tag = this.readTag(data);
		if (tag) {
			return tag;
		} else {
			reader.unshift(data.slice(1));
			return await this.readReaderStream(reader);
		}
	}

	async readStream(stream: Readable): Promise<IID3V1.Tag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.openStream(stream);
			return await this.readReaderStream(reader);
		} catch (e: any) {
			return Promise.reject(e);
		}
	}

	async read(filename: string): Promise<IID3V1.Tag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.open(filename);
			const tag = await this.readReaderStream(reader);
			reader.close();
			return tag;
		} catch (e: any) {
			reader.close();
			return Promise.reject(e);
		}
	}


	/**
	 TODO: CUSTOMTAG tag

	 TODO: APE tag

	 TODO: Extended tag

	 The extended tag is an extra data block before an ID3v1 tag, which extends the title, artist and album fields by 60 bytes each, offers a freetext genre, a one-byte (values 0–5) speed and the start and stop time of the music in the MP3 file, e.g., for fading in. If none of the fields are used, it will be automatically omitted.

	 Some programs supporting ID3v1 frames can read the extended tag, but writing may leave stale values in the extended block. The extended block is not an official standard, and is only supported by few programs, not including XMMS or Winamp. The extended tag is sometimes referred to as the "enhanced" tag.
	 Layout

	 Note: The extended tag is 227 bytes long, and placed before the ID3v1 tag.
	 Field    Length    Description
	 header    4    "TAG+"
	 title    60    60 characters of the title
	 artist    60    60 characters of the artist name
	 album    60    60 characters of the album name
	 speed    1    0=unset, 1=slow, 2= medium, 3=fast, 4=hardcore
	 genre    30    A free-text field for the genre
	 start-time    6    the start of the music as mmm:ss
	 end-time    6    the end of the music as mmm:ss
	 */

}
