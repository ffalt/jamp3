import fse from 'fs-extra';
import { Readable } from 'node:stream';

import { IMP3 } from './mp3.types';
import { MP3Reader, MP3ReaderOptions } from './mp3.reader';
import { IID3V2 } from '../id3v2/id3v2.types';
import { rawHeaderOffSet } from './mp3.mpeg.frame';
import { ITagID } from '../common/types';
import { updateFile } from '../common/update-file';
import { prepareResult } from './mp3.result';

/**
 * Class for
 * - reading ID3v1/2 and MP3 information
 * - removing ID3v1/2
 *
 * Basic usage example:
 *
 * ```ts
 * [[include:snippet_mp3-read.ts]]
 * ```
 */
export class MP3 {
	/**
	 * Reads a stream with given options
	 * @param stream the stream to read (NodeJS.stream.Readable)
	 * @param options define which information should be returned
	 * @param streamSize if known, provide the stream size to speed up duration calculation (otherwise stream may have to be parsed in full)
	 * @return a object returning parsed information
	 */
	async readStream(stream: Readable, options: IMP3.ReadOptions, streamSize?: number): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const layout = await reader.readStream(stream, { streamSize, ...options });
		return await prepareResult(options, layout);
	}

	/**
	 * Reads a file in given path with given options
	 * @param filename the file to read
	 * @param options define which information should be returned
	 * @return a object returning parsed information
	 */
	async read(filename: string, options: IMP3.ReadOptions): Promise<IMP3.Result> {
		const reader = new MP3Reader();
		const layout = await reader.read(filename, options);
		return await prepareResult(options, layout);
	}

	/**
	 * Removes ID3v1 and/or ID3v2 Tag from a file with given options
	 * @param filename the file to clean
	 * @param options define which tags should be removed
	 * @return a object returning which tags have been removed
	 */
	async removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<IMP3.RemoveResult | undefined> {
		const stat = await fse.stat(filename);
		const opts: MP3ReaderOptions = {
			streamSize: stat.size,
			id3v2: options.id3v2,
			detectDuplicateID3v2: options.id3v2,
			id3v1: options.id3v1,
			mpegQuick: options.id3v2
		};
		let id2v1removed = false;
		let id2v2removed = false;
		await updateFile(filename, opts, !!options.keepBackup,
			layout => {
				for (const tag of layout.tags) {
					if (options.id3v2 && tag.id === ITagID.ID3v2 && tag.end > 0) {
						return true;
					} else if (options.id3v1 && tag.id === ITagID.ID3v1 && tag.end === stat.size && tag.start < stat.size) {
						return true;
					}
				}
				return false;
			},
			async (layout, fileWriter): Promise<void> => {
				let start = 0;
				let finish = stat.size;
				let specEnd = 0;
				for (const tag of layout.tags) {
					if (tag.id === ITagID.ID3v2 && options.id3v2) {
						if (start < tag.end) {
							specEnd = (tag as IID3V2.RawTag).head.size + tag.start + 10; // 10: header itself
							start = tag.end;
							id2v2removed = true;
						}
					} else if (tag.id === ITagID.ID3v1 && options.id3v1 && tag.end === stat.size && finish > tag.start) {
						finish = tag.start;
						id2v1removed = true;
					}
				}
				if (options.id3v2) {
					start = layout.frameheaders.length > 0 ? rawHeaderOffSet(layout.frameheaders[0]) : Math.max(start, specEnd);
				}
				if (finish > start) {
					await fileWriter.copyRange(filename, start, finish);
				}
			});
		return id2v2removed || id2v1removed ? { id3v2: id2v2removed, id3v1: id2v1removed } : undefined;
	}
}
