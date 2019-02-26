"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const streams_1 = require("../common/streams");
const id3v2_frames_1 = require("./id3v2_frames");
const utils_1 = require("../common/utils");
const marker_1 = require("../common/marker");
const buffer_1 = require("../common/buffer");
const id3v2_consts_1 = require("./id3v2_consts");
const ID3v2_MARKER_BUFFER = buffer_1.BufferUtils.fromString(id3v2_consts_1.ID3v2_MARKER);
class ID3v2Reader {
    readHeader(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield reader.read(id3v2_consts_1.ID3v2_HEADER.SIZE);
            const header = this.readID3v2Header(data, 0);
            if (!header || !header.valid) {
                return { rest: data };
            }
            if (!header.flags || !header.flags.extendedheader) {
                return { header };
            }
            const extended = yield this.readID3ExtendedHeader(reader, header.ver);
            header.extended = extended ? extended.exthead : undefined;
            return { header, rest: extended ? extended.rest : undefined };
        });
    }
    readRawTag(head, reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = { id: 'ID3v2', frames: [], start: 0, end: 0, head: head || { ver: 0, rev: 0, size: 0, valid: false } };
            const data = yield reader.read(tag.head.size);
            const rest = yield this.readFrames(data, tag);
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
    readID3ExtendedHeader(reader, ver) {
        return __awaiter(this, void 0, void 0, function* () {
            const headdata = yield reader.read(4);
            const exthead = {
                size: headdata.readInt32BE(0)
            };
            if (id3v2_consts_1.ID3v2_EXTHEADER.SYNCSAVEINT.indexOf(ver) >= 0) {
                exthead.size = utils_1.unsynchsafe(exthead.size);
            }
            if (exthead.size > 10) {
                exthead.size = 6;
            }
            const data = yield reader.read(exthead.size);
            if (ver === 3) {
                const ver3 = {
                    flags1: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS1, utils_1.bitarray(data[0])),
                    flags2: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS2, utils_1.bitarray(data[1])),
                    sizeOfPadding: data.readUInt32BE(2)
                };
                if (ver3.flags1.crc && data.length > 6) {
                    ver3.crcData = data.readUInt32BE(6);
                }
                exthead.ver3 = ver3;
            }
            else if (ver === 4) {
                const ver4 = {
                    flags: utils_1.flags(id3v2_consts_1.ID3v2_EXTHEADER[4].FLAGS, utils_1.bitarray(data[0])),
                };
                let pos = 1;
                if (ver4.flags.crc) {
                    const size = data[pos];
                    pos++;
                    ver4.crc32 = utils_1.unsynchsafe(data.readInt32BE(pos));
                    pos += size;
                }
                if (ver4.flags.restrictions) {
                    pos++;
                    const r = utils_1.bitarray(data[pos]);
                    ver4.restrictions = {
                        tagSize: r[0].toString() + r[1].toString(),
                        textEncoding: r[2].toString(),
                        textSize: r[3].toString() + r[4].toString(),
                        imageEncoding: r[5].toString(),
                        imageSize: r[6].toString() + r[7].toString()
                    };
                }
            }
            return { exthead };
        });
    }
    readID3v2Header(buffer, offset) {
        if ((!marker_1.Markers.isMarker(buffer, offset, marker_1.Markers.MARKERS.id3)) || (buffer.length < 10)) {
            return null;
        }
        const head = {
            ver: buffer[offset + 3],
            rev: buffer[offset + 4],
            size: buffer.readInt32BE(offset + 6),
            valid: false
        };
        if (id3v2_consts_1.ID3v2_HEADER.SYNCSAVEINT.indexOf(head.ver) >= 0) {
            head.size = utils_1.unsynchsafe(head.size);
        }
        else {
            head.syncSaveSize = utils_1.unsynchsafe(head.size);
        }
        if (id3v2_consts_1.ID3v2_HEADER_FLAGS[head.ver]) {
            head.flags = utils_1.flags(id3v2_consts_1.ID3v2_HEADER_FLAGS[head.ver], utils_1.bitarray(buffer[5]));
            head.valid = head.size > 0;
        }
        else {
            head.flagBits = utils_1.bitarray(buffer[5]);
        }
        return head;
    }
    readStream(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.scan(reader);
            return result.tag;
        });
    }
    read(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new streams_1.ReaderStream();
            try {
                yield reader.open(filename);
                const tag = yield this.readStream(reader);
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
            const reader = new streams_1.DataReader(data);
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
                            if (tag.head.ver === 3 && tag.head.flags && tag.head.flags.unsynchronisation) {
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