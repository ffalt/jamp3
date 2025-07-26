import { bitarray, flags, unsynchsafe } from '../common/utils';
import { Markers } from '../common/marker';
import { ID3v2_EXTHEADER, ID3v2_HEADER } from './id3v2.header.consts';
import { IID3V2 } from './id3v2.types';
import { ReaderStream } from '../common/stream-reader';

export class ID3v2HeaderReader {
	private async readID3ExtendedHeaderV3(reader: ReaderStream): Promise<{ rest?: Buffer; exthead: IID3V2.TagHeaderExtendedVer3 }> {
		const headdata = await reader.read(4);
		let size = headdata.readInt32BE(0);
		if (size > 10) {
			size = 6;
		}
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
		return { exthead };
	}

	private async readID3ExtendedHeaderV4(reader: ReaderStream): Promise<{ rest?: Buffer; exthead: IID3V2.TagHeaderExtendedVer4 }> {
		const headdata = await reader.read(4);
		let size = headdata.readInt32BE(0);
		size = unsynchsafe(size);
		if (size > 10) {
			size = 6;
		}
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
		return { exthead };
	}

	private readID3v22Header(head: IID3V2.TagHeader, flagBits: Array<number>): void {
		head.v2 = {
			sizeAsSyncSafe: unsynchsafe(head.size), // keep this if someone is writing v2 with syncsafeint
			flags: {
				unsynchronisation: flagBits[0] === 1,
				compression: flagBits[1] === 1
			}
		};
	}

	private readID3v23Header(head: IID3V2.TagHeader, flagBits: Array<number>): void {
		head.v3 = {
			flags: {
				unsynchronisation: flagBits[0] === 1,
				extendedheader: flagBits[1] === 1,
				experimental: flagBits[2] === 1
			}
		};
	}

	private readID3v24Header(head: IID3V2.TagHeader, flagBits: Array<number>): void {
		head.v4 = {
			flags: {
				unsynchronisation: flagBits[0] === 1,
				extendedheader: flagBits[1] === 1,
				experimental: flagBits[2] === 1,
				footer: flagBits[3] === 1
			}
		};
	}

	public readID3v2Header(buffer: Buffer, offset: number): IID3V2.TagHeader | undefined {
		if ((!Markers.isMarker(buffer, offset, Markers.MARKERS.id3)) || (buffer.length < 10)) {
			return;
		}
		const flagBits = bitarray(buffer[5]);
		const head: IID3V2.TagHeader = {
			ver: buffer[offset + 3],
			rev: buffer[offset + 4],
			size: buffer.readInt32BE(offset + 6),
			flagBits,
			valid: false
		};
		if (head.ver > 2) {
			head.size = unsynchsafe(head.size);
		}
		if (head.ver === 4) {
			this.readID3v24Header(head, flagBits);
		} else if (head.ver === 3) {
			this.readID3v23Header(head, flagBits);
		} else if (head.ver <= 2) {
			this.readID3v22Header(head, flagBits);
		}
		head.valid = head.size >= 0 && head.ver <= 4;
		return head;
	}

	public async readHeader(reader: ReaderStream): Promise<{ rest?: Buffer; header?: IID3V2.TagHeader }> {
		const data = await reader.read(ID3v2_HEADER.SIZE);
		const header: IID3V2.TagHeader | undefined = this.readID3v2Header(data, 0);
		if (!header || !header.valid) {
			return { rest: data };
		}
		if (header.v3 && header.v3.flags.extendedheader) {
			const extended = await this.readID3ExtendedHeaderV3(reader);
			header.v3.extended = extended.exthead;
			return { header, rest: extended.rest };
		} else if (header.v4 && header.v4.flags.extendedheader) {
			const extended = await this.readID3ExtendedHeaderV4(reader);
			header.v4.extended = extended.exthead;
			return { header, rest: extended.rest };
		}
		return { header };
	}
}
