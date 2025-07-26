import { compareID3v2Save } from './id3v2.compare';
import { ID3v2 } from '../../src/lib/id3v2/id3v2';

export async function testLoadSaveCompare(filename: string): Promise<void> {
	const id3 = new ID3v2();
	let tag = await id3.read(filename);
	if (tag && tag.head && !tag.head.valid) {
		console.log('invalid id3v2 tag found', filename);
		tag = undefined;
	}
	expect(tag).toBeTruthy();
	if (!tag) {
		return;
	}
	expect(tag.head).toBeTruthy();
	await compareID3v2Save(filename, tag);
}
