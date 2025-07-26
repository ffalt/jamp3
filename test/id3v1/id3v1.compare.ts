import fse from 'fs-extra';
import tmp from 'tmp';

import { ID3v1 } from '../../src/lib/id3v1/id3v1';
import { IID3V1 } from '../../src/lib/id3v1/id3v1.types';
import { ITagID } from '../../src/lib/common/types';
import { loadSpec } from '../common/common';

async function compareTags(a: IID3V1.Tag, b: IID3V1.Tag): Promise<void> {
	expect(b.version).toBe(a.version);
	expect(b.value).toEqual(a.value);
}

export async function compareID3v1Spec(filename: string, tag: IID3V1.Tag | undefined): Promise<void> {
	const spec = await loadSpec(filename);
	if (!spec || !spec.id3v1) {
		expect(tag).toBeUndefined(); // 'Missing ID3v1 spec ' + JSON.stringify({id3v1: tag}));
		return;
	}
	if (!tag && spec.id3v1.fail) {
		return;
	}
	expect(tag).toBeTruthy();
	if (!tag) {
		return;
	}
	expect(tag.value).toEqual(spec.id3v1.value);
	expect(tag.version).toBe(spec.id3v1.version); // 'wrong id3v1 version');
}

const mockTag: IID3V1.Tag = {
	id: ITagID.ID3v1,
	start: 0,
	end: 0,
	version: 1,
	value: {
		title: 'TITLETITEL',
		artist: 'ARTISTARTIST',
		comment: 'COMMENT',
		album: 'ALBUM',
		genreIndex: 1,
		year: 'YEAR',
		track: 99
	}
};

export async function compareID3v1Save(filename: string, tag: IID3V1.Tag): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	try {
		const id3 = new ID3v1();
		await id3.write(file.name, tag.value, tag.version || 0, { keepBackup: false });
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	try {
		const id3 = new ID3v1();
		const tag2 = await id3.read(file.name);
		expect(tag2).toBeTruthy();
		if (tag2) {
			await compareTags(tag, tag2);
		}
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}

export async function testOverWriteMock(filename: string): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copy(filename, file.name);
	try {
		const id3 = new ID3v1();
		await id3.write(file.name, mockTag.value, mockTag.version || 0, { keepBackup: false });
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	try {
		const id3 = new ID3v1();
		let tag2 = await id3.read(file.name);
		if (!tag2) {
			tag2 = await id3.read(file.name);
		}
		expect(tag2).toBeTruthy();
		if (tag2) {
			await compareTags(mockTag, tag2);
		}
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}
