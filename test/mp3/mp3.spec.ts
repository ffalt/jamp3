import { compareID3v1Spec } from '../id3v1/id3v1.compare';
import { compareID3v2Spec } from '../id3v2/id3v2.spec';
import { MP3 } from '../../src/lib/mp3/mp3';
import { hasSpec } from '../common/common';

export async function testSpec(filename: string): Promise<void> {
	if (!(await hasSpec(filename))) {
		throw new Error('Testset incomplete, missing spec file');
	}
	const mp3 = new MP3();
	const result = await mp3.read(filename, { id3v1: true, id3v2: true });
	expect(result).toBeTruthy();
	if (!result) {
		return;
	}
	await compareID3v1Spec(filename, result.id3v1);
	await compareID3v2Spec(filename, result.id3v2);
}
