import fse from 'fs-extra';
import {ID3v2Reader} from './id3v2_reader';
import {ID3v2Writer} from './id3v2_writer';
import {readID3v2Frame, writeToRawFrames} from './id3v2_frames';
import {FileWriterStream} from '../common/streams';
import {IID3V2} from './id3v2__types';
import {fileRangeToBuffer} from '../common/utils';
import {Readable} from 'stream';
import {updateFile} from '../common/update-file';
import {ID3v2Builder} from './id3v2_builder';
import {ITagID} from '../common/types';
import {rawHeaderOffSet} from '../mp3/mp3_frame';

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
		const stream = new FileWriterStream();
		await stream.open(filename);
		const writer = new ID3v2Writer();
		try {
			await writer.write(stream, frames, head, {paddingSize: 0});
		} catch (e) {
			await stream.close();
			return Promise.reject(e);
		}
		await stream.close();
	}

	private async replaceTag(filename: string, frames: Array<IID3V2.RawFrame>, head: IID3V2.TagHeader, options: IID3V2.WriteOptions): Promise<void> {
		await updateFile(filename, {id3v2: true, mpegQuick: true}, !!options.keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
			const writer = new ID3v2Writer();
			await writer.write(fileWriter, frames, head, options);
			let start = 0;
			let specEnd = 0;
			for (const tag of layout.tags) {
				if (tag.id === ITagID.ID3v2) {
					if (start < tag.end) {
						specEnd = (tag as IID3V2.RawTag).head.size + tag.start + 10 /*header itself*/;
						start = tag.end;
					}
				}
			}
			if (layout.frameheaders.length > 0) {
				const mediastart = rawHeaderOffSet(layout.frameheaders[0]);
				start = specEnd < mediastart ? specEnd : mediastart;
			} else {
				start = Math.max(start, specEnd);
			}
			await fileWriter.copyFrom(filename, start);
		});
	}

	async remove(filename: string, options: IID3V2.RemoveOptions): Promise<boolean> {
		let removed = false;
		await updateFile(filename, {id3v2: true, mpegQuick: true}, !!options.keepBackup, () => true, async (layout, fileWriter): Promise<void> => {
			let start = 0;
			let specEnd = 0;
			for (const tag of layout.tags) {
				if (tag.id === ITagID.ID3v2) {
					if (start < tag.end) {
						specEnd = (tag as IID3V2.RawTag).head.size + tag.start + 10 /*header itself*/;
						start = tag.end;
						removed = true;
					}
				}
			}
			if (layout.frameheaders.length > 0) {
				const mediastart = rawHeaderOffSet(layout.frameheaders[0]);
				start = specEnd < mediastart ? specEnd : mediastart;
			} else {
				start = Math.max(start, specEnd);
			}
			await fileWriter.copyFrom(filename, start);
		});
		return removed;
	}

	async writeBuilder(filename: string, builder: ID3v2Builder, options: IID3V2.WriteOptions): Promise<void> {
		await this.write(filename, {frames: builder.buildFrames()}, builder.version(), builder.rev(), options);
	}

	async write(filename: string, tag: IID3V2.ID3v2Tag, version: number, rev: number, options: IID3V2.WriteOptions): Promise<void> {
		if (typeof options !== 'object') {
			throw Error('Invalid options object, update your code'); // function api change
		}
		const opts = Object.assign({keepBackup: false, paddingSize: 100}, options);
		const head: IID3V2.TagHeader = {
			ver: version,
			rev: rev,
			size: 0,
			valid: true,
			flagBits: tag.head ? tag.head.flagBits : undefined
		};
		if (tag.head) {
			if (version === 4 && tag.head.v4) {
				head.v4 = tag.head.v4;
			}
			if (version === 3 && tag.head.v3) {
				head.v3 = tag.head.v3;
			}
			if (version <= 2 && tag.head.v2) {
				head.v2 = tag.head.v2;
			}
		}
		const raw_frames = await writeToRawFrames(tag.frames, head);
		const exists = await fse.pathExists(filename);
		if (!exists) {
			await this.writeTag(filename, raw_frames, head);
		} else {
			await this.replaceTag(filename, raw_frames, head, opts);
		}
	}
}
