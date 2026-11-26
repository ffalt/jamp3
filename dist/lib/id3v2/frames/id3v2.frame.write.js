import * as zlib from 'node:zlib';
import { MemoryWriterStream } from '../../common/stream-writer-memory.js';
import { matchFrame } from './id3v2.frame.match.js';
import { ID3v2_FRAME_HEADER_LENGTHS } from '../id3v2.header.consts.js';
import { BufferUtils } from '../../common/buffer.js';
import { ascii, Encodings } from '../../common/encodings.js';
import { ensureID3v2FrameVersionDef } from './id3v2.frame.version.js';
import { Id3v2RawWriter } from '../id3v2.writer.raw.js';
import { applyUnsync } from './id3v2.frame.unsync.js';
export async function writeRawSubFrames(frames, stream, head, defaultEncoding) {
    const writer = new Id3v2RawWriter(stream, head, { paddingSize: 0 });
    const rawframes = await writeRawFrames(frames, head, defaultEncoding);
    for (const frame of rawframes) {
        await writer.writeFrame(frame);
    }
}
export async function writeRawFrames(frames, head, defaultEncoding) {
    const result = [];
    for (const frame of frames) {
        const raw = await writeRawFrame(frame, head, defaultEncoding);
        result.push(raw);
    }
    return result;
}
async function writeRawFrame(frame, head, defaultEncoding) {
    const frameHead = frame.head || {
        size: 0,
        statusFlags: {},
        formatFlags: {}
    };
    let id = frame.id;
    let data;
    let formatFlags = frameHead.formatFlags || {};
    if (frame.invalid) {
        const val = frame.value;
        if (!val.bin) {
            return Promise.reject(new Error('Invalid frame definition (trying to write a frame with parser error)'));
        }
        data = val.bin;
    }
    else {
        const stream = new MemoryWriterStream();
        const orgDef = matchFrame(frame.id);
        if (orgDef.versions.includes(head.ver)) {
            await orgDef.impl.write(frame, stream, head, defaultEncoding);
        }
        else {
            const toWriteFrameID = ensureID3v2FrameVersionDef(frame.id, head.ver);
            if (toWriteFrameID) {
                id = toWriteFrameID;
                const toWriteFrameDef = matchFrame(toWriteFrameID);
                await toWriteFrameDef.impl.write(frame, stream, head, defaultEncoding);
            }
            else {
                await orgDef.impl.write(frame, stream, head, defaultEncoding);
            }
        }
        data = stream.toBuffer();
        formatFlags = frameHead.formatFlags || {};
        if (formatFlags.compressed) {
            const deflated = zlib.deflateSync(data);
            const prefixStream = new MemoryWriterStream();
            if (head.ver === 4) {
                formatFlags = { ...formatFlags, dataLengthIndicator: true };
                await prefixStream.writeSyncSafeInt(data.length);
            }
            else {
                const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
                await (sizebytes === 4 ? prefixStream.writeUInt4Byte(data.length) : prefixStream.writeUInt3Byte(data.length));
            }
            data = BufferUtils.concatBuffer(prefixStream.toBuffer(), deflated);
        }
        else if (formatFlags.dataLengthIndicator) {
            const dataLengthStream = new MemoryWriterStream();
            await dataLengthStream.writeSyncSafeInt(data.length);
            data = BufferUtils.concatBuffer(dataLengthStream.toBuffer(), data);
        }
        if (formatFlags.unsynchronised) {
            data = applyUnsync(data);
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
    return { id: id, start: 0, end: 0, size: data.length, data: data, statusFlags: frameHead.statusFlags || {}, formatFlags };
}
export function getWriteTextEncoding(frame, head, defaultEncoding) {
    let encoding = (frame.head ? frame.head.encoding : undefined) || defaultEncoding;
    if (!encoding || !Encodings[encoding]) {
        encoding = (head.ver === 4) ? 'utf8' : 'ucs2';
    }
    return Encodings[encoding] || ascii;
}
//# sourceMappingURL=id3v2.frame.write.js.map