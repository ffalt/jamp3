import {should} from 'chai';
import Debug from 'debug';

import {compareID3v1Spec} from '../id3v1/id3v1_test_compare';
import {compareID3v2Spec} from '../id3v2/id3v2_test_spec';
import {MP3} from '../../src/lib/mp3/mp3';
import {hasSpec} from '../common/common';

const debug = Debug('mp3-test');

export async function testSpec(filename: string): Promise<void> {
	if (!(await hasSpec(filename))) {
		throw new Error('Testset incomplete, missing spec file');
	}
	debug('Spec', 'loading', filename);
	const mp3 = new MP3();
	const result = await mp3.read(filename, {id3v1: true, id3v2: true});
	should().exist(result);
	if (!result) {
		return;
	}
	await compareID3v1Spec(filename, result.id3v1);
	await compareID3v2Spec(filename, result.id3v2);
}
