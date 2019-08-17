import {IID3V2} from './id3v2__types';
import {readID3v2Frame} from './id3v2_frames';

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
