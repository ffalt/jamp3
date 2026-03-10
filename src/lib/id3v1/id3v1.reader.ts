import { Readable } from 'node:stream';

import { Markers } from '../common/marker';
import { IID3V1 } from './id3v1.types';
import { BufferUtils } from '../common/buffer';
import { ITagID } from '../common/types';
import { ReaderStream } from '../common/stream-reader';
import { BufferReader } from '../common/buffer-reader';

export const ID3v1_MARKER = 'TAG';

export class ID3v1Reader {
	public readTag(data: Buffer): IID3V1.Tag | null {
		/*
		 v1
		 Song Title 30 characters
		 Artist     30 characters
		 Album      30 characters
		 Year        4 characters
		 Comment    30 characters
		 Genre       1 byte

		 v1.1
		 Song Title 30 characters
		 Artist     30 characters
		 Album      30 characters
		 Year        4 characters
		 Comment    28 characters + null
		 Track      1 byte
		 Genre      1 byte
		 */
		if (data.length < 128 || !Markers.isMarker(data, 0, Markers.MARKERS.tag)) {
			return null;
		}
		const tag: IID3V1.Tag = { id: ITagID.ID3v1, start: 0, end: 0, version: 0, value: {} };
		const reader = new BufferReader(data);
		reader.position = 3;
		const value: IID3V1.ID3v1Tag = {};
		// eslint-disable-next-line unicorn/no-immediate-mutation
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
	}

	async readReaderStream(reader: ReaderStream): Promise<IID3V1.Tag | undefined> {
		if (reader.end) {
			return;
		}
		const index = await reader.scan(BufferUtils.fromString(ID3v1_MARKER));
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
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async read(filename: string): Promise<IID3V1.Tag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.open(filename);
			const tag = await this.readReaderStream(reader);
			reader.close();
			return tag;
		} catch (error) {
			reader.close();
			return Promise.reject(error);
		}
	}
}
