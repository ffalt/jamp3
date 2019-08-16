import {DataReader, ReaderStream} from '../common/streams';
import {isValidFrameBinId} from './id3v2_frames';
import {bitarray, flags, removeZeroString, unsynchsafe} from '../common/utils';
import {Markers} from '../common/marker';
import {BufferUtils} from '../common/buffer';
import {ID3v2_FRAME_FLAGS1, ID3v2_FRAME_FLAGS2, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_EXTHEADER, ID3v2_HEADER_FLAGS, ID3v2_HEADER, ID3v2_FRAME_HEADER, ID3v2_MARKER} from './id3v2_consts';
import {IID3V2} from './id3v2__types';
import {Readable} from 'stream';
import {ITagID} from '../..';

const ID3v2_MARKER_BUFFER = BufferUtils.fromString(ID3v2_MARKER);

export class ID3v2Reader {

	private async readHeader(reader: ReaderStream): Promise<{ rest?: Buffer, header?: IID3V2.TagHeader }> {
		const data = await reader.read(ID3v2_HEADER.SIZE);
		const header: IID3V2.TagHeader | null = this.readID3v2Header(data, 0);
		if (!header || !header.valid) {
			return {rest: data};
		}
		if (header.v3 && header.v3.flags.extendedheader) {
			const extended = await this.readID3ExtendedHeaderV3(reader);
			header.v3.extended = extended.exthead;
			return {header, rest: extended.rest};
		} else if (header.v4 && header.v4.flags.extendedheader) {
			const extended = await this.readID3ExtendedHeaderV4(reader);
			header.v4.extended = extended.exthead;
			return {header, rest: extended.rest};
		}
		return {header};
	}

	private async readRawTag(head: IID3V2.TagHeader, reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		const tag: IID3V2.RawTag = {id: ITagID.ID3v2, frames: [], start: 0, end: 0, head: head || {ver: 0, rev: 0, size: 0, valid: false}};
		let rest: Buffer | undefined;
		if (tag.head.size > 0) {
			const data = await reader.read(tag.head.size);
			rest = await this.readFrames(data, tag);
		}
		return {rest, tag};
	}

	async readTag(reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		const head = await this.readHeader(reader);
		if (!head) {
			return {};
			// return this.scan(reader, tag, cb);
		}
		if (!head.header) {
			return {rest: head.rest};
			// return this.scan(reader, tag, cb);
		}
		return await this.readRawTag(head.header, reader);
	}

	async scan(reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		if (reader.end) {
			return {};
		}
		const index = await reader.scan(ID3v2_MARKER_BUFFER);
		if (index < 0) {
			return {};
		}
		const result = await this.readTag(reader);
		if (!result.tag) {
			return this.scan(reader);
		}
		result.tag.start = index;
		result.tag.end = reader.pos;
		return result;
	}

	private async readID3ExtendedHeaderV3(reader: ReaderStream): Promise<{ rest?: Buffer, exthead: IID3V2.TagHeaderExtendedVer3 }> {
		const headdata = await reader.read(4);
		let size = headdata.readInt32BE(0);
		if (size > 10) {
			// TODO: ???????
			size = 6;
		}
		// debug('readID3ExtendedHeader', 'exthead.size:', exthead.size);
		const data = await reader.read(size);
		/** ID3v2.3
		 3.2.   ID3v2 extended header

		 The extended header contains information that is not vital to the
		 correct parsing of the tag information, hence the extended header is
		 optional.

		 Extended header size   $xx xx xx xx
		 Extended Flags         $xx xx
		 Size of padding        $xx xx xx xx

		 Where the 'Extended header size', currently 6 or 10 bytes, excludes
		 itself. The 'Size of padding' is simply the total tag size excluding
		 the frames and the headers, in other words the padding. The extended
		 header is considered separate from the header proper, and as such is
		 subject to unsynchronisation.

		 The extended flags are a secondary flag set which describes further
		 attributes of the tag. These attributes are currently defined as
		 follows

		 %x0000000 00000000

		 x - CRC data present

		 If this flag is set four bytes of CRC-32 data is appended to the
		 extended header. The CRC should be calculated before
		 unsynchronisation on the data between the extended header and the
		 padding, i.e. the frames and only the frames.

		 Total frame CRC        $xx xx xx xx

		 */
		const exthead: IID3V2.TagHeaderExtendedVer3 = {
			size,
			flags1: flags(ID3v2_EXTHEADER[3].FLAGS1, bitarray(data[0])),
			flags2: flags(ID3v2_EXTHEADER[3].FLAGS2, bitarray(data[1])),
			sizeOfPadding: data.readUInt32BE(2)
		};
		if (exthead.flags1.crc && data.length > 6) {
			exthead.crcData = data.readUInt32BE(6);
		}
		return {exthead};
	}

	private async readID3ExtendedHeaderV4(reader: ReaderStream): Promise<{ rest?: Buffer, exthead: IID3V2.TagHeaderExtendedVer4 }> {
		const headdata = await reader.read(4);
		let size = headdata.readInt32BE(0);
		size = unsynchsafe(size);
		if (size > 10) {
			// TODO: ???????
			size = 6;
		}
		// debug('readID3ExtendedHeader', 'exthead.size:', exthead.size);
		const data = await reader.read(size);
		const exthead: IID3V2.TagHeaderExtendedVer4 = {
			size,
			flags: flags(ID3v2_EXTHEADER[4].FLAGS, bitarray(data[0]))
		};
		let pos = 1;
		if (exthead.flags.crc) {
			const crcSize = data[pos];
			pos++;
			exthead.crc32 = unsynchsafe(data.readInt32BE(pos));
			pos += crcSize;
		}
		if (exthead.flags.restrictions) {
			pos++;
			const r = bitarray(data[pos]);
			exthead.restrictions = {
				tagSize: r[0].toString() + r[1].toString(),
				textEncoding: r[2].toString(),
				textSize: r[3].toString() + r[4].toString(),
				imageEncoding: r[5].toString(),
				imageSize: r[6].toString() + r[7].toString()
			};
		}
		return {exthead};
	}

	public readID3v2Header(buffer: Buffer, offset: number): IID3V2.TagHeader | null {
		if (
			(!Markers.isMarker(buffer, offset, Markers.MARKERS.id3)) || (buffer.length < 10)
		) {
			return null;
		}
		const flagBits = bitarray(buffer[5]);
		const head: IID3V2.TagHeader = {
			ver: buffer[offset + 3],
			rev: buffer[offset + 4],
			size: buffer.readInt32BE(offset + 6),
			flagBits,
			valid: false
		};
		if (head.ver === 4) {
			head.size = unsynchsafe(head.size);
			head.v4 = {
				flags: {
					unsynchronisation: flagBits[0] === 1,
					extendedheader: flagBits[1] === 1,
					experimental: flagBits[2] === 1,
					footer: flagBits[3] === 1
				}
			};
		} else if (head.ver === 3) {
			head.size = unsynchsafe(head.size);
			head.v3 = {
				flags: {
					unsynchronisation: flagBits[0] === 1,
					extendedheader: flagBits[1] === 1,
					experimental: flagBits[2] === 1
				}
			};
		} else if (head.ver <= 2) {
			head.v2 = {
				sizeAsSyncSafe: unsynchsafe(head.size), // keep this if someone is writing v2 with syncsafeint
				flags: {
					unsynchronisation: flagBits[0] === 1,
					compression: flagBits[1] === 1,
				}
			};
		}
		head.valid = head.size >= 0;
		return head;
	}

	async readReaderStream(reader: ReaderStream): Promise<IID3V2.RawTag | undefined> {
		const result = await this.scan(reader);
		return result.tag;
	}

	async readStream(stream: Readable): Promise<IID3V2.RawTag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.openStream(stream);
			const tag = await this.readReaderStream(reader);
			return tag;
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async read(filename: string): Promise<IID3V2.RawTag | undefined> {
		const reader = new ReaderStream();
		try {
			await reader.open(filename);
			const tag = await this.readReaderStream(reader);
			reader.close();
			return tag;
		} catch (e) {
			reader.close();
			return Promise.reject(e);
		}
	}

	async readFrames(data: Buffer, tag: IID3V2.RawTag): Promise<Buffer> {
		const marker = ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
		const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver];
		const flagsbytes = ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver];
		const reader = new DataReader(data);
		let finish = false;
		let scanpos = reader.position;
		let skip = 0;
		while (!finish) {
			scanpos = reader.position;
			let idbin = reader.readBuffer(marker);
			if (idbin[0] === 0) {
				// debug('readFrames', 'found a zero byte, game over');
				reader.position = reader.position - marker;
				return reader.rest();
			}
			while (reader.unread() > 0 && (!isValidFrameBinId(idbin))) {
				reader.position = reader.position - (marker - 1);
				skip++;
				idbin = reader.readBuffer(marker);
			}
			if (reader.unread() > 0 && isValidFrameBinId(idbin)) {
				const pos = reader.position;
				const frame: IID3V2.RawFrame = {id: removeZeroString(idbin.toString('ascii').trim()), size: 0, start: tag.start, end: tag.end, data: BufferUtils.zeroBuffer(0), statusFlags: {}, formatFlags: {}};
				if (reader.unread() < sizebytes) {
					return reader.rest();
				}
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
			} else {
				finish = true;
			}
		}
		if (skip > 0) {
			reader.position -= (skip + marker);
		}
		return reader.rest();
	}
}
