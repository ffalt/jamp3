import * as zlib from 'node:zlib';

import { IID3V2 } from '../id3v2.types';
import { WriterStream } from '../../common/stream-writer';
import { MemoryWriterStream } from '../../common/stream-writer-memory';
import { matchFrame } from './id3v2.frame.match';
import { ID3v2_FRAME_HEADER_LENGTHS } from '../id3v2.header.consts';
import { BufferUtils } from '../../common/buffer';
import { ascii, Encodings, IEncoding } from '../../common/encodings';
import { ensureID3v2FrameVersionDef } from './id3v2.frame.version';
import { Id3v2RawWriter } from '../id3v2.writer.raw';

export async function writeRawSubFrames(frames: Array<IID3V2.Frame>, stream: WriterStream, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<void> {
	const writer = new Id3v2RawWriter(stream, head, { paddingSize: 0 });
	const rawframes = await writeRawFrames(frames, head, defaultEncoding);
	for (const frame of rawframes) {
		await writer.writeFrame(frame);
	}
}

export async function writeRawFrames(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<Array<IID3V2.RawFrame>> {
	const result: Array<IID3V2.RawFrame> = [];
	for (const frame of frames) {
		const raw = await writeRawFrame(frame, head, defaultEncoding);
		result.push(raw);
	}
	return result;
}

async function writeRawFrame(frame: IID3V2.Frame, head: IID3V2.TagHeader, defaultEncoding?: string): Promise<IID3V2.RawFrame> {
	const frameHead: IID3V2.FrameHeader = frame.head || {
		size: 0,
		statusFlags: {},
		formatFlags: {}
	};
	let id = frame.id;
	let data: Buffer;
	if (frame.invalid) {
		const val = frame.value as IID3V2.FrameValue.Bin;
		if (!val.bin) {
			return Promise.reject(new Error('Invalid frame definition (trying to write a frame with parser error)'));
		}
		data = val.bin;
	} else {
		const stream = new MemoryWriterStream();
		const orgDef = matchFrame(frame.id);
		if (orgDef.versions.includes(head.ver)) {
			await orgDef.impl.write(frame, stream, head, defaultEncoding);
		} else {
			const toWriteFrameID = ensureID3v2FrameVersionDef(frame.id, head.ver);
			if (toWriteFrameID) {
				id = toWriteFrameID;
				const toWriteFrameDef = matchFrame(toWriteFrameID);
				await toWriteFrameDef.impl.write(frame, stream, head, defaultEncoding);
			} else {
				await orgDef.impl.write(frame, stream, head, defaultEncoding);
			}
		}
		data = stream.toBuffer();
		if ((frameHead.formatFlags) && (frameHead.formatFlags.compressed)) {
			const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
			const uncompressedStream = new MemoryWriterStream();
			await (sizebytes === 4 ? uncompressedStream.writeUInt4Byte(data.length) : uncompressedStream.writeUInt3Byte(data.length));
			data = BufferUtils.concatBuffer(uncompressedStream.toBuffer(), zlib.deflateSync(data));
		} else if ((frameHead.formatFlags) && (frameHead.formatFlags.dataLengthIndicator)) {
			const dataLengthStream = new MemoryWriterStream();
			await dataLengthStream.writeSyncSafeInt(data.length);
			data = BufferUtils.concatBuffer(dataLengthStream.toBuffer(), data);
		}
	}

	if (frameHead.formatFlags && frameHead.formatFlags.grouping) {
		if (frame.groupId === undefined) {
			return Promise.reject(new Error('Missing frame groupId but flag is set'));
		}
		const buf = BufferUtils.zeroBuffer(1);
		buf[0] = frame.groupId;
		data = BufferUtils.concatBuffer(buf, data);
	}

	return { id: id, start: 0, end: 0, size: data.length, data: data, statusFlags: frameHead.statusFlags || {}, formatFlags: frameHead.formatFlags || {} };
}

export function getWriteTextEncoding(frame: IID3V2.Frame, head: IID3V2.TagHeader, defaultEncoding?: string): IEncoding {
	let encoding = (frame.head ? frame.head.encoding : undefined) || defaultEncoding;
	if (!encoding || !Encodings[encoding]) {
		encoding = (head.ver === 4) ? 'utf8' : 'ucs2';
	}
	return Encodings[encoding] || ascii;
}
