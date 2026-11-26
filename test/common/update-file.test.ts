import tmp from 'tmp';
import fse from 'fs-extra';
import { describe, expect, it } from '@jest/globals';

import { updateFile } from '../../src/lib/common/update-file.js';

// removing the temp file inside process() makes the final rename fail with ENOENT,
// which is the moment the original must still be on disk
async function failingUpdate(filename: string, keepBackup: boolean): Promise<void> {
	const tmpFile = `${filename}.tempmp3`;
	await expect(
		updateFile(filename, { id3v2: true, id3v1: true }, keepBackup, _layout => true, async (_layout, _fileWriter) => {
			await fse.remove(tmpFile);
		})
	).rejects.toThrow();
}

describe('updateFile', () => {
	it('should keep an existing .bak file untouched with keepBackup=true', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await fse.copyFile(file.name, bakFile);
			const stat = await fse.stat(bakFile);
			await updateFile(file.name, { id3v2: true, id3v1: true }, true, _layout => true, async (_layout, _filewriter) => {
				// nop
			});
			expect(await fse.pathExists(bakFile)).toBe(true);
			const stat2 = await fse.stat(bakFile);
			expect(stat2.mtimeMs).toBe(stat.mtimeMs);
			expect(stat2.ctimeMs).toBe(stat.ctimeMs);
			await fse.remove(bakFile);
		} catch (error) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(error);
		}
	});
	it('should create a .bak file if not existing with keepBackup=true', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await updateFile(file.name, { id3v2: true, id3v1: true }, true, _layout => true, async (_layout, _filewriter) => {
				// nop
			});
			expect(await fse.pathExists(bakFile)).toBe(true);
			await fse.remove(bakFile);
		} catch (error) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(error);
		}
	});
	it('should not create a .bak file if not existing with keepBackup=false', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await updateFile(file.name, { id3v2: true, id3v1: true }, false, _layout => true, async (_layout, _filewriter) => {
				// nop
			});
			expect(await fse.pathExists(bakFile)).toBe(false);
		} catch (error) {
			file.removeCallback();
			return Promise.reject(error);
		}
	});
	it('should ignore an existing .bak file with keepBackup=false', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await fse.copyFile(file.name, bakFile);
			await updateFile(file.name, { id3v2: true, id3v1: true }, false, _layout => true, async (_layout, _filewriter) => {
				// nop
			});
			expect(await fse.pathExists(bakFile)).toBe(true);
			await fse.remove(bakFile);
		} catch (error) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(error);
		}
	});
	it('keeps the original when the final rename fails and a .bak already exists', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await fse.writeFile(file.name, 'ORIGINAL AUDIO');
			await fse.writeFile(bakFile, 'OLD BACKUP');
			await failingUpdate(file.name, true);
			expect(await fse.pathExists(file.name)).toBe(true);
			expect(await fse.readFile(file.name, 'utf8')).toBe('ORIGINAL AUDIO');
			expect(await fse.readFile(bakFile, 'utf8')).toBe('OLD BACKUP');
		} finally {
			file.removeCallback();
			await fse.remove(bakFile);
		}
	});

	it('keeps the original when the final rename fails with keepBackup=false', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await fse.writeFile(file.name, 'ORIGINAL AUDIO');
			await failingUpdate(file.name, false);
			expect(await fse.pathExists(file.name)).toBe(true);
			expect(await fse.readFile(file.name, 'utf8')).toBe('ORIGINAL AUDIO');
			expect(await fse.pathExists(bakFile)).toBe(false);
		} finally {
			file.removeCallback();
			await fse.remove(bakFile);
		}
	});

	it('keeps the original when the final rename fails and no .bak exists', async () => {
		const file = tmp.fileSync();
		const bakFile = `${file.name}.bak`;
		try {
			await fse.writeFile(file.name, 'ORIGINAL AUDIO');
			await failingUpdate(file.name, true);
			expect(await fse.pathExists(file.name)).toBe(true);
			expect(await fse.readFile(file.name, 'utf8')).toBe('ORIGINAL AUDIO');
		} finally {
			file.removeCallback();
			await fse.remove(bakFile);
		}
	});

	it('should still clean up the .tempmp3 file when close() also rejects due to a write error', async () => {
		const file = tmp.fileSync();
		const tmpFile = `${file.name}.tempmp3`;
		try {
			await expect(
				updateFile(file.name, { id3v2: true, id3v1: true }, true, _layout => true, async (_layout, fileWriter) => {
					(fileWriter as any).wstream.emit('error', new Error('boom'));
					throw new Error('boom');
				})
			).rejects.toThrow('boom');
			expect(await fse.pathExists(tmpFile)).toBe(false);
		} finally {
			file.removeCallback();
		}
	});
});
