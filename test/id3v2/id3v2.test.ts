import fse from 'fs-extra';
import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types';
import { collectTestFilesSync } from '../common/common';
import { testLoadSaveCompare } from './id3v2.load-save-compare';
import { testLoadSaveSpec } from './id3v2.spec';
import { ID3v2TestDirectories, ID3v2TestPath } from './id3v2.config';
import tmp from 'tmp';

const testSingleFile: string | undefined = undefined;

describe('ID3v2', () => {
	it('should reject the promise not send an unhandled stream error', async () => {
		const id3 = new ID3v2();
		await expect(id3.read('notexistingfilename')).rejects.toThrow();
	});

	it('should apply padding when writing a new file', async () => {
		const file = tmp.fileSync();
		const id3 = new ID3v2();
		const tag: IID3V2.ID3v2Tag = {
			frames: [{
				id: 'TIT2',
				value: {
					text: 'Test Title'
				}
			}]
		};
		await id3.write(file.name, tag, 3, 0, { paddingSize: 0 });
		const stat1 = await fse.stat(file.name);
		const paddingSize = 200;
		await id3.write(file.name, tag, 3, 0, { paddingSize });
		const stat2 = await fse.stat(file.name);
		expect(stat2.size).toBe(stat1.size + paddingSize);
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
