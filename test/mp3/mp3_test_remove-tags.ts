import {ID3v2, ID3V24TagBuilder, IMP3, MP3} from '../../src';
import {expect, should} from 'chai';
import tmp from 'tmp';
import fse from 'fs-extra';

async function compareRemovalAudio(before: IMP3.Result, after: IMP3.Result): Promise<void> {
	if (!before.frames || !after.frames) {
		return Promise.reject(Error('no frames obj'));
	}
	expect(after.frames.headers.length).to.equal(before.frames.headers.length, 'header frames length not equal');
	expect(after.frames.audio.length).to.equal(before.frames.audio.length, 'audio frames length not equal');
}

async function removeID3v1TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const mp3 = new MP3();
	const result = await mp3.removeTags(file.name, {id3v1: true, id3v2: false});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	file.removeCallback();
	should().exist(result);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(true, 'result should report removed id3v1 tag (id3v1.remove)');
	expect(result.id3v2).to.equal(false, 'result should not report removed id3v2 tag (id3v1.remove)');
	expect(!!after.id3v2).to.equal(!!before.id3v2, 'id3v2 tag should be unchanged (id3v1.remove)');
	expect(!!after.id3v1).to.equal(false, 'id3v1 tag should no longer exists (id3v1.remove)');
	return compareRemovalAudio(before, after);
}

async function removeID3v2TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const mp3 = new MP3();
	const result = await mp3.removeTags(file.name, {id3v1: false, id3v2: true});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	const cleanFileSize = (await fse.stat(file.name)).size;
	const id3v2 = new ID3v2();
	await id3v2.write(file.name, (new ID3V24TagBuilder()).buildTag(), 4, 0);
	await mp3.removeTags(file.name, {id3v1: false, id3v2: true});
	const cleanFileSize2 = (await fse.stat(file.name)).size;
	file.removeCallback();
	should().exist(result);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(false, 'result should not report removed id3v1 tag (id3v2.remove)');
	expect(result.id3v2).to.equal(true, 'result should report removed id3v2 tag (id3v2.remove)');
	expect(!!after.id3v1).to.equal(!!before.id3v1, 'id3v1 tag should be unchanged (id3v2.remove)');
	expect(!!after.id3v2).to.equal(false, 'id3v2 tag should no longer exists (id3v2.remove)');
	await compareRemovalAudio(before, after);
	expect(cleanFileSize2).to.equal(cleanFileSize, 'padding leftovers not removed');
}

async function removeID3TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const mp3 = new MP3();
	const result = await mp3.removeTags(file.name, {id3v1: true, id3v2: true});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	const empty = await mp3.removeTags(file.name, {id3v1: true, id3v2: false});
	file.removeCallback();
	should().exist(result);
	should().not.exist(empty);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(true, 'result should report removed id3v1 tag (id3v2&1.remove)');
	expect(result.id3v2).to.equal(true, 'result should report removed id3v2 tag (id3v2&1.remove)');
	expect(!!after.id3v1).to.equal(false, 'id3v1 tag should no longer exists (id3v2&1.remove)');
	expect(!!after.id3v2).to.equal(false, 'id3v2 tag should no longer exists (id3v2&1.remove)');
	return compareRemovalAudio(before, after);
}

export async function testRemoveTags(filename: string): Promise<void> {
	const mp3 = new MP3();
	const before = await mp3.read(filename, {id3v1: true, id3v2: true, mpeg: true});
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
