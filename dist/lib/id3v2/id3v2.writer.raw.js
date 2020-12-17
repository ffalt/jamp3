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
exports.Id3v2RawWriter = void 0;
const id3v2_header_consts_1 = require("./id3v2.header.consts");
const utils_1 = require("../common/utils");
const stream_writer_memory_1 = require("../common/stream-writer-memory");
const buffer_1 = require("../common/buffer");
class Id3v2RawWriter {
    constructor(stream, head, options, frames) {
        this.stream = stream;
        this.head = head;
        this.frames = frames || [];
        this.paddingSize = options.paddingSize === undefined ? 0 : options.paddingSize;
    }
    buildHeaderFlagsV4() {
        return __awaiter(this, void 0, void 0, function* () {
            this.head.v4 = this.head.v4 || { flags: {} };
            this.head.v4.flags.unsynchronisation = false;
            this.head.v4.flags.extendedheader = !!this.head.v4.extended;
            const flagBits = utils_1.unflags(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v4.flags);
            if (this.head.v4.extended) {
                const extendedHeaderBuffer = yield this.writeExtHeaderV4(this.head.v4.extended);
                return { flagBits, extendedHeaderBuffer };
            }
            return { flagBits };
        });
    }
    writeExtHeaderV4(extended) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error('WARNING: extended header 2.4 not implemented');
            return Promise.reject(Error('TODO extended header v2.4'));
        });
    }
    buildHeaderFlagsV3() {
        return __awaiter(this, void 0, void 0, function* () {
            this.head.v3 = this.head.v3 || { flags: {} };
            this.head.v3.flags.unsynchronisation = false;
            this.head.v3.flags.extendedheader = !!this.head.v3.extended;
            const flagBits = utils_1.unflags(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v3.flags);
            if (this.head.v3.extended) {
                const extendedHeaderBuffer = yield this.writeExtHeaderV3(this.head.v3.extended);
                return { flagBits, extendedHeaderBuffer };
            }
            return { flagBits };
        });
    }
    writeExtHeaderV3(extended) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new stream_writer_memory_1.MemoryWriterStream();
            yield result.writeUInt4Byte(extended.size);
            yield result.writeBitsByte(utils_1.unflags(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS1, extended.flags1));
            yield result.writeBitsByte(utils_1.unflags(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS2, extended.flags2));
            yield result.writeUInt4Byte(this.paddingSize || 0);
            if (extended.flags1.crc) {
                yield result.writeUInt4Byte(extended.crcData || 0);
            }
            return result.toBuffer();
        });
    }
    buildHeaderFlagsV2() {
        return __awaiter(this, void 0, void 0, function* () {
            this.head.v2 = this.head.v2 || { flags: {} };
            this.head.v2.flags.unsynchronisation = false;
            const flagBits = utils_1.unflags(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[2], this.head.v2.flags);
            return { flagBits };
        });
    }
    buildHeaderFlags() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.head.ver <= 2) {
                return this.buildHeaderFlagsV2();
            }
            else if (this.head.ver === 3) {
                return yield this.buildHeaderFlagsV3();
            }
            else if (this.head.ver === 4) {
                return yield this.buildHeaderFlagsV4();
            }
            else {
                return { flagBits: utils_1.unflags(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], {}) };
            }
        });
    }
    calculateTagSize(frames, extendedHeaderSize) {
        let framesSize = 0;
        const frameHeadSize = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[this.head.ver] +
            id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] +
            id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver];
        for (const frame of frames) {
            framesSize = framesSize + frame.size + frameHeadSize;
        }
        const footerSize = 0;
        return extendedHeaderSize + framesSize + footerSize + this.paddingSize;
    }
    writeHeader(frames) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stream.writeAscii('ID3');
            yield this.stream.writeByte(this.head.ver);
            yield this.stream.writeByte(this.head.rev);
            const versionHead = yield this.buildHeaderFlags();
            this.head.flagBits = versionHead.flagBits;
            yield this.stream.writeBitsByte(versionHead.flagBits);
            const tagSize = this.calculateTagSize(frames, versionHead.extendedHeaderBuffer ? versionHead.extendedHeaderBuffer.length : 0);
            if (this.head.ver > 2) {
                yield this.stream.writeSyncSafeInt(tagSize);
            }
            else {
                yield this.stream.writeUInt4Byte(tagSize);
            }
            if (versionHead.extendedHeaderBuffer) {
                yield this.stream.writeBuffer(versionHead.extendedHeaderBuffer);
            }
        });
    }
    writeFrames(frames) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const frame of frames) {
                yield this.writeFrame(frame);
            }
        });
    }
    writeEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.paddingSize > 0) {
                yield this.stream.writeBuffer(buffer_1.BufferUtils.zeroBuffer(this.paddingSize));
            }
        });
    }
    writeFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stream.writeAscii(frame.id);
            if (id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] === 4) {
                if (id3v2_header_consts_1.ID3v2_FRAME_HEADER.SYNCSAVEINT.indexOf(this.head.ver) >= 0) {
                    yield this.stream.writeSyncSafeInt(frame.size);
                }
                else {
                    yield this.stream.writeUInt4Byte(frame.size);
                }
            }
            else {
                yield this.stream.writeUInt3Byte(frame.size);
            }
            if (frame.formatFlags.unsynchronised) {
                frame.formatFlags.unsynchronised = false;
            }
            if (id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver] !== 0) {
                yield this.stream.writeBitsByte(utils_1.unflags(id3v2_header_consts_1.ID3v2_FRAME_FLAGS1[this.head.ver], frame.statusFlags));
                yield this.stream.writeBitsByte(utils_1.unflags(id3v2_header_consts_1.ID3v2_FRAME_FLAGS2[this.head.ver], frame.formatFlags));
            }
            yield this.stream.writeBuffer(frame.data);
        });
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.writeHeader(this.frames);
            yield this.writeFrames(this.frames);
            yield this.writeEnd();
        });
    }
}
exports.Id3v2RawWriter = Id3v2RawWriter;
//# sourceMappingURL=id3v2.writer.raw.js.map