import {MP3Reader, MP3ReaderOptions} from '../mp3/mp3_reader';
import fse from 'fs-extra';
import {FileWriterStream} from './streams';
import {IMP3} from '../..';

export async function updateFile(filename: string, opts: MP3ReaderOptions, keepBackup: boolean, process: (layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>) {
	const reader = new MP3Reader();
	const layout = await reader.read(filename, opts);
	let exists = await fse.pathExists(filename + '.tempmp3');
	if (exists) {
		await fse.remove(filename + '.tempmp3');
	}
	const fileWriterStream = new FileWriterStream();
	await fileWriterStream.open(filename + '.tempmp3');
	try {
		await process(layout, fileWriterStream);
	} catch (e) {
		await fileWriterStream.close();
		return Promise.reject(e);
	}
	await fileWriterStream.close();
	exists = await fse.pathExists(filename + '.bak');
	if (keepBackup) {
		if (!exists) {
			await fse.rename(filename, filename + '.bak');
		} else {
			// we have already a .bak which will be not touched
			await fse.remove(filename);
		}
	} else {
		if (exists) {
			await fse.remove(filename + '.bak');
		}
		await fse.rename(filename, filename + '.bak');
	}
	await fse.rename(filename + '.tempmp3', filename);
	if (!keepBackup) {
		await fse.remove(filename + '.bak');
	}
}
