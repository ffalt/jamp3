import path from 'node:path';
import { ID3v2TestDirectories, ID3v2TestPath } from '../id3v2/id3v2.config';
import { ID3v1TestDirectories, ID3v1TestPath } from '../id3v1/id3v1.config';
import { collectTestFilesSync } from '../common/common';
import { testQuickMPEG } from './mp3.quick-mpeg';
import { testLoadSaveCompare } from './mp3.load-save-compare';
import { testFrames } from './mp3.frames';
import { testRemoveTags } from './mp3.remove-tags';
import { IMP3TestDirectories, IMP3TestPath } from './mp3.config';
import { testSpec } from './mp3.spec';

const tests = [
	{ dirs: ID3v2TestDirectories, dir: ID3v2TestPath },
	{ dirs: ID3v1TestDirectories, dir: ID3v1TestPath },
	{ dirs: IMP3TestDirectories, dir: IMP3TestPath }
];

const testSingleFile: string | undefined = undefined; // 'v2.2-itunes81';

describe('MP3', () => {
	const roots: Array<[string, { root: string; files: Array<[string, string]> }]> = [];
	for (const test of tests) {
		roots.push([test.dir.split('data')[1], {
			root: test.dir,
			files: collectTestFilesSync(test.dirs, test.dir, testSingleFile).map(filename => [filename.slice(test.dir.length), filename])
		}]);
	}
	describe.each(roots)('MP3 of %s', (rootCase, root) => {
		describe.each(root.files)('%s', (name, filename) => {
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
	});
});
