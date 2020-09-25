"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3v2Reader = void 0;
const utils_1 = require("../common/utils");
const buffer_1 = require("../common/buffer");
const id3v2_header_consts_1 = require("./id3v2.header.consts");
const __1 = require("../..");
const stream_reader_1 = require("../common/stream-reader");
const buffer_reader_1 = require("../common/buffer-reader");
const id3v2_frame_match_1 = require("./frames/id3v2.frame.match");
const id3v2_reader_header_1 = require("./id3v2.reader.header");
const ID3v2_MARKER_BUFFER = buffer_1.BufferUtils.fromString(id3v2_header_consts_1.ID3v2_MARKER);
class ID3v2Reader {
    constructor() {
        this.headerReader = new id3v2_reader_header_1.ID3v2HeaderReader();
    }
    readRawTag(head, reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = { id: __1.ITagID.ID3v2, frames: [], start: 0, end: 0, head: head || { ver: 0, rev: 0, size: 0, valid: false } };
            let rest;
            if (tag.head.size > 0) {
                const data = yield reader.read(tag.head.size);
                rest = yield this.readFrames(data, tag);
            }
            return { rest, tag };
        });
    }
    scan(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reader.end) {
                return {};
            }
            const index = yield reader.scan(ID3v2_MARKER_BUFFER);
            if (index < 0) {
                return {};
            }
            const result = yield this.readReaderStream(reader);
            if (!result.tag) {
                return this.scan(reader);
            }
            result.tag.start = index;
            result.tag.end = reader.pos;
            return result;
        });
    }
    scanReaderStream(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.scan(reader);
            return result.tag;
        });
    }
    readReaderStream(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const head = yield this.headerReader.readHeader(reader);
            if (!head) {
                return {};
            }
            if (!head.header) {
                return { rest: head.rest };
            }
            return yield this.readRawTag(head.header, reader);
        });
    }
    readStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new stream_reader_1.ReaderStream();
            try {
                yield reader.openStream(stream);
                return yield this.scanReaderStream(reader);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    read(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new stream_reader_1.ReaderStream();
            try {
                yield reader.open(filename);
                const tag = yield this.scanReaderStream(reader);
                reader.close();
                return tag;
            }
            catch (e) {
                reader.close();
                return Promise.reject(e);
            }
        });
    }
    readFrames(data, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const markerLength = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
            const reader = new buffer_reader_1.BufferReader(data);
            let finish = false;
            let skip = 0;
            while (!finish) {
                let idbin = reader.readBuffer(markerLength);
                if (idbin[0] === 0) {
                    reader.position -= markerLength;
                    return reader.rest();
                }
                while (reader.hasData() && (!id3v2_frame_match_1.isValidFrameBinId(idbin))) {
                    reader.position -= (markerLength - 1);
                    skip++;
                    idbin = reader.readBuffer(markerLength);
                }
                if (reader.hasData() && id3v2_frame_match_1.isValidFrameBinId(idbin)) {
                    if (reader.unread() < id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver]) {
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
        });
    }
    defaultRawFrame(idbin, tag) {
        return {
            id: utils_1.removeZeroString(idbin.toString('ascii').trim()),
            size: 0, start: tag.start, end: tag.end,
            data: buffer_1.BufferUtils.zeroBuffer(0),
            statusFlags: {}, formatFlags: {}
        };
    }
    readFrame(reader, idbin, tag, skip) {
        const markerLength = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
        const pos = reader.position;
        const frame = this.defaultRawFrame(idbin, tag);
        frame.size = reader.readUInt(id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver]);
        if (id3v2_header_consts_1.ID3v2_FRAME_HEADER.SYNCSAVEINT.includes(tag.head.ver)) {
            frame.size = utils_1.unsynchsafe(frame.size);
        }
        if (id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver] > 0) {
            frame.statusFlags = utils_1.flags(id3v2_header_consts_1.ID3v2_FRAME_FLAGS1[tag.head.ver], utils_1.bitarray(reader.readByte()));
            frame.formatFlags = utils_1.flags(id3v2_header_consts_1.ID3v2_FRAME_FLAGS2[tag.head.ver], utils_1.bitarray(reader.readByte()));
        }
        let valid = (!frame.statusFlags.reserved && !frame.formatFlags.reserved2 && !frame.formatFlags.reserved3);
        if (valid && frame.size > reader.unread()) {
            valid = false;
        }
        if (valid) {
            if (skip > 0 && tag.frames.length > 0) {
                const lastFrame = tag.frames[tag.frames.length - 1];
                lastFrame.data = buffer_1.BufferUtils.concatBuffer(lastFrame.data, reader.data.slice(pos - skip - markerLength, pos - markerLength));
                lastFrame.size = lastFrame.data.length;
            }
            skip = 0;
            if (frame.size > 0) {
                frame.data = (tag.head.v3 && tag.head.v3.flags.unsynchronisation) ?
                    reader.readUnsyncedBuffer(frame.size) :
                    reader.readBuffer(frame.size);
            }
            tag.frames.push(frame);
        }
        else {
            reader.position = pos - (markerLength - 1);
            skip++;
        }
        return skip;
    }
}
exports.ID3v2Reader = ID3v2Reader;
//# sourceMappingURL=id3v2.reader.js.map