import {use} from 'chai';
import {describe, it, run} from 'mocha';
import chaiExclude from 'chai-exclude';
import path from 'path';
import {MP3} from '../../src';
import {ID3v2TestDirectories, ID3v2TestPath} from '../id3v2/id3v2_test_config';
import {ID3v1TestDirectories, ID3v1TestPath} from '../id3v1/id3v1_test_config';
import {collectTestFiles} from '../common/common';
import {testQuickMPEG} from './mp3_test_quick-mpeg';
import {testLoadSaveCompare} from './mp3_test_load-save-compare';
import {testFrames} from './mp3_test_frames';
import {testRemoveTags} from './mp3_test_remove-tags';
import {IMP3TestDirectories, IMP3TestPath} from './mp3_test_config';
import {testSpec} from './mp3_test_spec';

const tests = [
	{dirs: ID3v2TestDirectories, dir: ID3v2TestPath},
	{dirs: ID3v1TestDirectories, dir: ID3v1TestPath},
	{dirs: IMP3TestDirectories, dir: IMP3TestPath}
];

const testSingleFile: string | undefined =
	undefined;
// 'mpeg20-xing';

use(chaiExclude);

describe('MP3', async () => {
	const roots: Array<{ root: string, files: Array<string> }> = [];
	for (const test of tests) {
		roots.push({root: test.dir, files: await collectTestFiles(test.dirs, test.dir, testSingleFile)});
	}
	for (const root of roots) {
		describe(root.root, () => {
			for (const filename of root.files) {
				describe(filename.slice(root.root.length), () => {
					it('should load & compare to spec', async () => {
						await testSpec(filename);
					});
					it('should load tags & save tags & compare tags', async () => {
						await testLoadSaveCompare(filename);
					});
					if (path.extname(filename) !== '.id3') {
						it('should read mpeg frames', async () => {
							await testFrames(filename);
						}).timeout(200000);
						it('should read mpeg more quick info', async () => {
							await testQuickMPEG(filename);
						}).timeout(10000);
						it('should remove tags', async () => {
							await testRemoveTags(filename);
						}).timeout(10000);
					}
				});
			}
		});
	}
	run(); // https://github.com/mochajs/mocha/issues/2221#issuecomment-214636042
});

