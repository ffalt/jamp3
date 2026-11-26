import { describe, expect, it } from '@jest/globals';
import fse from 'fs-extra';
import path from 'node:path';

import { FileWriterStream } from '../../src/lib/common/stream-writer-file.js';

describe('FileWriterStream.copyRange', () => {
	const dir = 'local/test-copyrange';
	const source = path.join(dir, 'source.bin');
	const target = path.join(dir, 'target.bin');

	beforeAll(async () => {
		await fse.ensureDir(dir);
		await fse.writeFile(source, Buffer.from('0123456789', 'ascii'));
	});

	afterAll(async () => {
		await fse.remove(dir);
	});

	async function copyRange(start: number, finish: number): Promise<string> {
		const stream = new FileWriterStream();
		await stream.open(target);
		await stream.copyRange(source, start, finish);
		await stream.close();
		const written = await fse.readFile(target);
		return written.toString('ascii');
	}

	it('treats finish as an exclusive bound', async () => {
		expect(await copyRange(0, 4)).toBe('0123');
	});

	it('copies the whole file when finish is the file size', async () => {
		expect(await copyRange(0, 10)).toBe('0123456789');
	});

	it('copies a single byte', async () => {
		expect(await copyRange(3, 4)).toBe('3');
	});

	it('copies the tail of a file', async () => {
		expect(await copyRange(7, 10)).toBe('789');
	});

	it('copies nothing for an empty range', async () => {
		expect(await copyRange(0, 0)).toBe('');
		expect(await copyRange(5, 5)).toBe('');
	});
});
