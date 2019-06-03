import fse from 'fs-extra';
import {ID3v2Reader} from './id3v2_reader';
import {ID3v2Writer} from './id3v2_writer';
import {readID3v2Frame, writeToRawFrames} from './id3v2_frames';
import {FileWriterStream} from '../common/streams';
import {IID3V2} from './id3v2__types';
import {fileRangeToBuffer} from '../common/utils';
import {Readable} from 'stream';
import {updateFile} from '../common/update-file';
import {ITagID} from '../..';

export async function buildID3v2(tag: IID3V2.RawTag): Promise<IID3V2.Tag> {
	const frames: Array<IID3V2.Frame> = [];
	for (const frame of tag.frames) {
		const f = await readID3v2Frame(frame, tag.head);
		frames.push(f);
	}
	return {
		id: tag.id,
		start: tag.start,
		end: tag.end,
		head: tag.head,
		frames: frames
	};
}

export class ID3v2 {

	async read(filename: string): Promise<IID3V2.Tag | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.read(filename);
		if (tag) {
			return await buildID3v2(tag);
		}
	}

	async readStream(stream: Readable): Promise<IID3V2.Tag | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.readStream(stream);
		if (tag) {
			return await buildID3v2(tag);
		}
	}

	async extractRaw(filename: string): Promise<Buffer | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.read(filename);
		if (tag) {
			return await fileRangeToBuffer(filename, tag.start, tag.end);
		}
	}

	private async writeTag(filename: string, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader): Promise<void> {
		// debug('writing tag to new file', filename);
		const stream = new FileWriterStream();
		await stream.open(filename);
		const writer = new ID3v2Writer();
		try {
			await writer.write(stream, frames, head);
		} catch (e) {
			await stream.close();
			return Promise.reject(e);
		}
		await stream.close();
	}

	private async replaceTag(filename: string, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader, keepBackup: boolean): Promise<void> {
		await updateFile(filename, keepBackup, async (stat, layout, fileWriter): Promise<void> => {
			const writer = new ID3v2Writer();
			await writer.write(fileWriter, frames, head);
			let start = 0;
			for (const tag of layout.tags) {
				if (tag.id === ITagID.ID3v2) {
					if (start < tag.end) {
						start = tag.end;
					}
				}
			}
			await fileWriter.copyFrom(filename, start);
		});
	}

	async write(filename: string, tag: IID3V2.Tag, version: number, rev: number, keepBackup?: boolean): Promise<void> {
		// TODO: ensure header flags are valid in id3v2.${version}
		const head: IID3V2.TagHeader = {
			ver: version,
			rev: rev,
			size: 0,
			valid: true,
			syncSaveSize: tag.head ? tag.head.syncSaveSize : undefined,
			flags: tag.head ? tag.head.flags : undefined,
			flagBits: tag.head ? tag.head.flagBits : undefined,
			extended: tag.head ? tag.head.extended : undefined
		};
		const raw_frames = await writeToRawFrames(tag.frames, head);
		const exists = await fse.pathExists(filename);
		if (!exists) {
			await this.writeTag(filename, raw_frames, head);
		} else {
			await this.replaceTag(filename, raw_frames, head, !!keepBackup);
		}
	}
}
