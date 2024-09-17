import path from 'path';
import {ID3v2TestDirectories, ID3v2TestPath} from '../id3v2/id3v2_test.config';
import {ID3v1TestDirectories, ID3v1TestPath} from '../id3v1/id3v1_test.config';
import {collectTestFilesSync} from '../common/common';
import {testQuickMPEG} from './mp3_test.quick-mpeg';
import {testLoadSaveCompare} from './mp3_test.load-save-compare';
import {testFrames} from './mp3_test.frames';
import {testRemoveTags} from './mp3_test.remove-tags';
import {IMP3TestDirectories, IMP3TestPath} from './mp3_test.config';
import {testSpec} from './mp3_test_spec';

const tests = [
	{dirs: ID3v2TestDirectories, dir: ID3v2TestPath},
	{dirs: ID3v1TestDirectories, dir: ID3v1TestPath},
	{dirs: IMP3TestDirectories, dir: IMP3TestPath}
];

const testSingleFile: string | undefined =
	undefined;
// 'v2.2-itunes81';

describe('MP3', () => {
	const roots: Array<{ root: string, files: Array<string> }> = [];
	for (const test of tests) {
		roots.push({root: test.dir, files: collectTestFilesSync(test.dirs, test.dir, testSingleFile)});
	}
	for (const root of roots) {
		describe('MP3: ' + root.root, () => {
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
						});
						it('should read mpeg more quick info', async () => {
							await testQuickMPEG(filename);
						});
						it('should remove tags', async () => {
							await testRemoveTags(filename);
						});
					}
				});
			}
		});
	}
});

