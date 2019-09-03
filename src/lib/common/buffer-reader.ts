import {ascii, utf8, IEncoding, Encodings} from './encodings';
import {BufferUtils} from './buffer';
import {ID3v2_UnifiedENCODINGS} from '../id3v2/id3v2.header.consts';
import {removeUnsync} from '../id3v2/frames/id3v2.frame.unsync';

export class BufferReader {
	data: Buffer;
	position = 0;

	constructor(data: Buffer) {
		this.data = data;
	}

	readStringTerminated(enc: IEncoding): string {
		const i = BufferUtils.scanBufferTextPos(this.data, enc.terminator, this.position);
		const buf = this.data.slice(this.position, i);
		const result = (buf.length === 0) ? '' : enc.decode(buf);
		this.position = i + enc.terminator.length;
		return result;
	}

	readString(amount: number, enc: IEncoding): string {
		const result = enc.decode(this.data.slice(this.position, this.position + amount));
		this.position += amount;
		return result;
	}

	rest(): Buffer {
		const result = this.data.slice(this.position);
		this.position += result.length;
		return result;
	}

	readByte(): number {
		const result = this.data[this.position];
		this.position += 1;
		return result;
	}

	readBitsByte(): number {
		const result = this.data.readInt8(this.position);
		this.position += 1;
		return result;
	}

	readUInt(byteLength: number): number {
		const result = this.data.readUIntBE(this.position, byteLength);
		this.position += byteLength;
		return result;
	}

	readSInt(byteLength: number): number {
		const result = this.data.readIntBE(this.position, byteLength);
		this.position += byteLength;
		return result;
	}

	readUInt2Byte(): number {
		const result = this.data.readUIntBE(this.position, 2);
		this.position += 2;
		return result;
	}

	readSInt2Byte(): number {
		const result = this.data.readIntBE(this.position, 2);
		this.position += 2;
		return result;
	}

	readUInt4Byte(): number {
		const result = this.data.readUInt32BE(this.position);
		this.position += 4;
		return result;
	}

	readEncoding(): IEncoding {
		const encid = this.data[this.position].toString();
		const encoding = ID3v2_UnifiedENCODINGS[encid] || 'ascii';
		this.position += 1;
		return Encodings[encoding] || ascii;
	}

	readStringBuffer(amount: number): Buffer {
		let buf = this.data.slice(this.position, this.position + amount);
		this.position += amount;
		for (let i = 0; i < buf.length; i++) {
			if (buf[i] === 0) {
				buf = buf.slice(0, i);
				break;
			}
		}
		return buf;
	}

	// readFixedAsciiString(amount: number): string {
	// 	const buf = this.readStringBuffer(amount);
	// 	return ascii.decode(buf);
	// }
	//
	// readFixedUTF8String(amount: number): string {
	// 	const buf = this.readStringBuffer(amount);
	// 	return utf8.decode(buf);
	// }

	readFixedAutodectectString(amount: number): string {
		const buf = this.readStringBuffer(amount);
		let result = utf8.decode(buf);
		if (result.indexOf('�') >= 0) {
			result = ascii.decode(buf);
		}
		return result;
	}

	unread(): number {
		return this.data.length - this.position;
	}

	hasData(): boolean {
		return this.position < this.data.length;
	}

	readBuffer(amount: number): Buffer {
		const result = this.data.slice(this.position, this.position + amount);
		this.position += amount;
		return result;
	}

	readUnsyncedBuffer(amount: number): Buffer {
		let result = this.data.slice(this.position, this.position + amount);
		let unsynced = removeUnsync(result);
		let stuffed = 0;
		while (unsynced.length < amount && (this.position + amount + stuffed < this.data.length)) {
			stuffed += amount - unsynced.length;
			result = this.data.slice(this.position, this.position + amount + stuffed);
			unsynced = removeUnsync(result);
		}
		this.position = this.position + amount + stuffed;
		return unsynced;
	}
}
