import iconv from 'iconv-lite';
import { IFrameImpl } from '../id3v2.frame';
import { ascii } from '../../../common/encodings';
import { IID3V2 } from '../../id3v2.types';
import { PRIVGuidOwners, PRIVNumericOwners, PRIVWideStringOwners } from '../../id3v2.simplify.maps';

type PrivValue = IID3V2.FrameValue.IdBin | IID3V2.FrameValue.IdNum | IID3V2.FrameValue.IdGuid | IID3V2.FrameValue.IdText;

/**
 * Parse a 16-byte Windows GUID buffer (mixed-endian) into a GUID string.
 * Layout: Data1 (4 LE) | Data2 (2 LE) | Data3 (2 LE) | Data4 (8 BE)
 */
export function bufToGuid(buf: Buffer): string {
	const d1 = buf.readUInt32LE(0).toString(16).padStart(8, '0');
	const d2 = buf.readUInt16LE(4).toString(16).padStart(4, '0');
	const d3 = buf.readUInt16LE(6).toString(16).padStart(4, '0');
	const d4a = buf.slice(8, 10).toString('hex');
	const d4b = buf.slice(10, 16).toString('hex');
	return `${d1}-${d2}-${d3}-${d4a}-${d4b}`.toUpperCase();
}

/** Encode a GUID string into a 16-byte Windows GUID buffer (mixed-endian). */
export function guidToBuf(guid: string): Buffer {
	const hex = guid.replaceAll('-', '');
	const buf = Buffer.alloc(16);
	buf.writeUInt32LE(Number.parseInt(hex.slice(0, 8), 16), 0);
	buf.writeUInt16LE(Number.parseInt(hex.slice(8, 12), 16), 4);
	buf.writeUInt16LE(Number.parseInt(hex.slice(12, 16), 16), 6);
	Buffer.from(hex.slice(16), 'hex').copy(buf, 8);
	return buf;
}

export const FramePriv: IFrameImpl = {
	/**
	 Owner identifier        <text string> $00
	 The private data        <binary data>

	 Known numeric (4-byte LE uint32) owners: AverageLevel, PeakValue
	 Known GUID (16-byte mixed-endian) owners: WM/MediaClassPrimaryID,
	   WM/MediaClassSecondaryID, WM/WMContentID, WM/WMCollectionID,
	   WM/WMCollectionGroupID
	 Known wide-string (UTF-16 LE, null-terminated) owners: WM/Provider,
	   WM/UniqueFileIdentifier
	 */
	parse: async reader => {
		const id = reader.readStringTerminated(ascii);
		if (PRIVNumericOwners.has(id)) {
			const buf = reader.rest();
			const num = buf.length >= 4 ? buf.readUInt32LE(0) : 0;
			const value: IID3V2.FrameValue.IdNum = { id, num };
			return { value, encoding: ascii };
		}
		if (PRIVGuidOwners.has(id)) {
			const buf = reader.rest();
			const guid = buf.length >= 16 ? bufToGuid(buf) : '00000000-0000-0000-0000-000000000000';
			const value: IID3V2.FrameValue.IdGuid = { id, guid };
			return { value, encoding: ascii };
		}
		if (PRIVWideStringOwners.has(id)) {
			const buf = reader.rest();
			// Strip UTF-16 LE null terminator ($00 $00) if present
			let end = buf.length;
			while (end >= 2 && buf[end - 2] === 0 && buf[end - 1] === 0) {
				end -= 2;
			}
			const text = iconv.decode(buf.slice(0, end), 'ucs2');
			const value: IID3V2.FrameValue.IdText = { id, text };
			return { value, encoding: ascii };
		}
		const bin = reader.rest();
		const value: IID3V2.FrameValue.IdBin = { id, bin };
		return { value, encoding: ascii };
	},
	write: async (frame, stream) => {
		const value = frame.value as PrivValue;
		await stream.writeStringTerminated(value.id, ascii);
		if ('num' in value) {
			const buf = Buffer.alloc(4);
			buf.writeUInt32LE(value.num, 0);
			await stream.writeBuffer(buf);
		} else if ('guid' in value) {
			await stream.writeBuffer(guidToBuf(value.guid));
		} else if ('text' in value) {
			// UTF-16 LE without BOM, with null terminator
			await stream.writeBuffer(iconv.encode(value.text, 'ucs2'));
			await stream.writeBuffer(Buffer.from([0, 0]));
		} else {
			await stream.writeBuffer(value.bin);
		}
	},
	simplify: (value: PrivValue) => {
		if (!value) {
			return null;
		}
		if ('num' in value) {
			return value.num.toString();
		}
		if ('guid' in value) {
			return value.guid;
		}
		if ('text' in value) {
			return value.text || null;
		}
		if (value.bin && value.bin.length > 0) {
			return `<bin ${value.bin.length}bytes>`;
		}
		return null;
	}
};
