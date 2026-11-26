import { bitarray, flags, unsynchsafe } from '../common/utils.js';
import { Markers } from '../common/marker.js';
import { ID3v2_EXTHEADER, ID3v2_FRAME_HEADER, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_HEADER } from './id3v2.header.consts.js';
import { removeUnsyncCounted } from './frames/id3v2.frame.unsync.js';
import { isValidFrameBinId } from './frames/id3v2.frame.match.js';
const ID3v2_EXTHEADER_SIZE_LENGTH = 4;
export class ID3v2HeaderReader {
    async readExtHeaderBytes(reader, amount, unsynchronisation) {
        if (!unsynchronisation) {
            return await reader.read(amount);
        }
        const raw = await reader.read(amount * 2);
        const { data, rawLength } = removeUnsyncCounted(raw, amount);
        reader.unshift(raw.subarray(rawLength));
        return data;
    }
    async readID3ExtendedHeaderV3(reader, unsynchronisation) {
        const headdata = await this.readExtHeaderBytes(reader, ID3v2_EXTHEADER_SIZE_LENGTH, unsynchronisation);
        if (headdata.length < ID3v2_EXTHEADER_SIZE_LENGTH) {
            return { exthead: { size: 0, flags1: {}, flags2: {}, sizeOfPadding: 0 } };
        }
        const rawSize = headdata.readUInt32BE(0);
        const size = (rawSize === 6 || rawSize === 10) ? rawSize : 6;
        const data = await this.readExtHeaderBytes(reader, size, unsynchronisation);
        const exthead = {
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
    async readID3ExtendedHeaderV4(reader, tagSize) {
        const headdata = await reader.read(ID3v2_EXTHEADER_SIZE_LENGTH);
        if (headdata.length < ID3v2_EXTHEADER_SIZE_LENGTH) {
            return { exthead: { size: 0, flags: {} } };
        }
        let size = unsynchsafe(headdata.readUInt32BE(0));
        if (size < 6) {
            size = 6;
        }
        const maxSize = Math.max(tagSize, 6);
        size = Math.min(size, maxSize);
        const data = await reader.read(size - 4);
        const exthead = {
            size,
            flags: data.length > 1 ? flags(ID3v2_EXTHEADER[4].FLAGS, bitarray(data[1])) : {}
        };
        let pos = 2;
        if (exthead.flags.update && pos < data.length) {
            pos++;
        }
        if (exthead.flags.crc && pos < data.length) {
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
            pos++;
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
    readID3v22Header(head, flagBits, rawSize) {
        head.v2 = {
            sizeAsSyncSafe: unsynchsafe(rawSize),
            flags: {
                unsynchronisation: flagBits[0] === 1,
                compression: flagBits[1] === 1
            }
        };
    }
    readID3v23Header(head, flagBits) {
        head.v3 = {
            flags: {
                unsynchronisation: flagBits[0] === 1,
                extendedheader: flagBits[1] === 1,
                experimental: flagBits[2] === 1
            }
        };
    }
    readID3v24Header(head, flagBits) {
        head.v4 = {
            flags: {
                unsynchronisation: flagBits[0] === 1,
                extendedheader: flagBits[1] === 1,
                experimental: flagBits[2] === 1,
                footer: flagBits[3] === 1
            }
        };
    }
    readID3v2Header(buffer, offset) {
        if ((!Markers.isMarker(buffer, offset, Markers.MARKERS.id3)) || (buffer.length < 10)) {
            return;
        }
        const flagBits = bitarray(buffer[offset + 5]);
        const head = {
            ver: buffer[offset + 3],
            rev: buffer[offset + 4],
            size: buffer.readInt32BE(offset + 6),
            flagBits,
            valid: false
        };
        const rawSize = head.size;
        const sizeBytes = buffer.subarray(offset + 6, offset + 10);
        if (sizeBytes.every(b => b < 0x80)) {
            head.size = unsynchsafe(head.size);
        }
        if (head.ver === 4) {
            this.readID3v24Header(head, flagBits);
        }
        else if (head.ver === 3) {
            this.readID3v23Header(head, flagBits);
        }
        else if (head.ver <= 2) {
            this.readID3v22Header(head, flagBits, rawSize);
        }
        head.valid = head.size >= 0 && head.ver >= 2 && head.ver <= 4;
        return head;
    }
    async correctPlainTagSize(reader, header, rawSize) {
        if (header.size === rawSize || header.v3?.flags.extendedheader || header.v4?.flags.extendedheader) {
            return;
        }
        const markerLength = ID3v2_FRAME_HEADER_LENGTHS.MARKER[header.ver];
        const sizeLength = ID3v2_FRAME_HEADER_LENGTHS.SIZE[header.ver];
        const peek = await reader.read(markerLength + sizeLength);
        reader.unshift(peek);
        if (peek.length < markerLength + sizeLength || !isValidFrameBinId(peek.subarray(0, markerLength))) {
            return;
        }
        const frameSize = ID3v2_FRAME_HEADER.SYNCSAVEINT.includes(header.ver) ?
            unsynchsafe(peek.readUIntBE(markerLength, sizeLength)) :
            peek.readUIntBE(markerLength, sizeLength);
        const firstFrameEnd = markerLength + sizeLength + ID3v2_FRAME_HEADER_LENGTHS.FLAGS[header.ver] + frameSize;
        if (firstFrameEnd > header.size && firstFrameEnd <= rawSize) {
            header.size = rawSize;
        }
    }
    async readHeader(reader) {
        const data = await reader.read(ID3v2_HEADER.SIZE);
        const header = this.readID3v2Header(data, 0);
        if (!header || !header.valid) {
            return { rest: data };
        }
        await this.correctPlainTagSize(reader, header, data.readUInt32BE(6));
        if (header.v3 && header.v3.flags.extendedheader) {
            const pos = reader.pos;
            const extended = await this.readID3ExtendedHeaderV3(reader, !!header.v3.flags.unsynchronisation);
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
//# sourceMappingURL=id3v2.reader.header.js.map