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
const id3v2_frame_unsync_1 = require("./frames/id3v2.frame.unsync");
class Id3v2RawWriter {
    constructor(stream, head, options, frames) {
        this.writtenTagSize = 0;
        this.stream = stream;
        this.head = head;
        this.frames = frames || [];
        this.paddingSize = options.paddingSize === undefined ? 0 : options.paddingSize;
    }
    tagLevelUnsync() {
        var _a, _b;
        return (this.head.ver <= 2 && !!((_a = this.head.v2) === null || _a === void 0 ? void 0 : _a.flags.unsynchronisation)) || (this.head.ver === 3 && !!((_b = this.head.v3) === null || _b === void 0 ? void 0 : _b.flags.unsynchronisation));
    }
    buildHeaderFlagsV4() {
        return __awaiter(this, void 0, void 0, function* () {
            this.head.v4 = this.head.v4 || { flags: {} };
            this.head.v4.flags.unsynchronisation = false;
            this.head.v4.flags.extendedheader = !!this.head.v4.extended;
            const flagBits = (0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v4.flags);
            if (this.head.v4.extended) {
                const extendedHeaderBuffer = yield this.writeExtHeaderV4(this.head.v4.extended);
                return { flagBits, extendedHeaderBuffer };
            }
            return { flagBits };
        });
    }
    writeExtHeaderV4(extended) {
        return __awaiter(this, void 0, void 0, function* () {
            const extFlags = extended.flags || {};
            const flagDataParts = [];
            if (extFlags.update) {
                flagDataParts.push(Buffer.from([0x00]));
            }
            if (extFlags.crc) {
                const crcBuf = Buffer.allocUnsafe(6);
                crcBuf[0] = 0x05;
                let val = extended.crc32 || 0;
                for (let i = 5; i >= 1; i--) {
                    crcBuf[i] = val & 0x7F;
                    val >>>= 7;
                }
                flagDataParts.push(crcBuf);
            }
            if (extFlags.restrictions && extended.restrictions) {
                const r = extended.restrictions;
                const restrictionByte = (r.tagSize << 6) | (r.textEncoding << 5) | (r.textSize << 3) | (r.imageEncoding << 2) | r.imageSize;
                flagDataParts.push(Buffer.from([0x01, restrictionByte]));
            }
            const flagData = flagDataParts.length > 0 ? Buffer.concat(flagDataParts) : Buffer.alloc(0);
            const totalSize = 4 + 1 + 1 + flagData.length;
            const result = new stream_writer_memory_1.MemoryWriterStream();
            yield result.writeSyncSafeInt(totalSize);
            yield result.writeByte(0x01);
            yield result.writeBitsByte((0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_EXTHEADER[4].FLAGS, extFlags));
            if (flagData.length > 0) {
                yield result.writeBuffer(flagData);
            }
            return result.toBuffer();
        });
    }
    buildHeaderFlagsV3() {
        return __awaiter(this, void 0, void 0, function* () {
            this.head.v3 = this.head.v3 || { flags: {} };
            this.head.v3.flags.extendedheader = !!this.head.v3.extended;
            const flagBits = (0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v3.flags);
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
            yield result.writeBitsByte((0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS1, extended.flags1));
            yield result.writeBitsByte((0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS2, extended.flags2));
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
            const flagBits = (0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[2], this.head.v2.flags);
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
                return { flagBits: (0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], {}) };
            }
        });
    }
    calculateTagSize(frames, extendedHeaderSize) {
        var _a;
        let framesSize = 0;
        const frameHeadSize = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[this.head.ver] +
            id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] +
            id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver];
        const tagLevelUnsync = this.tagLevelUnsync();
        for (const frame of frames) {
            const dataSize = (tagLevelUnsync && !frame.formatFlags.unsynchronised) ? (0, id3v2_frame_unsync_1.applyUnsync)(frame.data).length : frame.size;
            framesSize = framesSize + dataSize + frameHeadSize;
        }
        const padding = (this.head.ver === 4 && ((_a = this.head.v4) === null || _a === void 0 ? void 0 : _a.flags.footer)) ? 0 : this.paddingSize;
        return extendedHeaderSize + framesSize + padding;
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
            this.writtenTagSize = tagSize;
            yield (this.head.ver > 2 ? this.stream.writeSyncSafeInt(tagSize) : this.stream.writeUInt4Byte(tagSize));
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
    writeFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stream.writeAscii(id3v2_header_consts_1.ID3v2_FOOTER_MARKER);
            yield this.stream.writeByte(this.head.ver);
            yield this.stream.writeByte(this.head.rev);
            yield this.stream.writeBitsByte(this.head.flagBits || []);
            yield this.stream.writeSyncSafeInt(this.writtenTagSize);
        });
    }
    writeEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.head.ver === 4 && ((_a = this.head.v4) === null || _a === void 0 ? void 0 : _a.flags.footer)) {
                yield this.writeFooter();
            }
            else if (this.paddingSize > 0) {
                yield this.stream.writeBuffer(buffer_1.BufferUtils.zeroBuffer(this.paddingSize));
            }
        });
    }
    writeFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stream.writeAscii(frame.id);
            if (id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] === 4) {
                yield (id3v2_header_consts_1.ID3v2_FRAME_HEADER.SYNCSAVEINT.includes(this.head.ver) ? this.stream.writeSyncSafeInt(frame.size) : this.stream.writeUInt4Byte(frame.size));
            }
            else {
                yield this.stream.writeUInt3Byte(frame.size);
            }
            if (id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver] !== 0) {
                yield this.stream.writeBitsByte((0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_FRAME_FLAGS1[this.head.ver], frame.statusFlags));
                yield this.stream.writeBitsByte((0, utils_1.unflags)(id3v2_header_consts_1.ID3v2_FRAME_FLAGS2[this.head.ver], frame.formatFlags));
            }
            const frameData = (this.tagLevelUnsync() && !frame.formatFlags.unsynchronised) ? (0, id3v2_frame_unsync_1.applyUnsync)(frame.data) : frame.data;
            yield this.stream.writeBuffer(frameData);
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