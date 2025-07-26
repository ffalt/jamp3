import fs from 'node:fs';
import { BufferUtils } from './buffer';
import { synchsafe, unbitarray } from './utils';
import { ascii, IEncoding } from './encodings';
import MemoryStream from 'memory-stream';

export class WriterStream {
	protected wstream: fs.WriteStream;

	constructor() {
		this.wstream = new MemoryStream();
	}

	private async _write(something: Buffer): Promise<void> {
		if (!this.wstream.write(something)) {
			// handle backpressure
			return new Promise<void>((resolve, _reject) => {
				this.wstream.once('drain', () => {
					resolve();
				});
			});
		}
	}

	private async _writeString(something: string, encoding: BufferEncoding): Promise<void> {
		if (!this.wstream.write(something, encoding)) {
			// handle backpressure
			return new Promise<void>((resolve, _reject) => {
				this.wstream.once('drain', () => {
					resolve();
				});
			});
		}
	}

	async writeByte(byte: number): Promise<void> {
		const buf = BufferUtils.zeroBuffer(1);
		buf.writeUInt8(byte, 0);
		return this._write(buf);
	}

	async writeBytes(bytes: Array<number>): Promise<void> {
		return this._write(BufferUtils.fromArray(bytes));
	}

	async writeBitsByte(bits: Array<number>): Promise<void> {
		while (bits.length < 8) {
			bits.push(0);
		}
		return this.writeByte(unbitarray(bits));
	}

	async writeBuffer(buffer: Buffer): Promise<void> {
		return this._write(buffer);
	}

	async writeSyncSafeInt(int: number): Promise<void> {
		return this.writeUInt(synchsafe(int), 4);
	}

	async writeUInt(int: number, byteLength: number): Promise<void> {
		const buf = BufferUtils.zeroBuffer(byteLength);
		buf.writeUIntBE(int, 0, byteLength);
		return this._write(buf);
	}

	async writeUInt2Byte(int: number): Promise<void> {
		return this.writeUInt(int, 2);
	}

	async writeUInt3Byte(int: number): Promise<void> {
		return this.writeUInt(int, 3);
	}

	async writeUInt4Byte(int: number): Promise<void> {
		return this.writeUInt(int, 4);
	}

	async writeSInt(int: number, byteLength: number): Promise<void> {
		const buf = BufferUtils.zeroBuffer(byteLength);
		buf.writeIntBE(int, 0, byteLength);
		return this._write(buf);
	}

	async writeSInt2Byte(int: number): Promise<void> {
		return this.writeSInt(int, 2);
	}

	async writeEncoding(enc: IEncoding): Promise<void> {
		return this.writeByte(enc.byte);
	}

	async writeString(val: string, enc: IEncoding): Promise<void> {
		if (enc.bom) {
			await this.writeBytes(enc.bom);
		}
		return this._write(enc.encode(val));
	}

	async writeStringTerminated(val: string, enc: IEncoding): Promise<void> {
		if (enc.bom) {
			await this.writeBytes(enc.bom);
		}
		await this._write(enc.encode(val));
		return this.writeTerminator(enc);
	}

	async writeAsciiString(value: string, length: number): Promise<void> {
		let current = value;
		while (current.length < length) {
			current += ' ';
		}
		return this._writeString(current.slice(0, length), 'ascii');
	}

	async writeAscii(val: string): Promise<void> {
		return this._writeString(val, 'ascii');
	}

	async writeTerminator(enc: IEncoding): Promise<void> {
		return this.writeBuffer(enc.terminator);
	}

	async writeFixedBuffer(buffer: Buffer, size: number): Promise<void> {
		const padding = size - buffer.length;
		if (padding > 0) {
			const pad = BufferUtils.zeroBuffer(padding);
			return this.writeBuffer(BufferUtils.concatBuffer(buffer, pad));
		}
		return this.writeBuffer(buffer);
	}

	async writeFixedAsciiString(val: string, size: number): Promise<void> {
		const buf = ascii.encode(val.slice(0, size)).slice(0, size);
		return this.writeFixedBuffer(buf, size);
	}
}
