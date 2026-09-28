import fse from 'fs-extra';
import tmp from 'tmp';
import { describe, expect, it } from '@jest/globals';

import { ID3v2 } from '../../src/lib/id3v2/id3v2.js';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { collectTestFilesSync } from '../common/common.js';
import { testLoadSaveCompare } from './id3v2.load-save-compare.js';
import { testLoadSaveSpec } from './id3v2.spec.js';
import { ID3v2TestDirectories, ID3v2TestPath } from './id3v2.config.js';

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

	describe('remove', () => {
		it('should remove an existing id3v2 tag', async () => {
			const file = tmp.fileSync();
			try {
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
				expect(await id3.read(file.name)).toBeTruthy();
				const removed = await id3.remove(file.name, { keepBackup: false });
				expect(removed).toBe(true);
				expect(await id3.read(file.name)).toBeUndefined();
				expect(await fse.pathExists(`${file.name}.bak`)).toBe(false);
				expect(await fse.pathExists(`${file.name}.tempmp3`)).toBe(false);
			} finally {
				file.removeCallback();
			}
		});

		it('should not touch the file when no id3v2 tag exists', async () => {
			const file = tmp.fileSync();
			try {
				const id3 = new ID3v2();
				const content = Buffer.from('a file without any id3v2 tag, just some bytes................');
				await fse.writeFile(file.name, content);
				const statBefore = await fse.stat(file.name);
				const removed = await id3.remove(file.name, { keepBackup: false });
				expect(removed).toBe(false);
				// the file must be left completely untouched: same content, no rewrite artifacts
				expect(await fse.readFile(file.name)).toEqual(content);
				const statAfter = await fse.stat(file.name);
				expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
				expect(await fse.pathExists(`${file.name}.bak`)).toBe(false);
				expect(await fse.pathExists(`${file.name}.tempmp3`)).toBe(false);
			} finally {
				file.removeCallback();
			}
		});
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
