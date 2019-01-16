import fs from 'fs';
import {BufferUtils} from './buffer';
import {synchsafe, unbitarray} from './utils';
import {Encodings, IEncoding} from './encodings';
import {ID3v2_UnifiedENCODINGS} from '../id3v2/id3v2_consts';
import {removeUnsync} from '../id3v2/id3v2_frames';

const MemoryStream = require('memory-stream');

const ascii = Encodings['ascii'];
const utf8 = Encodings['utf8'];

export class ReaderStream {
	readableStream: fs.ReadStream | null = null;
	buffers: Array<Buffer> = [];
	buffersLength = 0;
	waiting: (() => void) | null = null;

	private streamEnd = false;
	private streamOnData: ((chunk: Buffer) => void) | null = null;
	end = false;
	pos = 0;

	constructor() {
		this.streamOnData = this.onData;
	}

	private onData(chunk: Buffer) {
		if (this.readableStream) {
			this.readableStream.pause();
		}
		// console.log('got %d bytes of data', chunk.length);
		this.buffers.push(chunk);
		this.buffersLength = this.getBufferLength();
		// this.buf = BufferUtils.concatBuffer(this.buf, chunk);
		if (this.waiting) {
			// console.log('call waiting (data)', !!this.waiting);
			const w = this.waiting;
			this.waiting = null;
			w();
		}
	}

	private onSkip(chunk: Buffer) {
		this.pos += chunk.length;
	}

	async open(filename: string): Promise<void> {
		try {
			this.readableStream = fs.createReadStream(filename);
		} catch (err) {
			return Promise.reject(err);
		}
		return new Promise<void>((resolve, reject) => {
			if (!this.readableStream) {
				return reject(Error('Could not open file ' + filename));
			}
			this.readableStream.on('error', (err) => {
				return reject(err);
			});
			this.readableStream.on('end', () => {
				this.end = true;
				this.streamEnd = true;
				if (this.waiting) {
					// console.log('call waiting (open)', !!this.waiting);
					const w = this.waiting;
					this.waiting = null;
					w();
				}
				this.close();
			});
			this.readableStream.on('data', (chunk) => {
				// console.log('data', !!this.streamOnData);
				if (this.streamOnData) {
					this.streamOnData(chunk);
				}
			});
			// console.log('set waiting start');
			this.waiting = () => {
				resolve();
			};
		});
	}

	async consumeToEnd(): Promise<void> {
		this.pos += this.buffersLength;
		this.buffers = [];
		this.streamOnData = this.onSkip;
		await this.resume();
	}

	close() {
		if (this.readableStream) {
			this.readableStream.close();
			this.readableStream.destroy();
			this.readableStream = null;
		}
	}

	private getBufferLength(): number {
		let result = 0;
		this.buffers.forEach(buf => {
			result += buf.length;
		});
		return result;
	}

	private async resume(): Promise<void> {
		if (!this.readableStream) {
			this.streamEnd = true;
			return;
		}
		return new Promise<void>((resolve, reject) => {
			// console.log('set waiting resume');
			this.waiting = () => {
				resolve();
			};
			if (this.readableStream) {
				this.readableStream.resume();
			}
		});
	}

	public get(amount: number) {
		return this.getAndPrepend(amount, []);
	}

	public skip(amount: number) {
		let givenLength = 0;
		let i = 0;
		while (i < this.buffers.length) {
			const b = this.buffers[i];
			const need = amount - givenLength;
			if (need < b.length) {
				givenLength += need;
				this.buffers[i] = b.slice(need);
				break;
			} else {
				givenLength += b.length;
				i++;
			}
		}
		this.pos += givenLength;
		this.buffers = this.buffers.slice(i);
		this.buffersLength = this.getBufferLength();
	}

	public getAndPrepend(amount: number, prepend: Array<Buffer>) {
		const destBuffers = prepend;
		let givenLength = 0;
		let i = 0;
		while (i < this.buffers.length) {
			const b = this.buffers[i];
			const need = amount - givenLength;
			if (need < b.length) {
				destBuffers.push(b.slice(0, need));
				this.buffers[i] = b.slice(need);
				break;
			} else {
				destBuffers.push(b);
				givenLength += b.length;
				i++;
			}
		}
		this.buffers = this.buffers.slice(i);
		this.buffersLength = this.getBufferLength();
		const result = BufferUtils.concatBuffers(destBuffers);
		this.pos += amount;
		return result;
	}

	async read(amount: number): Promise<Buffer> {
		amount = Math.max(1, amount);
		if ((this.buffersLength >= amount)) {
			const result = this.get(amount);
			this.end = this.streamEnd && this.buffersLength === 0;
			return result;
		}
		if (!this.streamEnd) {
			await this.resume();
			return await this.read(amount);
			// TODO: process.nextTick(() => {}); with async/wait still needed?
		} else {
			if (this.buffersLength === 0) {
				return BufferUtils.zeroBuffer(0);
			}
			const result = BufferUtils.concatBuffers(this.buffers);
			this.buffers = [];
			this.buffersLength = 0;
			// const result = this.buf;
			this.pos += result.length;
			// this.buf = BufferUtils.zeroBuffer(0);
			this.end = this.streamEnd; // && this.buf.length === 0;
			return result;
		}
	}

	public unshift(buffer: Buffer) {
		this.buffers.unshift(buffer);
		this.buffersLength = this.getBufferLength();
		// this.buf = BufferUtils.concatBuffer(buffer, this.buf);
		this.pos -= buffer.length;
		this.end = this.streamEnd && this.buffersLength === 0;
	}

	async scan(buffer: Buffer): Promise<number> {
		if (this.end) {
			return -1;
		}
		const result = BufferUtils.concatBuffers(this.buffers);
		const index = BufferUtils.indexOfBuffer(result, buffer);
		if (index >= 0) {
			this.pos += index;
			this.buffers = [result.slice(index)];
			return this.pos;
		} else {
			if (this.end) {
				return -1;
			}
			this.pos += result.length;
			this.buffers = [];
			this.buffersLength = 0;
			await this.resume();
			return this.scan(buffer);
		}
	}
}

export class WriterStream {
	protected wstream: fs.WriteStream;

	constructor() {
		this.wstream = new MemoryStream();
	}

	writeByte(byte: number) {
		const buf = BufferUtils.zeroBuffer(1);
		buf.writeUInt8(byte, 0, true);
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
		buf.writeUIntBE(int, 0, 4, true);
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

	writeFixedAsciiString(val: string, amount: number) {
		let buf = ascii.encode(val.slice(0, amount)).slice(0, amount);
		const padding = amount - buf.length;
		if (padding > 0) {
			const pad = BufferUtils.zeroBuffer(padding);
			buf = BufferUtils.concatBuffer(buf, pad);
		}
		this.writeBuffer(buf);
	}

	writeFixedUTF8String(val: string, amount: number) {
		let buf = utf8.encode(val.slice(0, amount)).slice(0, amount);
		const padding = amount - buf.length;
		if (padding > 0) {
			const pad = BufferUtils.zeroBuffer(padding);
			buf = BufferUtils.concatBuffer(buf, pad);
		}
		this.writeBuffer(buf);
	}
}

export class FileWriterStream extends WriterStream {

	constructor() {
		super();
	}

	async open(filename: string): Promise<void> {
		try {
			this.wstream = fs.createWriteStream(filename);
		} catch (err) {
			return Promise.reject(err);
		}
		return new Promise<void>((resolve, reject) => {
			this.wstream.once('open', (fd) => {
				resolve();
			});
		});
	}

	async close(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.wstream.on('close', () => {
				resolve();
			});
			this.wstream.end();
		});
	}

	async copyFrom(filename: string, position: number): Promise<void> {
		const readstream = fs.createReadStream(filename, {start: position});
		return new Promise<void>((resolve, reject) => {
			readstream.on('error', (err) => {
				return reject(err);
			});
			readstream.on('end', (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
			readstream.pipe(this.wstream);
		});
	}
}

export class MemoryWriterStream extends WriterStream {

	constructor() {
		super();
	}

	toBuffer(): Buffer {
		return (<any>this.wstream).toBuffer(); // TODO: type Memorystream
	}
}

export class DataReader {

	data: Buffer;
	position = 0;

	constructor(data: Buffer) {
		this.data = data;
	}

	readStringTerminated(enc: IEncoding): string {
		const i = BufferUtils.scanBufferText(this.data, enc.terminator, this.position);
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
		const result = this.data.readUIntBE(this.position, 2, true);
		this.position += 2;
		return result;
	}

	readSInt2Byte(): number {
		const result = this.data.readIntBE(this.position, 2, true);
		this.position += 2;
		return result;
	}

	readUInt4Byte(): number {
		const result = this.data.readUInt32BE(this.position, true);
		this.position += 4;
		return result;
	}

	readEncoding(): IEncoding {
		const encid = this.data[this.position].toString();
		const encoding = ID3v2_UnifiedENCODINGS[encid] || 'ascii';
		this.position += 1;
		return Encodings[encoding] || ascii;
	}

	readFixedAsciiString(amount: number): string {
		let buf = this.data.slice(this.position, this.position + amount);
		this.position += amount;
		for (let i = 0; i < buf.length; i++) {
			if (buf[i] === 0) {
				buf = buf.slice(0, i);
				break;
			}
		}
		return ascii.decode(buf);
	}

	readFixedUTF8String(amount: number): string {
		let buf = this.data.slice(this.position, this.position + amount);
		this.position += amount;
		for (let i = 0; i < buf.length; i++) {
			if (buf[i] === 0) {
				buf = buf.slice(0, i);
				break;
			}
		}
		return utf8.decode(buf);
	}

	readFixedAutodectectString(amount: number): string {
		let buf = this.data.slice(this.position, this.position + amount);
		for (let i = 0; i < buf.length; i++) {
			if (buf[i] === 0) {
				buf = buf.slice(0, i);
				break;
			}
		}
		let result = utf8.decode(buf);
		if (result.indexOf('�') >= 0) {
			result = ascii.decode(buf);
		}
		this.position += amount;
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

