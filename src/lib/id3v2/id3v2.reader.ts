import {bitarray, flags, removeZeroString, unsynchsafe} from '../common/utils';
import {BufferUtils} from '../common/buffer';
import {ID3v2_FRAME_FLAGS1, ID3v2_FRAME_FLAGS2, ID3v2_FRAME_HEADER, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_MARKER} from './id3v2.header.consts';
import {IID3V2} from './id3v2.types';
import {Readable} from 'stream';
import {ITagID} from '../..';
import {ReaderStream} from '../common/stream-reader';
import {BufferReader} from '../common/buffer-reader';
import {isValidFrameBinId} from './frames/id3v2.frame.match';
import {ID3v2HeaderReader} from './id3v2.reader.header';

const ID3v2_MARKER_BUFFER = BufferUtils.fromString(ID3v2_MARKER);

export class ID3v2Reader {
	headerReader = new ID3v2HeaderReader();

	private async readRawTag(head: IID3V2.TagHeader, reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		const tag: IID3V2.RawTag = {id: ITagID.ID3v2, frames: [], start: 0, end: 0, head: head || {ver: 0, rev: 0, size: 0, valid: false}};
		let rest: Buffer | undefined;
		if (tag.head.size > 0) {
			const data = await reader.read(tag.head.size);
			rest = await this.readFrames(data, tag);
		}
		return {rest, tag};
	}

	private async scan(reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		if (reader.end) {
			return {};
		}
		const index = await reader.scan(ID3v2_MARKER_BUFFER);
		if (index < 0) {
			return {};
		}
		const result = await this.readReaderStream(reader);
		if (!result.tag) {
			return this.scan(reader);
		}
		result.tag.start = index;
		result.tag.end = reader.pos;
		return result;
	}

	private async scanReaderStream(reader: ReaderStream): Promise<IID3V2.RawTag | undefined> {
		const result = await this.scan(reader);
		return result.tag;
	}

	public async readReaderStream(reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		const head = await this.headerReader.readHeader(reader);
		if (!head) {
			return {};
		}
		if (!head.header) {
			return {rest: head.rest};
		}
		return await this.readRawTag(head.header, reader);
	}

	public async readStream(stream: Readable): Promise<IID3V2.RawTag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.openStream(stream);
			return await this.scanReaderStream(reader);
		} catch (e) {
			return Promise.reject(e);
		}
	}

	public async read(filename: string): Promise<IID3V2.RawTag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.open(filename);
			const tag = await this.scanReaderStream(reader);
			reader.close();
			return tag;
		} catch (e) {
			reader.close();
			return Promise.reject(e);
		}
	}

	public async readFrames(data: Buffer, tag: IID3V2.RawTag): Promise<Buffer> {
		const marker = ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
		const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver];
		const flagsbytes = ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver];
		const reader = new BufferReader(data);
		let finish = false;
		let scanpos = reader.position;
		let skip = 0;
		while (!finish) {
			scanpos = reader.position;
			let idbin = reader.readBuffer(marker);
			if (idbin[0] === 0) {
				// found a zero byte, game over
				reader.position = reader.position - marker;
				return reader.rest();
			}
			while (reader.unread() > 0 && (!isValidFrameBinId(idbin))) {
				reader.position = reader.position - (marker - 1);
				skip++;
				idbin = reader.readBuffer(marker);
			}
			if (reader.unread() > 0 && isValidFrameBinId(idbin)) {
				if (reader.unread() < sizebytes) {
					return reader.rest();
				}
				skip = this.readFrame(reader, idbin, tag, sizebytes, flagsbytes, skip, marker);
			} else {
				finish = true;
			}
		}
		if (skip > 0) {
			reader.position -= (skip + marker);
		}
		return reader.rest();
	}

	private readFrame(reader: BufferReader, idbin: Buffer, tag: IID3V2.RawTag, sizebytes: number, flagsbytes: number, skip: number, marker: number) {
		const pos = reader.position;
		const frame: IID3V2.RawFrame = {id: removeZeroString(idbin.toString('ascii').trim()), size: 0, start: tag.start, end: tag.end, data: BufferUtils.zeroBuffer(0), statusFlags: {}, formatFlags: {}};
		frame.size = reader.readUInt(sizebytes);
		if (ID3v2_FRAME_HEADER.SYNCSAVEINT.indexOf(tag.head.ver) >= 0) {
			frame.size = unsynchsafe(frame.size);
		}
		if (flagsbytes > 0) {
			frame.statusFlags = flags(ID3v2_FRAME_FLAGS1[tag.head.ver], bitarray(reader.readByte()));
			frame.formatFlags = flags(ID3v2_FRAME_FLAGS2[tag.head.ver], bitarray(reader.readByte()));
		}
		let frameheaderValid = (!frame.statusFlags.reserved && !frame.formatFlags.reserved2 && !frame.formatFlags.reserved3);
		if (frameheaderValid && frame.size > reader.unread()) {
			// debug('readFrames', 'not enough data for frame.size ' + frame.size + ' with end of declared rest size', reader.unread());
			frameheaderValid = false;
		}
		if (frameheaderValid) {
			if (skip > 0 && tag.frames.length > 0) {
				const lastFrame = tag.frames[tag.frames.length - 1];
				// debug('readFrames', 'appending', skip, 'bytes to last frame', lastFrame.id);
				lastFrame.data = BufferUtils.concatBuffer(lastFrame.data, reader.data.slice(pos - skip - marker, pos - marker));
				lastFrame.size = lastFrame.data.length;
			}
			skip = 0;
			// debug('readFrames', 'frame ' + frame.id + ' with size === ' + frame.size);
			if (frame.size > 0) {
				if (tag.head.v3 && tag.head.v3.flags.unsynchronisation) {
					frame.data = reader.readUnsyncedBuffer(frame.size);
				} else {
					frame.data = reader.readBuffer(frame.size);
				}
			}
			tag.frames.push(frame);
		} else {
			reader.position = pos - (marker - 1);
			skip++;
			// debug('readFrames', 'frame ' + frame.id + ' header invalid, go back to pos', reader.position);
		}
		return skip;
	}
}
