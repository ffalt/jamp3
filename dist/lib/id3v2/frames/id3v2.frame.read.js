import * as zlib from 'node:zlib';
import { promisify } from 'node:util';
import { ITagID } from '../../common/types.js';
import { BufferReader } from '../../common/buffer-reader.js';
import { ID3v2_FRAME_HEADER_LENGTHS } from '../id3v2.header.consts.js';
import { ID3v2Reader } from '../id3v2.reader.js';
import { matchFrame } from './id3v2.frame.match.js';
import { removeUnsync } from './id3v2.frame.unsync.js';
const inflate = promisify(zlib.inflate);
const gunzip = promisify(zlib.gunzip);
async function decompressFrameData(data) {
    try {
        return await inflate(data);
    }
    catch {
        try {
            return await gunzip(data);
        }
        catch {
            throw new Error('Decompressing frame failed');
        }
    }
}
async function processRawFrame(frame, head) {
    if ((frame.formatFlags) && (frame.formatFlags.encrypted)) {
        return Promise.reject(new Error('Frame Encryption currently not supported'));
    }
    let data = frame.data;
    if ((frame.formatFlags) && (frame.formatFlags.dataLengthIndicator)) {
        data = data.subarray(4);
    }
    if ((frame.formatFlags) && (frame.formatFlags.unsynchronised)) {
        data = removeUnsync(data);
    }
    if ((frame.formatFlags) && (frame.formatFlags.compressed)) {
        if ((head.ver !== 4) || !frame.formatFlags.dataLengthIndicator) {
            data = data.subarray(ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver]);
        }
        data = await decompressFrameData(data);
    }
    frame.data = data;
}
export async function buildID3v2(tag) {
    const frames = [];
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
export async function readSubFrames(bin, head) {
    const subtag = { id: ITagID.ID3v2, head, frames: [], start: 0, end: 0 };
    const reader = new ID3v2Reader();
    await reader.readFrames(bin, subtag);
    const t = await buildID3v2(subtag);
    return t.frames;
}
export async function readID3v2Frame(rawFrame, head) {
    const f = matchFrame(rawFrame.id);
    let groupId;
    if (rawFrame.formatFlags && rawFrame.formatFlags.grouping) {
        groupId = rawFrame.data[0];
        rawFrame.data = rawFrame.data.subarray(1);
    }
    const frame = {
        id: rawFrame.id,
        head: {
            encoding: undefined,
            statusFlags: rawFrame.statusFlags,
            formatFlags: rawFrame.formatFlags,
            size: rawFrame.size
        },
        value: {}
    };
    try {
        await processRawFrame(rawFrame, head);
        const reader = new BufferReader(rawFrame.data);
        const result = await f.impl.parse(reader, rawFrame, head);
        if (frame.head) {
            frame.head.encoding = result.encoding ? result.encoding.name : undefined;
        }
        frame.value = result.value || { bin: rawFrame.data };
        if (result.subframes) {
            frame.subframes = result.subframes;
        }
    }
    catch (error) {
        frame.invalid = error.toString();
        frame.value = { bin: rawFrame.data };
    }
    if (groupId !== undefined) {
        frame.groupId = groupId;
    }
    frame.title = f.title;
    return frame;
}
//# sourceMappingURL=id3v2.frame.read.js.map