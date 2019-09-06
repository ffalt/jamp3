import {ID3v2} from '../../src/lib/id3v2/id3v2';
import {collectTestFilesSync} from '../common/common';
import {testLoadSaveCompare} from './id3v2_test.load-save-compare';
import {testLoadSaveSpec} from './id3v2_test.spec';
import {ID3v2TestDirectories, ID3v2TestPath} from './id3v2_test.config';

const testSingleFile: string | undefined = undefined;

describe('ID3v2', () => {
	it('should reject the promise not send an unhandled stream error', async () => {
		const id3 = new ID3v2();
		await expect(id3.read('notexistingfilename')).rejects.toThrow();
	});
	const files: Array<string> = collectTestFilesSync(ID3v2TestDirectories, ID3v2TestPath, testSingleFile);
	for (const file of files) {
		describe('ID3v2: ' + file.slice(ID3v2TestPath.length), () => {
			it('should load & save & compare', async () => {
				await testLoadSaveCompare(file);
			});
			it('should load & compare to spec', async () => {
				await testLoadSaveSpec(file);
			});
		});
	}
});

