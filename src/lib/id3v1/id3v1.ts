import { Readable } from 'node:stream';
import fse from 'fs-extra';

import { ID3v1Reader } from './id3v1.reader';
import { ID3v1Writer } from './id3v1.writer';
import { IID3V1 } from './id3v1.types';
import { ITagID } from '../common/types';
import { updateFile } from '../common/update-file';
import { FileWriterStream } from '../common/stream-writer-file';

/**
 * Class for
 * - reading ID3v1
 * - writing ID3v1
 * - removing ID3v1
 *
 * Basic usage example:
 *
 * {@includeCode ../../../examples/snippet_id3v1-read.ts}}
 */
export class ID3v1 {
	/**
	 * Reads a filename & returns ID3v1 tag as Object
	 * @param filename the file to read
	 * @return a object returning i3v1 tag if found
	 */
	async read(filename: string): Promise<IID3V1.Tag | undefined> {
		const reader = new ID3v1Reader();
		return await reader.read(filename);
	}

	/**
	 * Reads a stream & returns ID3v1 tag as Object
	 * @param stream the stream to read (NodeJS.stream.Readable)
	 * @return a object returning i3v1 tag if found
	 */
	async readStream(stream: Readable): Promise<IID3V1.Tag | undefined> {
		const reader = new ID3v1Reader();
		return await reader.readStream(stream);
	}

	/**
	 * Removes ID3v1 Tag from a file with given options
	 * @param filename the file to read
	 * @param options remove options
	 * @return true if tag has been found and removed
	 */
	async remove(filename: string, options: IID3V1.RemoveOptions): Promise<boolean> {
		const stat = await fse.stat(filename);
		let removed = false;
		await updateFile(filename, { id3v1: true }, !!options.keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
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

	/**
	 * Writes ID3v1 Tag from an ID3v1 object with given options
	 * @param filename the file to write
	 * @param tag the ID3v1 object to write
	 * @param version the ID3v1.v version to write
	 * @param options write options
	 */
	async write(filename: string, tag: IID3V1.ID3v1Tag, version: number, options: IID3V1.WriteOptions): Promise<void> {
		const exists = await fse.pathExists(filename);
		await (exists ? this.replaceTag(filename, tag, version, !!options.keepBackup) : this.writeTag(filename, tag, version));
	}

	private async writeTag(filename: string, tag: IID3V1.ID3v1Tag, version: number): Promise<void> {
		const stream = new FileWriterStream();
		await stream.open(filename);
		const writer = new ID3v1Writer();
		try {
			await writer.write(stream, tag, version);
		} catch (error) {
			await stream.close();
			return Promise.reject(error);
		}
		await stream.close();
	}

	private async replaceTag(filename: string, tag: IID3V1.ID3v1Tag, version: number, keepBackup: boolean): Promise<void> {
		const stat = await fse.stat(filename);
		await updateFile(filename, { id3v1: true }, keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
			let finish = stat.size;
			for (const t of layout.tags) {
				if (t.id === ITagID.ID3v1 && finish > t.start) {
					finish = t.start;
				}
			}
			await fileWriter.copyRange(filename, 0, finish);
			const writer = new ID3v1Writer();
			await writer.write(fileWriter, tag, version);
		});
	}
}
