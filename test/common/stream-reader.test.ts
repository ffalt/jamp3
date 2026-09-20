import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';

import { ReaderStream } from '../../src/lib/common/stream-reader.js';

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

function chunkedStream(chunks: Array<Buffer>): Readable {
	return new ChunkedStream(chunks);
}

describe('ReaderStream.scan', () => {
	it('finds a marker that starts in one chunk but only completes in the next', async () => {
		const chunks = [Buffer.from('xxI'), Buffer.from('D3yyy')];
		const stream = chunkedStream(chunks);
		const reader = new ReaderStream();
		await reader.openStream(stream);
		const index = await reader.scan(Buffer.from('ID3'));
		expect(index).toBe(2);
	});

	it('finds a marker even when split byte-by-byte across many chunks', async () => {
		const chunks = 'xxID3yyy'.split('').map(c => Buffer.from(c));
		const stream = chunkedStream(chunks);
		const reader = new ReaderStream();
		await reader.openStream(stream);
		const index = await reader.scan(Buffer.from('ID3'));
		expect(index).toBe(2);
	});

	it('returns -1 when the marker never appears in the stream', async () => {
		const chunks = [Buffer.from('xxI'), Buffer.from('D2yyy')];
		const stream = chunkedStream(chunks);
		const reader = new ReaderStream();
		await reader.openStream(stream);
		const index = await reader.scan(Buffer.from('ID3'));
		expect(index).toBe(-1);
	});
});
