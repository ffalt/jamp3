import {expect, should, use} from 'chai';
import 'mocha';
import {ID3v2} from '../../src/lib/id3v2/id3v2';
import chaiExclude = require('chai-exclude');
import Debug from 'debug';
import {compareID3v2Spec} from './id3v2spec';
import {compareID3v2Save} from './id3v2compare';
import {ID3v2TestDirectories, ID3v2TestPath} from './id3v2config';
import {collectTestFiles} from '../common/common';
import {fileExists, fileWrite} from '../../src/lib/common/utils';

const debug = Debug('id3v2-test');

use(chaiExclude);

const id3 = new ID3v2();

const testSingleFile: string | undefined = undefined;
// const testSingleFile = '22TCP';

async function loadSaveSpec(filename: string): Promise<void> {
	debug('loadSaveSpec', 'loading', filename);
	let tag = await id3.read(filename);
	if (tag && !tag.head.valid) {
		console.log('invalid id3v2 tag found', filename);
		tag = undefined;
	}
	should().exist(tag);
	if (!tag) {
		return;
	}
	await compareID3v2Spec(filename, tag);
}

async function loadSaveCompare(filename: string): Promise<void> {
	debug('id3v2test', 'loading', filename);
	let tag = await id3.read(filename);
	if (tag && !tag.head.valid) {
		console.log('invalid id3v2 tag found', filename);
		tag = undefined;
	}
	should().exist(tag);
	if (!tag) {
		return;
	}
	await compareID3v2Save(filename, tag);
}

describe('ID3v2', () => {
	const files: Array<string> = collectTestFiles(ID3v2TestDirectories, ID3v2TestPath, testSingleFile);
	files.forEach(file => {
		describe(file.slice(ID3v2TestPath.length), () => {
			it('should load & save & compare', async () => {
				await loadSaveCompare(file);
			});
			it('should load & compare to spec', async () => {
				const exists = await fileExists(file + '.spec.json');
				if (exists) {
					await loadSaveSpec(file);
				}
			});
		});
	});

});

