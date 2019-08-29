export class BufferUtils {

	static indexOfNr(buffer: Buffer, num: number, start?: number): number {
		const len = buffer.length;
		for (let i = start || 0; i < len; i++) {
			if (buffer[i] === num) {
				return i;
			}
		}
		return -1;
	}

	public static scanBufferTextPos(buffer: Buffer, search: Array<number> | Buffer, start?: number): number {
		const i = BufferUtils.indexOfBufferStep(buffer, search, start || 0, search.length);
		return i < 0 ? buffer.length : i;
	}

	public static concatBuffer(buffer: Buffer, appendbuffer: Buffer): Buffer {
		return Buffer.concat([buffer, appendbuffer]);
	}

	public static concatBuffers(buffers: Array<Buffer>): Buffer {
		return Buffer.concat(buffers);
	}

	public static indexOfBuffer(buffer: Buffer, search: Array<number> | Buffer, start?: number): number {
		return BufferUtils.indexOfBufferStep(buffer, search, start || 0, 1);
	}

	private static indexOfBufferStep(buffer: Buffer, search: Array<number> | Buffer, start: number, stepWidth: number): number {
		const slen = search.length;
		if (slen === 1) {
			return BufferUtils.indexOfNr(buffer, search[0], start);
		}
		const len = buffer.length;
		for (let i = start; i < len; i = stepWidth + i) {
			for (let j = 0; j < slen; j++) {
				if (buffer[i + j] !== search[j]) {
					break;
				}
				if (j === slen - 1) {
					return i;
				}
			}
		}
		return -1;
	}

	public static compareBuffer(buffer: Buffer, buffer2: Buffer): boolean {
		return (buffer.length === buffer2.length) && (this.indexOfBuffer(buffer, buffer2, 0) === 0 || buffer.length === 0);
	}

	public static fromString(s: string): Buffer {
		return Buffer.from(s);
	}

	public static fromArray(bytes: Array<number>): Buffer {
		return Buffer.from(bytes);
	}

	public static zeroBuffer(size: number): Buffer {
		return Buffer.alloc(size, 0);
	}

}
