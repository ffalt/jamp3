import { Readable } from 'node:stream';
import fs from 'node:fs';
import { BufferUtils } from './buffer';

export class ReaderStream {
	readableStream: Readable | null = null;
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
		this.buffers.push(chunk);
		this.buffersLength = this.getBufferLength();
		if (this.waiting) {
			const w = this.waiting;
			this.waiting = null;
			w();
		}
	}

	private onSkip(chunk: Buffer) {
		this.pos += chunk.length;
	}

	async openStream(stream: Readable): Promise<void> {
		this.readableStream = stream;
		return new Promise<void>((resolve, reject) => {
			if (!this.readableStream) {
				return Promise.reject('Invalid Stream');
			}
			this.readableStream.on('error', error => reject(error));
			this.readableStream.on('end', () => {
				this.end = true;
				this.streamEnd = true;
				if (this.waiting) {
					const w = this.waiting;
					this.waiting = null;
					w();
				}
			});
			this.readableStream.on('data', chunk => {
				if (this.streamOnData) {
					this.streamOnData(chunk);
				}
			});
			this.waiting = () => resolve();
		});
	}

	async open(filename: string): Promise<void> {
		try {
			this.readableStream = fs.createReadStream(filename);
		} catch (error) {
			return Promise.reject(error);
		}
		if (!this.readableStream) {
			return Promise.reject(new Error(`Could not open file ${filename}`));
		}
		await this.openStream(this.readableStream);
	}

	async consumeToEnd(): Promise<void> {
		this.pos += this.buffersLength;
		this.buffers = [];
		this.streamOnData = this.onSkip;
		while (!this.streamEnd) {
			await this.resume();
		}
	}

	close() {
		const stream = this.readableStream;
		this.readableStream = null;
		if (stream) {
			if (typeof (stream as any).close === 'function') {
				(stream as any).close();
			}
			stream.destroy();
		}
	}

	private getBufferLength(): number {
		let result = 0;
		for (const buffer of this.buffers) {
			result += buffer.length;
		}
		return result;
	}

	private async resume(): Promise<void> {
		if (!this.readableStream) {
			this.streamEnd = true;
			return;
		}
		return new Promise<void>((resolve, _reject) => {
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
		const toRead = Math.max(1, amount);
		if ((this.buffersLength >= toRead)) {
			const result = this.get(toRead);
			this.end = this.streamEnd && this.buffersLength === 0;
			return result;
		}
		if (this.streamEnd) {
			if (this.buffersLength === 0) {
				return BufferUtils.zeroBuffer(0);
			}
			const result = BufferUtils.concatBuffers(this.buffers);
			this.buffers = [];
			this.buffersLength = 0;
			this.pos += result.length;
			this.end = this.streamEnd;
			return result;
		} else {
			await this.resume();
			return await this.read(toRead);
		}
	}

	public unshift(buffer: Buffer) {
		if (buffer.length > 0) {
			this.buffers.unshift(buffer);
			this.buffersLength = this.getBufferLength();
			this.pos -= buffer.length;
			this.end = this.streamEnd && this.buffersLength === 0;
		}
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
