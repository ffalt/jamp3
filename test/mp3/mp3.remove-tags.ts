import tmp from 'tmp';
import fse from 'fs-extra';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { ID3V24TagBuilder } from '../../src/lib/id3v2/id3v2.builder.v24';
import { IMP3 } from '../../src/lib/mp3/mp3.types';
import { MP3 } from '../../src/lib/mp3/mp3';

async function compareRemovalAudio(before: IMP3.Result, after: IMP3.Result): Promise<void> {
	if (!before.frames || !after.frames) {
		return Promise.reject(new Error('no frames obj'));
	}
	expect(after.frames.headers.length).toBe(before.frames.headers.length); // 'header frames length not equal');
	expect(after.frames.audio.length).toBe(before.frames.audio.length); // 'audio frames length not equal');
}

async function removeID3v1TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		await fse.copyFile(filename, file.name);
		const mp3 = new MP3();
		const result = await mp3.removeTags(file.name, { id3v1: true, id3v2: false });
		const after = await mp3.read(file.name, { id3v1: true, id3v2: true, mpeg: true });
		file.removeCallback();
		expect(result).toBeTruthy();
		if (!result) {
			return;
		}
		expect(result.id3v1).toBe(true); // 'result should report removed id3v1 tag (id3v1.remove)');
		expect(result.id3v2).toBe(false); // 'result should not report removed id3v2 tag (id3v1.remove)');
		expect(!!after.id3v2).toBe(!!before.id3v2); // 'id3v2 tag should be unchanged (id3v1.remove)');
		expect(!!after.id3v1).toBe(false); // 'id3v1 tag should no longer exists (id3v1.remove)');
		return compareRemovalAudio(before, after);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
}

async function removeID3v2TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		await fse.copyFile(filename, file.name);
		const mp3 = new MP3();
		const result = await mp3.removeTags(file.name, { id3v1: false, id3v2: true });
		const after = await mp3.read(file.name, { id3v1: true, id3v2: true, mpeg: true });
		let stat = await fse.stat(file.name);
		const cleanFileSize = stat.size;
		const id3v2 = new ID3v2();
		await id3v2.writeBuilder(file.name, (new ID3V24TagBuilder()), { keepBackup: false, paddingSize: 0 });
		await mp3.removeTags(file.name, { id3v1: false, id3v2: true });
		const after2 = await mp3.read(file.name, { id3v1: true, id3v2: true, mpeg: true });
		stat = await fse.stat(file.name);
		const cleanFileSize2 = stat.size;
		expect(result).toBeTruthy();
		if (!result) {
			file.removeCallback();
			return;
		}
		expect(result.id3v1).toBe(false); // 'result should not report removed id3v1 tag (id3v2.remove)');
		expect(result.id3v2).toBe(true); // 'result should report removed id3v2 tag (id3v2.remove)');
		expect(!!after.id3v1).toBe(!!before.id3v1); // 'id3v1 tag should be unchanged (id3v2.remove)');
		expect(!!after.id3v2).toBe(false); // 'id3v2 tag should no longer exists (id3v2.remove)');
		expect(!!after2.id3v1).toBe(!!before.id3v1); // 'id3v1 tag should be unchanged (id3v2.remove)');
		expect(!!after2.id3v2).toBe(false); // 'id3v2 tag should no longer exists (id3v2.remove)');
		await compareRemovalAudio(before, after);
		expect(cleanFileSize2).toBe(cleanFileSize); // 'padding leftovers not removed');
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}

async function removeID3TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	try {
		await fse.remove(file.name);
		await fse.copyFile(filename, file.name);
		const mp3 = new MP3();
		const result = await mp3.removeTags(file.name, { id3v1: true, id3v2: true });
		const after = await mp3.read(file.name, { id3v1: true, id3v2: true, mpeg: true });
		const empty = await mp3.removeTags(file.name, { id3v1: true, id3v2: false });
		expect(empty).toBeUndefined();
		if (!result) {
			file.removeCallback();
			return;
		}
		expect(result.id3v1).toBe(true); // 'result should report removed id3v1 tag (id3v2&1.remove)');
		expect(result.id3v2).toBe(true); //  'result should report removed id3v2 tag (id3v2&1.remove)');
		expect(!!after.id3v1).toBe(false); //  'id3v1 tag should no longer exists (id3v2&1.remove)');
		expect(!!after.id3v2).toBe(false); //  'id3v2 tag should no longer exists (id3v2&1.remove)');
		file.removeCallback();
		return compareRemovalAudio(before, after);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
}

export async function testRemoveTags(filename: string): Promise<void> {
	const mp3 = new MP3();
	const before = await mp3.read(filename, { id3v1: true, id3v2: true, mpeg: true });
	if (before.id3v1) {
		await removeID3v1TagsTest(filename, before);
	}
	if (before.id3v2) {
		await removeID3v2TagsTest(filename, before);
	}
	if (before.id3v1 && before.id3v2) {
		await removeID3TagsTest(filename, before);
	}
}
