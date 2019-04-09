import fse from 'fs-extra';
import {ID3v2Reader} from './id3v2_reader';
import {ID3v2Writer} from './id3v2_writer';
import {readID3v2Frame, writeToRawFrames} from './id3v2_frames';
import {FileWriterStream} from '../common/streams';
import {IID3V2} from './id3v2__types';
import {fileRangeToBuffer} from '../common/utils';
import {Readable} from 'stream';

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

	async replaceTag(filename: string, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader): Promise<void> {
		// debug('writing tag to existing file', filename);
		const reader = new ID3v2Reader();
		// debug('reading old tag for position', filename);
		const state_tag = await reader.read(filename);
		// debug('writing new tag to temp file', filename + '.tempmp3');
		let exists = await fse.pathExists(filename + '.tempmp3');
		if (exists) {
			await fse.remove(filename + '.tempmp3');
		}
		const state_stream = new FileWriterStream();
		await state_stream.open(filename + '.tempmp3');
		try {
			const writer = new ID3v2Writer();
			await writer.write(state_stream, frames, head);
			let start = 0;
			if (state_tag && state_tag.head && state_tag.head.size) {
				start = state_tag.head.size + 10;
			} // plus header 10
			// debug('copy from old file from position', start, filename);
			await state_stream.copyFrom(filename, start);
		} catch (e) {
			await state_stream.close();
			return Promise.reject(e);
		}
		await state_stream.close();
		exists = await fse.pathExists(filename + '.bak');
		if (exists) {
			await fse.remove(filename + '.bak');
		}
		await fse.rename(filename, filename + '.bak');
		await fse.rename(filename + '.tempmp3', filename);
		await fse.remove(filename + '.bak');
	}

	async write(filename: string, tag: IID3V2.Tag, version: number, rev: number): Promise<void> {
		// TODO: transform header to id3v2 version
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
			await this.replaceTag(filename, raw_frames, head);
		}
	}
}
