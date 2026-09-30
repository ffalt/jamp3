import { bitarray, flags, unsynchsafe } from '../common/utils.js';
import { Markers } from '../common/marker.js';
import { ID3v2_EXTHEADER, ID3v2_HEADER } from './id3v2.header.consts.js';
import { IID3V2 } from './id3v2.types.js';
import { ReaderStream } from '../common/stream-reader.js';

export class ID3v2HeaderReader {
	private async readID3ExtendedHeaderV3(reader: ReaderStream): Promise<{ rest?: Buffer; exthead: IID3V2.TagHeaderExtendedVer3 }> {
		const headdata = await reader.read(4);
		// the size excludes itself and is currently 6 or 10 bytes (10 when crc data is present);
		// use an unsigned read and normalize anything else to the common 6-byte form,
		// so malformed values can not turn negative or leave the reader misaligned
		const rawSize = headdata.readUInt32BE(0);
		const size = (rawSize === 6 || rawSize === 10) ? rawSize : 6;
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
			flags1: flags(ID3v2_EXTHEADER[3].FLAGS1, data.length > 0 ? bitarray(data[0]) : []),
			flags2: flags(ID3v2_EXTHEADER[3].FLAGS2, data.length > 1 ? bitarray(data[1]) : []),
			sizeOfPadding: data.length >= 6 ? data.readUInt32BE(2) : 0
		};
		if (exthead.flags1.crc && data.length >= 10) {
			exthead.crcData = data.readUInt32BE(6);
		}
		return { exthead };
	}

	private async readID3ExtendedHeaderV4(reader: ReaderStream, tagSize: number): Promise<{ rest?: Buffer; exthead: IID3V2.TagHeaderExtendedVer4 }> {
		/**
		 ID3v2.4
		 Extended header size   4 * %0xxxxxxx
		 Number of flag bytes       $01
		 Extended Flags             $xx

		 The 'Extended header size' is the size of the whole extended header,
		 stored as a 32 bit synchsafe integer - i.e. it includes these 4 bytes
		 themselves. An extended header can thus never have a size of fewer
		 than six bytes.
		 */
		const headdata = await reader.read(4);
		// use an unsigned read so high-bit sizes stay positive
		let size = unsynchsafe(headdata.readUInt32BE(0));
		if (size < 6) {
			size = 6;
		}
		// clamp to the remaining tag body (header.size excludes the 10-byte header itself and
		// the optional footer) so a malformed size can not swallow audio data
		const maxSize = Math.max(tagSize, 6);
		size = Math.min(size, maxSize);
		const data = await reader.read(size - 4);
		const exthead: IID3V2.TagHeaderExtendedVer4 = {
			size,
			// byte 0 is the "number of flag bytes" ($01); the flags themselves are byte 1
			flags: data.length > 1 ? flags(ID3v2_EXTHEADER[4].FLAGS, bitarray(data[1])) : {}
		};
		let pos = 2;
		if (exthead.flags.update && pos < data.length) {
			pos++; // Flag data length $00, no further data
		}
		if (exthead.flags.crc && pos < data.length) {
			// Flag data length $05, Total frame CRC 5 * %0xxxxxxx (35-bit synchsafe integer)
			const crcSize = data[pos];
			pos++;
			let crc32 = 0;
			for (let i = 0; i < crcSize && (pos + i) < data.length; i++) {
				crc32 = (crc32 * 128) + (data[pos + i] & 0x7F);
			}
			exthead.crc32 = crc32;
			pos += crcSize;
		}
		if (exthead.flags.restrictions && pos < data.length) {
			pos++; // Flag data length $01
			const r = data[pos];
			if (r !== undefined) {
				exthead.restrictions = {
					tagSize: (r >> 6) & 0x03,
					textEncoding: (r >> 5) & 0x01,
					textSize: (r >> 3) & 0x03,
					imageEncoding: (r >> 2) & 0x01,
					imageSize: r & 0x03
				};
			}
		}
		return { exthead };
	}

	private readID3v22Header(head: IID3V2.TagHeader, flagBits: Array<number>, rawSize: number): void {
		head.v2 = {
			sizeAsSyncSafe: unsynchsafe(rawSize), // keep this if someone is writing v2 with syncsafeint
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
		const flagBits = bitarray(buffer[offset + 5]);
		const head: IID3V2.TagHeader = {
			ver: buffer[offset + 3],
			rev: buffer[offset + 4],
			size: buffer.readInt32BE(offset + 6),
			flagBits,
			valid: false
		};
		const rawSize = head.size;
		if (head.ver > 2) {
			head.size = unsynchsafe(head.size);
		} else if (head.ver === 2) {
			// per spec the v2.2 tag size is a syncsafe integer, but some encoders write it
			// as a plain uint32; a set high bit in any size byte proves the plain format
			const sizeBytes = buffer.subarray(offset + 6, offset + 10);
			if (sizeBytes.every(b => b < 0x80)) {
				head.size = unsynchsafe(head.size);
			}
		}
		if (head.ver === 4) {
			this.readID3v24Header(head, flagBits);
		} else if (head.ver === 3) {
			this.readID3v23Header(head, flagBits);
		} else if (head.ver <= 2) {
			this.readID3v22Header(head, flagBits, rawSize);
		}
		head.valid = head.size >= 0 && head.ver >= 2 && head.ver <= 4;
		return head;
	}

	public async readHeader(reader: ReaderStream): Promise<{ rest?: Buffer; header?: IID3V2.TagHeader; consumed?: number }> {
		const data = await reader.read(ID3v2_HEADER.SIZE);
		const header: IID3V2.TagHeader | undefined = this.readID3v2Header(data, 0);
		if (!header || !header.valid) {
			return { rest: data };
		}
		if (header.v3 && header.v3.flags.extendedheader) {
			const pos = reader.pos;
			const extended = await this.readID3ExtendedHeaderV3(reader);
			header.v3.extended = extended.exthead;
			return { header, rest: extended.rest, consumed: reader.pos - pos };
		}
		if (header.v4 && header.v4.flags.extendedheader) {
			const pos = reader.pos;
			const extended = await this.readID3ExtendedHeaderV4(reader, header.size);
			header.v4.extended = extended.exthead;
			return { header, rest: extended.rest, consumed: reader.pos - pos };
		}
		return { header };
	}
}
