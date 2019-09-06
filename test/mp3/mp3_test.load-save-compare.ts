import Debug from 'debug';

import {compareID3v1Save} from '../id3v1/id3v1_test.compare';
import {compareID3v2Save} from '../id3v2/id3v2_test.compare';
import {MP3} from '../../src/lib/mp3/mp3';

const debug = Debug('mp3-test');

export async function testLoadSaveCompare(filename: string): Promise<void> {
	debug('LoadSaveCompare', 'loading', filename);
	const mp3 = new MP3();
	const result = await mp3.read(filename, {id3v1: true, id3v2: true});
	expect(result).toBeTruthy();
	if (!result) {
		return;
	}
	if (result.id3v1) {
		await compareID3v1Save(filename, result.id3v1);
	}
	if (result.id3v2 && result.id3v2.head && result.id3v2.head.valid) {
		await compareID3v2Save(filename, result.id3v2);
	}
}
