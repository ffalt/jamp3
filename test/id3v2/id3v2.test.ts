import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { collectTestFilesSync } from '../common/common';
import { testLoadSaveCompare } from './id3v2.load-save-compare';
import { testLoadSaveSpec } from './id3v2.spec';
import { ID3v2TestDirectories, ID3v2TestPath } from './id3v2.config';

const testSingleFile: string | undefined = undefined;

describe('ID3v2', () => {
	it('should reject the promise not send an unhandled stream error', async () => {
		const id3 = new ID3v2();
		await expect(id3.read('notexistingfilename')).rejects.toThrow();
	});
	const files: Array<[string, string]> = collectTestFilesSync(ID3v2TestDirectories, ID3v2TestPath, testSingleFile)
		.map(filename => [filename.slice(ID3v2TestPath.length), filename]);
	describe.each(files)('ID3v2: %s', (testName, filename) => {
		it('should load & save & compare', async () => {
			await testLoadSaveCompare(filename);
		});
		it('should load & compare to spec', async () => {
			await testLoadSaveSpec(filename);
		});
	});
});
