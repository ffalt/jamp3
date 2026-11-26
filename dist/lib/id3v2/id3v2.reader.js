import { bitarray, flags, removeZeroString, unsynchsafe } from '../common/utils.js';
import { BufferUtils } from '../common/buffer.js';
import { ID3v2_FRAME_FLAGS1, ID3v2_FRAME_FLAGS2, ID3v2_FRAME_HEADER, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_HEADER, ID3v2_MARKER } from './id3v2.header.consts.js';
import { ITagID } from '../common/types.js';
import { ReaderStream } from '../common/stream-reader.js';
import { BufferReader } from '../common/buffer-reader.js';
import { isValidFrameBinId } from './frames/id3v2.frame.match.js';
import { removeUnsync } from './frames/id3v2.frame.unsync.js';
import { ID3v2HeaderReader } from './id3v2.reader.header.js';
const ID3v2_MARKER_BUFFER = BufferUtils.fromString(ID3v2_MARKER);
export class ID3v2Reader {
    constructor() {
        this.headerReader = new ID3v2HeaderReader();
    }
    async readRawTag(head, reader, consumed = 0) {
        const tag = { id: ITagID.ID3v2, frames: [], start: 0, end: 0, head: head || { ver: 0, rev: 0, size: 0, valid: false } };
        let rest;
        const framesSize = Math.max(0, tag.head.size - consumed);
        if (framesSize > 0) {
            const data = await reader.read(framesSize);
            rest = await this.readFrames(data, tag);
        }
        if (head.v4?.flags.footer) {
            await reader.read(ID3v2_HEADER.SIZE);
        }
        return { rest, tag };
    }
    async scan(reader) {
        if (reader.end) {
            return {};
        }
        const index = await reader.scan(ID3v2_MARKER_BUFFER);
        if (index < 0) {
            return {};
        }
        const result = await this.readReaderStream(reader);
        if (!result.tag) {
            return this.scan(reader);
        }
        result.tag.start = index;
        result.tag.end = reader.pos;
        return result;
    }
    async scanReaderStream(reader) {
        const result = await this.scan(reader);
        return result.tag;
    }
    async readReaderStream(reader) {
        const head = await this.headerReader.readHeader(reader);
        if (!head) {
            return {};
        }
        if (!head.header) {
            return { rest: head.rest };
        }
        return await this.readRawTag(head.header, reader, head.consumed);
    }
    async readStream(stream) {
        const reader = new ReaderStream();
        try {
            await reader.openStream(stream);
            return await this.scanReaderStream(reader);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async read(filename) {
        const reader = new ReaderStream();
        try {
            await reader.open(filename);
            const tag = await this.scanReaderStream(reader);
            reader.close();
            return tag;
        }
        catch (error) {
            reader.close();
            return Promise.reject(error);
        }
    }
    async readFrames(data, tag) {
        const markerLength = ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
        const reader = new BufferReader(data);
        let finish = false;
        let skip = 0;
        while (!finish) {
            let idbin = reader.readBuffer(markerLength);
            if (idbin[0] === 0) {
                reader.position -= markerLength;
                return reader.rest();
            }
            while (reader.hasData() && (!isValidFrameBinId(idbin))) {
                reader.position -= (markerLength - 1);
                skip++;
                idbin = reader.readBuffer(markerLength);
            }
            if (reader.hasData() && isValidFrameBinId(idbin)) {
                if (reader.unread() < ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver] + ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver]) {
                    return reader.rest();
                }
                skip = this.readFrame(reader, idbin, tag, skip);
            }
            else {
                finish = true;
            }
        }
        if (skip > 0) {
            reader.position -= (skip + markerLength);
        }
        return reader.rest();
    }
    defaultRawFrame(idbin, tag) {
        return {
            id: removeZeroString(idbin.toString('ascii').trim()),
            size: 0,
            start: tag.start,
            end: tag.end,
            data: BufferUtils.zeroBuffer(0),
            statusFlags: {},
            formatFlags: {}
        };
    }
    readFrame(reader, idbin, tag, skip) {
        let currentSkip = skip;
        const markerLength = ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
        const pos = reader.position;
        const frame = this.defaultRawFrame(idbin, tag);
        frame.size = reader.readUInt(ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver]);
        if (ID3v2_FRAME_HEADER.SYNCSAVEINT.includes(tag.head.ver)) {
            frame.size = unsynchsafe(frame.size);
        }
        if (ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver] > 0) {
            frame.statusFlags = flags(ID3v2_FRAME_FLAGS1[tag.head.ver], bitarray(reader.readByte()));
            frame.formatFlags = flags(ID3v2_FRAME_FLAGS2[tag.head.ver], bitarray(reader.readByte()));
        }
        let valid = (!frame.statusFlags.reserved && !frame.formatFlags.reserved2 && !frame.formatFlags.reserved3);
        if (valid && frame.size > reader.unread()) {
            valid = false;
        }
        if (valid) {
            if (currentSkip > 0 && tag.frames.length > 0) {
                const lastFrame = tag.frames.at(-1);
                let skipped = reader.data.subarray(pos - currentSkip - markerLength, pos - markerLength);
                if (tag.head.v3 && tag.head.v3.flags.unsynchronisation) {
                    skipped = removeUnsync(skipped);
                }
                lastFrame.data = BufferUtils.concatBuffer(lastFrame.data, skipped);
                lastFrame.size = lastFrame.data.length;
            }
            currentSkip = 0;
            if (frame.size > 0) {
                if (tag.head.v3 && tag.head.v3.flags.unsynchronisation) {
                    try {
                        frame.data = reader.readUnsyncedBuffer(frame.size);
                    }
                    catch {
                        reader.position = pos - (markerLength - 1);
                        return currentSkip + 1;
                    }
                }
                else {
                    frame.data = reader.readBuffer(frame.size);
                }
            }
            tag.frames.push(frame);
        }
        else {
            reader.position = pos - (markerLength - 1);
            currentSkip++;
        }
        return currentSkip;
    }
}
//# sourceMappingURL=id3v2.reader.js.map