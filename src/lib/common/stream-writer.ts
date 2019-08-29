import fs from 'fs';
import {BufferUtils} from './buffer';
import {synchsafe, unbitarray} from './utils';
import {Encodings, IEncoding} from './encodings';

const MemoryStream = require('memory-stream'); // TODO: type Memorystream

export class WriterStream {
	protected wstream: fs.WriteStream;
	protected ascii = Encodings['ascii'];
	protected utf8 = Encodings['utf8'];

	constructor() {
		this.wstream = new MemoryStream();
	}

	writeByte(byte: number) {
		const buf = BufferUtils.zeroBuffer(1);
		buf.writeUInt8(byte, 0);
		this.wstream.write(buf);
	}

	writeBytes(bytes: Array<number>) {
		this.wstream.write(BufferUtils.fromArray(bytes));
	}

	writeBitsByte(bits: Array<number>) {
		while (bits.length < 8) {
			bits.push(0);
		}
		this.writeByte(unbitarray(bits));
	}

	writeBuffer(buffer: Buffer) {
		this.wstream.write(buffer);
	}

	writeSyncSafeInt(int: number) {
		const buf = BufferUtils.zeroBuffer(4);
		buf.writeUIntBE(synchsafe(int), 0, 4);
		this.wstream.write(buf);
	}

	writeUInt(int: number, byteLength: number) {
		const buf = BufferUtils.zeroBuffer(byteLength);
		buf.writeUIntBE(int, 0, byteLength);
		this.wstream.write(buf);
	}

	writeUByte(int: number) {
		const buf = BufferUtils.zeroBuffer(1);
		buf.writeUInt8(int, 0);
		this.wstream.write(buf);
	}

	writeUInt2Byte(int: number) {
		const buf = BufferUtils.zeroBuffer(2);
		buf.writeUIntBE(int, 0, 2);
		this.wstream.write(buf);
	}

	writeSInt2Byte(int: number) {
		const buf = BufferUtils.zeroBuffer(2);
		buf.writeIntBE(int, 0, 2);
		this.wstream.write(buf);
	}

	writeUInt3Byte(int: number) {
		const buf = BufferUtils.zeroBuffer(3);
		buf.writeUIntBE(int, 0, 3);
		this.wstream.write(buf);
	}

	writeUInt4Byte(int: number) {
		const buf = BufferUtils.zeroBuffer(4);
		buf.writeUIntBE(int, 0, 4);
		this.wstream.write(buf);
	}

	writeSInt(int: number, byteLength: number) {
		const buf = BufferUtils.zeroBuffer(byteLength);
		buf.writeIntBE(int, 0, byteLength);
		this.wstream.write(buf);
	}

	writeEncoding(enc: IEncoding) {
		this.writeByte(enc.byte);
	}

	writeString(val: string, enc: IEncoding) {
		if (enc.bom) {
			this.writeBytes(enc.bom);
		}
		this.wstream.write(enc.encode(val));
	}

	writeStringTerminated(val: string, enc: IEncoding) {
		if (enc.bom) {
			this.writeBytes(enc.bom);
		}
		this.wstream.write(enc.encode(val));
		this.writeTerminator(enc);
	}

	writeAsciiString(val: string, length: number) {
		while (val.length < length) {
			val += ' ';
		}
		this.wstream.write(val.slice(0, length), 'ascii');
	}

	writeAscii(val: string) {
		this.wstream.write(val, 'ascii');
	}

	writeTerminator(enc: IEncoding) {
		this.writeBuffer(enc.terminator);
	}

	writeFixedBuffer(buffer: Buffer, size: number) {
		const padding = size - buffer.length;
		if (padding > 0) {
			const pad = BufferUtils.zeroBuffer(padding);
			buffer = BufferUtils.concatBuffer(buffer, pad);
		}
		this.writeBuffer(buffer);
	}

	writeFixedAsciiString(val: string, size: number) {
		const buf = this.ascii.encode(val.slice(0, size)).slice(0, size);
		this.writeFixedBuffer(buf, size);
	}

	writeFixedUTF8String(val: string, size: number) {
		const buf = this.utf8.encode(val.slice(0, size)).slice(0, size);
		this.writeFixedBuffer(buf, size);
	}
}
