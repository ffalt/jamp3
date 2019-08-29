import {IID3V2} from '../id3v2.types';
import {ID3v2_FRAME_HEADER_LENGTHS} from '../id3v2.header.consts';
import * as zlib from 'zlib';
import {ITagID} from '../../..';
import {ID3v2Reader} from '../id3v2.reader';
import {matchFrame} from './id3v2.frame.match';
import {IEncoding} from '../../common/encodings';
import {BufferReader} from '../../common/buffer-reader';
import {removeUnsync} from './id3v2.frame.unsync';

async function processRawFrame(frame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<void> {
	if ((frame.formatFlags) && (frame.formatFlags.encrypted)) {
		// debug('processRawFrame', 'encrypted frame');
		return Promise.reject(Error('Frame Encryption currently not supported'));
	}
	if ((frame.formatFlags) && (frame.formatFlags.unsynchronised)) {
		// debug('processRawFrame', 'unsync frame', frame.id);
		frame.data = removeUnsync(frame.data);
	}
	if ((frame.formatFlags) && (frame.formatFlags.compressed)) {
		let data = frame.data;
		if (frame.formatFlags.compressed) {
			const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
			data = data.slice(sizebytes);
		}
		return new Promise<void>((resolve, reject) => {
			zlib.inflate(data, (err, result) => {
				if (!err && result) {
					frame.data = result;
					resolve();
				}
				zlib.gunzip(data, (err2, result2) => {
					if (!err2 && result2) {
						frame.data = result;
						resolve();
					}
					reject('Uncompressing frame failed');
				});
			});
		});
	} else if ((frame.formatFlags) && (frame.formatFlags.dataLengthIndicator)) {
		/*
		 p - Data length indicator
			 The data length indicator is the value one would write
			 as the 'Frame length' if all of the frame format flags were
			 zeroed, represented as a 32 bit synchsafe integer.
		 */
		frame.data = frame.data.slice(4);
	}
}

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

export async function readSubFrames(bin: Buffer, head: IID3V2.TagHeader): Promise<Array<IID3V2.Frame>> {
	const subtag: IID3V2.RawTag = {id: ITagID.ID3v2, head, frames: [], start: 0, end: 0};
	const reader = new ID3v2Reader();
	const buffer = await reader.readFrames(bin, subtag); // TODO: re-add rest buffer to parse
	const t = await buildID3v2(subtag);
	return t.frames;
}

export async function readID3v2Frame(rawFrame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<IID3V2.Frame> {
	const f = matchFrame(rawFrame.id);
	let groupId: number | undefined;
	if (rawFrame.formatFlags && rawFrame.formatFlags.grouping) {
		groupId = rawFrame.data[0];
		rawFrame.data = rawFrame.data.slice(1);
	}
	const frame: IID3V2.Frame = {
		id: rawFrame.id,
		head: {
			encoding: undefined,
			statusFlags: rawFrame.statusFlags,
			formatFlags: rawFrame.formatFlags,
			size: rawFrame.size
		},
		value: {}
	};
	let result: { value: IID3V2.FrameValue.Base, encoding?: IEncoding, subframes?: Array<IID3V2.Frame> } | undefined;
	try {
		await processRawFrame(rawFrame, head);
		const reader = new BufferReader(rawFrame.data);
		result = await f.impl.parse(reader, rawFrame, head);
		if (frame.head) {
			frame.head.encoding = result.encoding ? result.encoding.name : undefined;
		}
		frame.value = result.value || {bin: rawFrame.data};
		if (result.subframes) {
			frame.subframes = result.subframes;
		}
	} catch (e) {
		frame.invalid = e.toString();
		frame.value = {bin: rawFrame.data};
	}
	if (groupId) {
		frame.groupId = groupId;
	}
	frame.title = f.title;
	return frame;
}
