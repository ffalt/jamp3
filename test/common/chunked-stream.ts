import { Readable } from 'node:stream';

class ChunkedStream extends Readable {
	private i = 0;

	constructor(private chunks: Array<Buffer>) {
		super();
	}

	override _read(): void {
		if (this.i < this.chunks.length) {
			this.push(this.chunks[this.i]);
			this.i++;
		} else {
			this.push(null);
		}
	}
}

export function chunkedStream(chunks: Array<Buffer>): Readable {
	return new ChunkedStream(chunks);
}

// deliver the buffer in small chunks; a single-chunk stream would set the reader's end flag before scanning
export function streamOf(buffer: Buffer): Readable {
	const chunks: Array<Buffer> = [];
	for (let pos = 0; pos < buffer.length; pos += 7) {
		chunks.push(buffer.subarray(pos, pos + 7));
	}
	return chunkedStream(chunks);
}
