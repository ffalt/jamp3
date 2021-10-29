import {updateFile} from '../../src/lib/common/update-file';
import tmp from 'tmp';
import fse from 'fs-extra';

describe('updateFile', () => {
	it('should keep an existing .bak file untouched with keepBackup=true', async () => {
		const file = tmp.fileSync();
		const bakFile = file.name + '.bak';
		try {
			await fse.copyFile(file.name, bakFile);
			const stat = await fse.stat(bakFile);
			await updateFile(file.name, {id3v2: true, id3v1: true}, true, layout => true,
				async (layout, filewriter) => {

				});
			expect(await fse.pathExists(bakFile)).toBe(true);
			const stat2 = await fse.stat(bakFile);
			expect(stat2.mtimeMs).toBe(stat.mtimeMs);
			expect(stat2.ctimeMs).toBe(stat.ctimeMs);
			await fse.remove(bakFile);
		} catch (e: any) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(e);
		}
	});
	it('should create a .bak file if not existing with keepBackup=true', async () => {
		const file = tmp.fileSync();
		const bakFile = file.name + '.bak';
		try {
			await updateFile(file.name, {id3v2: true, id3v1: true}, true, layout => true,
				async (layout, filewriter) => {

				});
			expect(await fse.pathExists(bakFile)).toBe(true);
			await fse.remove(bakFile);
		} catch (e: any) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(e);
		}
	});
	it('should not create a .bak file if not existing with keepBackup=false', async () => {
		const file = tmp.fileSync();
		const bakFile = file.name + '.bak';
		try {
			await updateFile(file.name, {id3v2: true, id3v1: true}, false, layout => true,
				async (layout, filewriter) => {

				});
			expect(await fse.pathExists(bakFile)).toBe(false);
		} catch (e: any) {
			file.removeCallback();
			return Promise.reject(e);
		}
	});
	it('should ignore an existing .bak file with keepBackup=false', async () => {
		const file = tmp.fileSync();
		const bakFile = file.name + '.bak';
		try {
			await fse.copyFile(file.name, bakFile);
			await updateFile(file.name, {id3v2: true, id3v1: true}, false, layout => true,
				async (layout, filewriter) => {

				});
			expect(await fse.pathExists(bakFile)).toBe(true);
			await fse.remove(bakFile);
		} catch (e: any) {
			file.removeCallback();
			await fse.remove(bakFile);
			return Promise.reject(e);
		}
	});
});
