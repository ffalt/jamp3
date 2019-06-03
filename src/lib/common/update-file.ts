import {MP3Reader} from '../mp3/mp3_reader';
import fse from 'fs-extra';
import {FileWriterStream} from './streams';
import {IMP3} from '../..';
import fs from 'fs';

export async function updateFile(filename: string, keepBackup: boolean, process: (stat: fs.Stats, layout: IMP3.RawLayout, fileWriter: FileWriterStream) => Promise<void>) {
	const reader = new MP3Reader();
	const stat = await fse.stat(filename);
	const readerOpts = {streamSize: stat.size, id3v1: true, id3v2: true, detectDuplicateID3v2: true};
	const layout = await reader.read(filename, readerOpts);
	let exists = await fse.pathExists(filename + '.tempmp3');
	if (exists) {
		await fse.remove(filename + '.tempmp3');
	}
	const fileWriterStream = new FileWriterStream();
	await fileWriterStream.open(filename + '.tempmp3');
	try {
		await process(stat, layout, fileWriterStream);
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
