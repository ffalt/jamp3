export class BufferUtils {

	static scanBufferTextCharPos(buffer: Buffer, char: number, start: number): number {
		const len = buffer.length;
		for (let i = start || 0; i < len; i++) {
			if (buffer[i] === char) {
				return i;
			}
		}
		return buffer.length;
	}

	public static scanBufferTextPos(buffer: Buffer, search: Array<number> | Buffer, start: number): number {
		const slen = search.length;
		const len = buffer.length;
		if (slen === 1) {
			return BufferUtils.scanBufferTextCharPos(buffer, search[0], start);
		}
		for (let i = start || 0; i < len; i = i + slen) {
			for (let j = 0; j < slen; j++) {
				if (buffer[i + j] !== search[j]) {
					break;
				}
				if (j === slen - 1) {
					return i;
				}
			}
		}
		return buffer.length;
	}

	public static concatBuffer(buffer: Buffer, appendbuffer: Buffer): Buffer {
		return Buffer.concat([buffer, appendbuffer]);
	}

	public static concatBuffers(buffers: Array<Buffer>): Buffer {
		return Buffer.concat(buffers);
	}

	public static indexOfBuffer(buffer: Buffer, search: Buffer, start?: number): number {
		const slen = search.length;
		const len = buffer.length;
		if (slen === 1) {
			const c = search[0];
			for (let i = start || 0; i < len; i++) {
				if (buffer[i] === c) {
					return i;
				}
			}
		} else {
			for (let i = start || 0; i < len; i++) {
				for (let j = 0; j < slen; j++) {
					if (buffer[i + j] !== search[j]) {
						break;
					} else if (j === slen - 1) {
						return i;
					}
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
