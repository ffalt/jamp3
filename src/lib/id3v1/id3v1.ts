import {ID3v1Reader} from './id3v1_reader';
import {ID3v1Writer} from './id3v1_writer';
import {IID3V1} from './id3v1__types';
import {Readable} from 'stream';
import fse from 'fs-extra';
import {ITagID} from '../..';
import {FileWriterStream} from '../common/streams';
import {updateFile} from '../common/update-file';

export class ID3v1 {

	async read(filename: string): Promise<IID3V1.Tag | undefined> {
		const reader = new ID3v1Reader();
		return await reader.read(filename);
	}

	async readStream(stream: Readable): Promise<IID3V1.Tag | undefined> {
		const reader = new ID3v1Reader();
		return await reader.readStream(stream);
	}

	private async writeTag(filename: string, tag: IID3V1.ID3v1Tag, version: number): Promise<void> {
		const stream = new FileWriterStream();
		await stream.open(filename);
		const writer = new ID3v1Writer();
		try {
			await writer.write(stream, tag, version);
		} catch (e) {
			await stream.close();
			return Promise.reject(e);
		}
		await stream.close();
	}

	private async replaceTag(filename: string, tag: IID3V1.ID3v1Tag, version: number, keepBackup: boolean): Promise<void> {
		const stat = await fse.stat(filename);
		await updateFile(filename, {id3v1: true}, keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
			let finish = stat.size;
			for (const t of layout.tags) {
				if (t.id === ITagID.ID3v1) {
					if (finish > t.start) {
						finish = t.start;
					}
				}
			}
			await fileWriter.copyRange(filename, 0, finish);
			const writer = new ID3v1Writer();
			await writer.write(fileWriter, tag, version);
		});
	}

	async remove(filename: string, opts: IID3V1.RemoveOptions): Promise<boolean> {
		const stat = await fse.stat(filename);
		let removed = false;
		await updateFile(filename, {id3v1: true}, !!opts.keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
			let finish = stat.size;
			for (const t of layout.tags) {
				if (t.id === ITagID.ID3v1) {
					removed = true;
					if (finish > t.start) {
						finish = t.start;
					}
				}
			}
			await fileWriter.copyRange(filename, 0, finish);
		});
		return removed;
	}

	async write(filename: string, tag: IID3V1.ID3v1Tag, version: number, opts: IID3V1.WriteOptions): Promise<void> {
		const exists = await fse.pathExists(filename);
		if (!exists) {
			await this.writeTag(filename, tag, version);
		} else {
			await this.replaceTag(filename, tag, version, !!opts.keepBackup);
		}
	}

}

