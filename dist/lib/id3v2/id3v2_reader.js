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
const id3v2_frames_1 = require("./id3v2_frames");
const utils_1 = require("../common/utils");
const marker_1 = require("../common/marker");
const buffer_1 = require("../common/buffer");
const id3v2_consts_1 = require("./id3v2_consts");
const __1 = require("../..");
const stream_reader_1 = require("../common/stream-reader");
const buffer_reader_1 = require("../common/buffer-reader");
const ID3v2_MARKER_BUFFER = buffer_1.BufferUtils.fromString(id3v2_consts_1.ID3v2_MARKER);
class ID3v2Reader {
    readHeader(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield reader.read(id3v2_consts_1.ID3v2_HEADER.SIZE);
            const header = this.readID3v2Header(data, 0);
            if (!header || !header.valid) {
                return { rest: data };
            }
            if (header.v3 && header.v3.flags.extendedheader) {
                const extended = yield this.readID3ExtendedHeaderV3(reader);
                header.v3.extended = extended.exthead;
                return { header, rest: extended.rest };
            }
            else if (header.v4 && header.v4.flags.extendedheader) {
                const extended = yield this.readID3ExtendedHeaderV4(reader);
                header.v4.extended = extended.exthead;
                return { header, rest: extended.rest };
            }
            return { header };
        });
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
    readTag(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const head = yield this.readHeader(reader);
            if (!head) {
                return {};
            }
            if (!head.header) {
                return { rest: head.rest };
            }
            return yield this.readRawTag(head.header, reader);
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
            const result = yield this.readTag(reader);
            if (!result.tag) {
                return this.scan(reader);
            }
            result.tag.start = index;
            result.tag.end = reader.pos;
            return result;
        });
    }
    readID3ExtendedHeaderV3(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const headdata = yield reader.read(4);
            let size = headdata.readInt32BE(0);
            if (size > 10) {
                size = 6;
            }
            const data = yield reader.read(size);
            const exthead = {
                size,
                flags1: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS1, utils_1.bitarray(data[0])),
                flags2: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS2, utils_1.bitarray(data[1])),
                sizeOfPadding: data.readUInt32BE(2)
            };
            if (exthead.flags1.crc && data.length > 6) {
                exthead.crcData = data.readUInt32BE(6);
            }
            return { exthead };
        });
    }
    readID3ExtendedHeaderV4(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const headdata = yield reader.read(4);
            let size = headdata.readInt32BE(0);
            size = utils_1.unsynchsafe(size);
            if (size > 10) {
                size = 6;
            }
            const data = yield reader.read(size);
            const exthead = {
                size,
                flags: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[4].FLAGS, utils_1.bitarray(data[0]))
            };
            let pos = 1;
            if (exthead.flags.crc) {
                const crcSize = data[pos];
                pos++;
                exthead.crc32 = utils_1.unsynchsafe(data.readInt32BE(pos));
                pos += crcSize;
            }
            if (exthead.flags.restrictions) {
                pos++;
                const r = utils_1.bitarray(data[pos]);
                exthead.restrictions = {
                    tagSize: r[0].toString() + r[1].toString(),
                    textEncoding: r[2].toString(),
                    textSize: r[3].toString() + r[4].toString(),
                    imageEncoding: r[5].toString(),
                    imageSize: r[6].toString() + r[7].toString()
                };
            }
            return { exthead };
        });
    }
    readID3v2Header(buffer, offset) {
        if ((!marker_1.Markers.isMarker(buffer, offset, marker_1.Markers.MARKERS.id3)) || (buffer.length < 10)) {
            return null;
        }
        const flagBits = utils_1.bitarray(buffer[5]);
        const head = {
            ver: buffer[offset + 3],
            rev: buffer[offset + 4],
            size: buffer.readInt32BE(offset + 6),
            flagBits,
            valid: false
        };
        if (head.ver === 4) {
            head.size = utils_1.unsynchsafe(head.size);
            head.v4 = {
                flags: {
                    unsynchronisation: flagBits[0] === 1,
                    extendedheader: flagBits[1] === 1,
                    experimental: flagBits[2] === 1,
                    footer: flagBits[3] === 1
                }
            };
        }
        else if (head.ver === 3) {
            head.size = utils_1.unsynchsafe(head.size);
            head.v3 = {
                flags: {
                    unsynchronisation: flagBits[0] === 1,
                    extendedheader: flagBits[1] === 1,
                    experimental: flagBits[2] === 1
                }
            };
        }
        else if (head.ver <= 2) {
            head.v2 = {
                sizeAsSyncSafe: utils_1.unsynchsafe(head.size),
                flags: {
                    unsynchronisation: flagBits[0] === 1,
                    compression: flagBits[1] === 1,
                }
            };
        }
        head.valid = head.size >= 0 && head.ver <= 4;
        return head;
    }
    readReaderStream(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.scan(reader);
            return result.tag;
        });
    }
    readStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new stream_reader_1.ReaderStream();
            try {
                yield reader.openStream(stream);
                return yield this.readReaderStream(reader);
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
                const tag = yield this.readReaderStream(reader);
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
            const marker = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[tag.head.ver];
            const sizebytes = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[tag.head.ver];
            const flagsbytes = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[tag.head.ver];
            const reader = new buffer_reader_1.BufferReader(data);
            let finish = false;
            let scanpos = reader.position;
            let skip = 0;
            while (!finish) {
                scanpos = reader.position;
                let idbin = reader.readBuffer(marker);
                if (idbin[0] === 0) {
                    reader.position = reader.position - marker;
                    return reader.rest();
                }
                while (reader.unread() > 0 && (!id3v2_frames_1.isValidFrameBinId(idbin))) {
                    reader.position = reader.position - (marker - 1);
                    skip++;
                    idbin = reader.readBuffer(marker);
                }
                if (reader.unread() > 0 && id3v2_frames_1.isValidFrameBinId(idbin)) {
                    const pos = reader.position;
                    const frame = { id: utils_1.removeZeroString(idbin.toString('ascii').trim()), size: 0, start: tag.start, end: tag.end, data: buffer_1.BufferUtils.zeroBuffer(0), statusFlags: {}, formatFlags: {} };
                    if (reader.unread() < sizebytes) {
                        return reader.rest();
                    }
                    frame.size = reader.readUInt(sizebytes);
                    if (id3v2_consts_1.ID3v2_FRAME_HEADER.SYNCSAVEINT.indexOf(tag.head.ver) >= 0) {
                        frame.size = utils_1.unsynchsafe(frame.size);
                    }
                    if (flagsbytes > 0) {
                        frame.statusFlags = utils_1.flags(id3v2_consts_1.ID3v2_FRAME_FLAGS1[tag.head.ver], utils_1.bitarray(reader.readByte()));
                        frame.formatFlags = utils_1.flags(id3v2_consts_1.ID3v2_FRAME_FLAGS2[tag.head.ver], utils_1.bitarray(reader.readByte()));
                    }
                    let frameheaderValid = (!frame.statusFlags.reserved && !frame.formatFlags.reserved2 && !frame.formatFlags.reserved3);
                    if (frameheaderValid && frame.size > reader.unread()) {
                        frameheaderValid = false;
                    }
                    if (frameheaderValid) {
                        if (skip > 0 && tag.frames.length > 0) {
                            const lastFrame = tag.frames[tag.frames.length - 1];
                            lastFrame.data = buffer_1.BufferUtils.concatBuffer(lastFrame.data, reader.data.slice(pos - skip - marker, pos - marker));
                            lastFrame.size = lastFrame.data.length;
                        }
                        skip = 0;
                        if (frame.size > 0) {
                            if (tag.head.v3 && tag.head.v3.flags.unsynchronisation) {
                                frame.data = reader.readUnsyncedBuffer(frame.size);
                            }
                            else {
                                frame.data = reader.readBuffer(frame.size);
                            }
                        }
                        tag.frames.push(frame);
                    }
                    else {
                        reader.position = pos - (marker - 1);
                        skip++;
                    }
                }
                else {
                    finish = true;
                }
            }
            if (skip > 0) {
                reader.position -= (skip + marker);
            }
            return reader.rest();
        });
    }
}
exports.ID3v2Reader = ID3v2Reader;
//# sourceMappingURL=id3v2_reader.js.map