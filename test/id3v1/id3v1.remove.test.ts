import { describe, expect, it } from '@jest/globals';
import fse from 'fs-extra';
import path from 'node:path';

import { ID3v1 } from '../../src/lib/id3v1/id3v1.js';
import { MP3 } from '../../src/lib/mp3/mp3.js';
import { ID3v1TestPath } from './id3v1.config.js';

const ID3V1_TAG_LENGTH = 128;
const sourceFile = path.join(ID3v1TestPath, 'agrundma', 'v1.1.mp3');

describe('ID3v1 removal leaves no stray tag byte', () => {
	const dir = 'local/test-id3v1-remove';

	beforeAll(async () => {
		await fse.ensureDir(dir);
	});

	afterAll(async () => {
		await fse.remove(dir);
	});

	async function copyToWorkDir(name: string): Promise<string> {
		const file = path.join(dir, name);
		await fse.copyFile(sourceFile, file);
		return file;
	}

	it('ID3v1.remove strips exactly the tag', async () => {
		const original = await fse.readFile(sourceFile);
		const file = await copyToWorkDir('remove.mp3');
		expect(await new ID3v1().remove(file, { keepBackup: false })).toBe(true);
		const after = await fse.readFile(file);
		expect(after.length).toBe(original.length - ID3V1_TAG_LENGTH);
		expect(after.equals(original.subarray(0, original.length - ID3V1_TAG_LENGTH))).toBe(true);
	});

	it('MP3.removeTags strips exactly the tag', async () => {
		const original = await fse.readFile(sourceFile);
		const file = await copyToWorkDir('removetags.mp3');
		await new MP3().removeTags(file, { id3v1: true, id3v2: false, keepBackup: false });
		const after = await fse.readFile(file);
		expect(after.length).toBe(original.length - ID3V1_TAG_LENGTH);
		expect(after.equals(original.subarray(0, original.length - ID3V1_TAG_LENGTH))).toBe(true);
	});

	it('ID3v1.write keeps the audio untouched when replacing an existing tag', async () => {
		const original = await fse.readFile(sourceFile);
		const audio = original.subarray(0, original.length - ID3V1_TAG_LENGTH);
		const file = await copyToWorkDir('replace.mp3');
		const id3 = new ID3v1();
		const tag = await id3.read(file);
		expect(tag).toBeDefined();
		await id3.write(file, tag!, 1, { keepBackup: false });
		const after = await fse.readFile(file);
		expect(after.length).toBe(original.length);
		expect(after.subarray(0, audio.length).equals(audio)).toBe(true);
		expect(after.subarray(audio.length, audio.length + 3).toString('ascii')).toBe('TAG');
	});
});

describe('ID3v1 removal of a file holding nothing but the tag', () => {
	const dir = 'local/test-id3v1-only';

	beforeAll(async () => {
		await fse.ensureDir(dir);
	});

	afterAll(async () => {
		await fse.remove(dir);
	});

	it('leaves an empty file instead of throwing on a reversed range', async () => {
		const original = await fse.readFile(sourceFile);
		const file = path.join(dir, 'tagonly.mp3');
		await fse.writeFile(file, original.subarray(original.length - ID3V1_TAG_LENGTH));
		expect(await new ID3v1().remove(file, { keepBackup: false })).toBe(true);
		const after = await fse.readFile(file);
		expect(after.length).toBe(0);
	});
});
