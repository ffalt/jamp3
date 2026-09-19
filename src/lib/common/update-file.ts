import fse from 'fs-extra';

import { MP3Reader, MP3ReaderOptions } from '../mp3/mp3.reader.js';
import { FileWriterStream } from './stream-writer-file.js';
import { IMP3 } from '../mp3/mp3.types.js';

export async function updateFile(
	filename: string, options: MP3ReaderOptions, keepBackup: boolean,
	canProcess: (layout: IMP3.RawLayout) => boolean,
	process: (layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>
) {
	const reader = new MP3Reader();
	const layout = await reader.read(filename, options);
	if (!canProcess(layout)) {
		return;
	}
	const tmpFile = `${filename}.tempmp3`;
	const bakFile = `${filename}.bak`;
	const cleanupTmp = async () => {
		if (await fse.pathExists(tmpFile)) {
			await fse.remove(tmpFile);
		}
	};
	const fileWriterStream = new FileWriterStream();
	await fileWriterStream.open(tmpFile);
	let renamedOriginalToBackup = false;
	try {
		await process(layout, fileWriterStream);
		await fileWriterStream.close();
		const bakExists = await fse.pathExists(bakFile);
		if (keepBackup) {
			if (bakExists) {
				await fse.remove(filename);
			} else {
				await fse.rename(filename, bakFile);
				renamedOriginalToBackup = true;
			}
		} else if (!bakExists) {
			await fse.rename(filename, bakFile);
			renamedOriginalToBackup = true;
		}
		await fse.rename(tmpFile, filename);
		if (!keepBackup && !bakExists) {
			await fse.remove(bakFile);
		}
	} catch (error) {
		await fileWriterStream.close();
		if (renamedOriginalToBackup && !(await fse.pathExists(filename)) && await fse.pathExists(bakFile)) {
			await fse.rename(bakFile, filename);
		}
		await cleanupTmp();
		return Promise.reject(error);
	}
}
