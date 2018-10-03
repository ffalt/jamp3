import {expect, should, use} from 'chai';
import {describe, it} from 'mocha';
import {ID3v1} from '../../src/lib/id3v1/id3v1';
import chaiExclude = require('chai-exclude');
import Debug from 'debug';
import {compareID3v1Save, compareID3v1Spec} from './id3v1compare';
import {ID3v1TestDirectories, ID3v1TestPath} from './id3v1config';
import {collectTestFiles} from '../common/common';
import {fileExists} from '../../src/lib/common/utils';

const debug = Debug('id3v1-test');

use(chaiExclude);

const testSingleFile: string | undefined = undefined;

// const testSingleFile = 'testset-1/id3v1_214_genre_F';

async function loadSaveSpec(filename: string): Promise<void> {
	debug('loading', filename);
	const id3 = new ID3v1();
	const tag = await id3.read(filename);
	await compareID3v1Spec(filename, tag);
}

async function loadSaveCompare(filename: string): Promise<void> {
	debug('loading', filename);
	const id3 = new ID3v1();
	const tag = await id3.read(filename);
	if (!tag) {
		console.log('No v1 tag found', filename);
		return;
	}
	should().exist(tag);
	await compareID3v1Save(filename, tag);
}

describe('ID3v1', () => {
	const files: Array<string> = collectTestFiles(ID3v1TestDirectories, ID3v1TestPath, testSingleFile);
	for (const filename of files) {
		describe(filename.slice(ID3v1TestPath.length), () => {
			it('should load & save & compare', async () => {
				await loadSaveCompare(filename);
			});
			it('should load & compare to spec', async () => {
				const exists = await fileExists(filename + '.spec.json');
				if (exists) {
					await loadSaveSpec(filename);
				}
			});
		});
	}
});

