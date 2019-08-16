import {MP3Reader, MP3ReaderOptions} from '../mp3/mp3_reader';
import fse from 'fs-extra';
import {FileWriterStream} from './streams';
import {IMP3} from '../..';

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
	const tmpFile = filename + '.tempmp3';
	const bakFile = filename + '.bak';
	let exists = await fse.pathExists(tmpFile);
	if (exists) {
		await fse.remove(tmpFile);
	}
	const fileWriterStream = new FileWriterStream();
	await fileWriterStream.open(tmpFile);
	try {
		await process(layout, fileWriterStream);
	} catch (e) {
		await fileWriterStream.close();
		return Promise.reject(e);
	}
	await fileWriterStream.close();
	exists = await fse.pathExists(bakFile);
	if (keepBackup) {
		if (!exists) {
			await fse.rename(filename, bakFile);
		} else {
			// we have already a .bak which will be not touched
			await fse.remove(filename);
		}
	} else {
		if (exists) {
			await fse.remove(bakFile);
		}
		await fse.rename(filename, bakFile);
	}
	await fse.rename(tmpFile, filename);
	if (!keepBackup) {
		await fse.remove(bakFile);
	}
}
