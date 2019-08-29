import fse from 'fs-extra';
import {ID3v2Reader} from './id3v2.reader';
import {ID3v2Writer} from './id3v2.writer';
import {IID3V2} from './id3v2.types';
import {fileRangeToBuffer} from '../common/utils';
import {Readable} from 'stream';
import {updateFile} from '../common/update-file';
import {ITagID} from '../common/types';
import {rawHeaderOffSet} from '../mp3/mp3.mpeg.frame';
import {checkID3v2} from './id3v2.check';
import {simplifyTag} from './id3v2.simplify';
import {FileWriterStream} from '../common/stream-writer-file';
import {writeRawFrames} from './frames/id3v2.frame.write';
import {buildID3v2} from './frames/id3v2.frame.read';

/**
 * Class for
 * - reading ID3v2
 * - writing ID3v2
 * - removing ID3v2
 *
 * Basic usage example:
 *
 * ```ts
 * [[include:snippet_id3v2-read.ts]]
 * ```
 */
export class ID3v2 {

	/**
	 * Checks an ID3v2 Tag for warnings
	 * @param tag the ID3v2 object to check
	 * @return a list returning warning messages
	 */
	static check(tag: IID3V2.Tag): Array<IID3V2.Warning> {
		return checkID3v2(tag);
	}

	/**
	 * Checks an ID3v2 Tag for warnings
	 * @param tag the ID3v2 object to simplify
	 * @param dropIDsList a list of frame IDs to ignore, eg. 'APIC'
	 * @return a simplified ID3v2 object
	 */
	static simplify(tag: IID3V2.Tag, dropIDsList?: Array<string>): IID3V2.TagSimplified {
		return simplifyTag(tag, dropIDsList);
	}

	/**
	 * Reads a filename & returns ID3v2 tag as Object
	 * @param filename the file to read
	 * @return a object returning i3v2 tag if found
	 */
	async read(filename: string): Promise<IID3V2.Tag | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.read(filename);
		if (tag) {
			return await buildID3v2(tag);
		}
	}

	/**
	 * Reads a stream & returns ID3v2 tag as Object
	 * @param stream the stream to read (NodeJS.stream.Readable)
	 * @return a object returning i3v2 tag if found
	 */
	async readStream(stream: Readable): Promise<IID3V2.Tag | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.readStream(stream);
		if (tag) {
			return await buildID3v2(tag);
		}
	}

	/**
	 * Reads a filename & returns ID3v2 tag as Buffer
	 * @param filename the file to read
	 * @return a object returning i3v2 tag if any found
	 */
	async readRaw(filename: string): Promise<Buffer | undefined> {
		const reader = new ID3v2Reader();
		const tag = await reader.read(filename);
		if (tag) {
			return await fileRangeToBuffer(filename, tag.start, tag.end);
		}
	}

	/**
	 * Removes ID3v2 Tag from a file with given options
	 * @param filename the file to read
	 * @param options remove options
	 * @return true if tag has been found and removed
	 */
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

	/**
	 * Writes ID3v2 Tag from a Builder object with given options
	 * @param filename the file to write
	 * @param options write options
	 */
	async writeBuilder(filename: string, builder: IID3V2.Builder, options: IID3V2.WriteOptions): Promise<void> {
		await this.write(filename, {frames: builder.buildFrames()}, builder.version(), builder.rev(), options);
	}

	/**
	 * Writes ID3v2 Tag from an ID3v2 object with given options
	 * @param filename the file to write
	 * @param tag the ID3v2 object to write
	 * @param version the ID3v2.v version to write
	 * @param rev the ID3v2.v.r rev version to write
	 * @param options write options
	 */
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
		const raw_frames = await writeRawFrames(tag.frames, head, options.defaultEncoding);
		const exists = await fse.pathExists(filename);
		if (!exists) {
			await this.writeTag(filename, raw_frames, head);
		} else {
			await this.replaceTag(filename, raw_frames, head, opts);
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

}
