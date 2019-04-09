import {DataReader, ReaderStream} from '../common/streams';
import {isValidFrameBinId} from './id3v2_frames';
import {bitarray, flags, removeZeroString, unsynchsafe} from '../common/utils';
import {Markers} from '../common/marker';
import {BufferUtils} from '../common/buffer';
import {ID3v2_FRAME_FLAGS1, ID3v2_FRAME_FLAGS2, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_EXTHEADER, ID3v2_HEADER_FLAGS, ID3v2_HEADER, ID3v2_FRAME_HEADER, ID3v2_MARKER} from './id3v2_consts';
import {IID3V2} from './id3v2__types';
import {Readable} from 'stream';

const ID3v2_MARKER_BUFFER = BufferUtils.fromString(ID3v2_MARKER);

export class ID3v2Reader {

	private async readHeader(reader: ReaderStream): Promise<{ rest?: Buffer, header?: IID3V2.TagHeader }> {
		const data = await reader.read(ID3v2_HEADER.SIZE);
		const header: IID3V2.TagHeader | null = this.readID3v2Header(data, 0);
		if (!header || !header.valid) {
			return {rest: data};
		}
		if (!header.flags || !header.flags.extendedheader) {
			return {header};
		}
		const extended = await this.readID3ExtendedHeader(reader, header.ver);
		// if (err2) {
		// 	return cb(err2, {header, rest: extended ? extended.rest : undefined});
		// }
		header.extended = extended ? extended.exthead : undefined;
		return {header, rest: extended ? extended.rest : undefined};
	}

	private async readRawTag(head: IID3V2.TagHeader, reader: ReaderStream): Promise<{ rest?: Buffer, tag?: IID3V2.RawTag }> {
		const tag: IID3V2.RawTag = {id: 'ID3v2', frames: [], start: 0, end: 0, head: head || {ver: 0, rev: 0, size: 0, valid: false}};
		const data = await reader.read(tag.head.size);
		const rest = await this.readFrames(data, tag);
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
		// debug('scan', 'marker at', index);
		const result = await this.readTag(reader);
		if (!result.tag) {
			return this.scan(reader);
		}
		result.tag.start = index;
		result.tag.end = reader.pos;
		return result;
	}

	private async readID3ExtendedHeader(reader: ReaderStream, ver: number): Promise<{ rest?: Buffer, exthead: IID3V2.TagHeaderExtended }> {
		const headdata = await reader.read(4);
		const exthead: IID3V2.TagHeaderExtended = {
			size: headdata.readInt32BE(0)
		};
		if (ID3v2_EXTHEADER.SYNCSAVEINT.indexOf(ver) >= 0) {
			exthead.size = unsynchsafe(exthead.size);
		}
		if (exthead.size > 10) {
			exthead.size = 6;
		}
		// debug('readID3ExtendedHeader', 'exthead.size:', exthead.size);
		const data = await reader.read(exthead.size);
		if (ver === 3) {
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
			const ver3: IID3V2.TagHeaderExtendedVer3 = {
				flags1: flags(ID3v2_EXTHEADER[3].FLAGS1, bitarray(data[0])),
				flags2: flags(ID3v2_EXTHEADER[3].FLAGS2, bitarray(data[1])),
				sizeOfPadding: data.readUInt32BE(2)
			};
			if (ver3.flags1.crc && data.length > 6) {
				ver3.crcData = data.readUInt32BE(6);
			}
			exthead.ver3 = ver3;
		} else if (ver === 4) {
			const ver4: IID3V2.TagHeaderExtendedVer4 = {
				flags: flags(ID3v2_EXTHEADER[4].FLAGS, bitarray(data[0])),
				// flagscount: data[1]
			};
			let pos = 1;
			if (ver4.flags.crc) {
				const size = data[pos];
				pos++;
				ver4.crc32 = unsynchsafe(data.readInt32BE(pos));
				pos += size;
			}
			if (ver4.flags.restrictions) {
				// const size = data[pos];
				pos++;
				const r = bitarray(data[pos]);
				ver4.restrictions = {
					tagSize: r[0].toString() + r[1].toString(),
					textEncoding: r[2].toString(),
					textSize: r[3].toString() + r[4].toString(),
					imageEncoding: r[5].toString(),
					imageSize: r[6].toString() + r[7].toString()
				};
			}
		}
		return {exthead};
	}

	public readID3v2Header(buffer: Buffer, offset: number): IID3V2.TagHeader | null {
		if (
			(!Markers.isMarker(buffer, offset, Markers.MARKERS.id3)) || (buffer.length < 10)
		) {
			return null;
		}
		const head: IID3V2.TagHeader = {
			ver: buffer[offset + 3],
			rev: buffer[offset + 4],
			size: buffer.readInt32BE(offset + 6),
			valid: false
		};

		if (ID3v2_HEADER.SYNCSAVEINT.indexOf(head.ver) >= 0) {
			head.size = unsynchsafe(head.size);
		} else {
			head.syncSaveSize = unsynchsafe(head.size);
		} // keep this if someone is writing v2 with syncsaveint

		if (ID3v2_HEADER_FLAGS[head.ver]) {
			head.flags = flags(ID3v2_HEADER_FLAGS[head.ver], bitarray(buffer[5]));
			head.valid = head.size > 0;
			// debug('readID3v2Header', 'head.size', head.size, 'head.ver', head.ver);
		} else {
			head.flagBits = bitarray(buffer[5]);
		}
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
			// let id = removeZeroString(idbin.toString('ascii')).trim();
			// console.log(id);
			while (reader.unread() > 0 && (!isValidFrameBinId(idbin))) {
				reader.position = reader.position - (marker - 1);
				skip++;
				// debug('readFrames', 'not a valid id, scan to next', id, 'pos', reader.position);
				idbin = reader.readBuffer(marker);
				// id = removeZeroString(idbin.toString('ascii')).trim();
				// console.log(id);
			}
			if (reader.unread() > 0 && isValidFrameBinId(idbin)) {
				// const skipped = (reader.position - scanpos - marker);
				// if (skipped > 0) {
				// 	skip += skipped;
				// }
				const pos = reader.position;
				// if (marker - id.trim().length > 0) {
				// 	debug('readFrames', 'frame id is too short in id3v2 version, reading anyway', id);
				// }
				// debug('readFrames', 'valid id, reading frame', id);
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
					// 	console.log(frame);
					frameheaderValid = false;
					// 	finish = true;
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
						if (tag.head.ver === 3 && tag.head.flags && tag.head.flags.unsynchronisation) {
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
				// debug('readFrames', 'check next');
			} else {
				finish = true;
			}
		}
		if (skip > 0) {
			reader.position -= (skip + marker);
		}
		// debug('readFrames', 'over');
		// if (reader.unread() === 0) {
		// console.log('no padding?');
		// }
		return reader.rest();
	}
}
