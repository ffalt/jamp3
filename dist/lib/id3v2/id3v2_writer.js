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
const utils_1 = require("../common/utils");
const id3v2_consts_1 = require("./id3v2_consts");
const buffer_1 = require("../common/buffer");
class Id3v2RawWriter {
    constructor(stream, head, options, frames) {
        this.stream = stream;
        this.head = head;
        this.frames = frames || [];
        this.paddingSize = options.paddingSize === undefined ? 0 : options.paddingSize;
    }
    writeHeader(frames) {
        return __awaiter(this, void 0, void 0, function* () {
            let framesSize = 0;
            const frameHeadSize = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[this.head.ver] +
                id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] +
                id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver];
            for (const frame of frames) {
                framesSize = framesSize + frame.size + frameHeadSize;
            }
            this.stream.writeAscii('ID3');
            this.stream.writeByte(this.head.ver);
            this.stream.writeByte(this.head.rev);
            const footerSize = 0;
            let extendedHeaderBuffer;
            let flagBits;
            if (this.head.ver <= 2) {
                this.head.v2 = this.head.v2 || { flags: {} };
                this.head.v2.flags.unsynchronisation = false;
                flagBits = utils_1.unflags(id3v2_consts_1.ID3v2_HEADER_FLAGS[2], this.head.v2.flags);
            }
            else if (this.head.ver === 3) {
                this.head.v3 = this.head.v3 || { flags: {} };
                this.head.v3.flags.unsynchronisation = false;
                if (this.head.v3.extended) {
                    extendedHeaderBuffer = yield this.writeExtHeaderV3(this.head.v3.extended);
                    this.head.v3.flags.extendedheader = true;
                }
                else {
                    this.head.v3.flags.extendedheader = false;
                }
                flagBits = utils_1.unflags(id3v2_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v3.flags);
            }
            else if (this.head.ver === 4) {
                this.head.v4 = this.head.v4 || { flags: {} };
                this.head.v4.flags.unsynchronisation = false;
                if (this.head.v4.extended) {
                    extendedHeaderBuffer = yield this.writeExtHeaderV4(this.head.v4.extended);
                    this.head.v4.flags.extendedheader = true;
                }
                else {
                    this.head.v4.flags.extendedheader = false;
                }
                flagBits = utils_1.unflags(id3v2_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.v4.flags);
            }
            else {
                flagBits = utils_1.unflags(id3v2_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], {});
            }
            this.head.flagBits = flagBits;
            this.stream.writeBitsByte(flagBits);
            const tagSize = (extendedHeaderBuffer ? extendedHeaderBuffer.length : 0) + framesSize + footerSize + this.paddingSize;
            if (this.head.ver > 2) {
                this.stream.writeSyncSafeInt(tagSize);
            }
            else {
                this.stream.writeUInt4Byte(tagSize);
            }
            if (extendedHeaderBuffer) {
                this.stream.writeBuffer(extendedHeaderBuffer);
            }
        });
    }
    writeExtHeaderV3(extended) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new streams_1.MemoryWriterStream();
            result.writeUInt4Byte(extended.size);
            result.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS1, extended.flags1));
            result.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS2, extended.flags2));
            result.writeUInt4Byte(this.paddingSize || 0);
            if (extended.flags1.crc) {
                result.writeUInt4Byte(extended.crcData || 0);
            }
            return result.toBuffer();
        });
    }
    writeExtHeaderV4(extended) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('WARNING: extended header 2.4 not implemented');
            return Promise.reject(Error('TODO extended header v2.4'));
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
                this.stream.writeBuffer(buffer_1.BufferUtils.zeroBuffer(this.paddingSize));
            }
        });
    }
    writeFrame(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            this.stream.writeAscii(frame.id);
            if (id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] === 4) {
                if (id3v2_consts_1.ID3v2_FRAME_HEADER.SYNCSAVEINT.indexOf(this.head.ver) >= 0) {
                    this.stream.writeSyncSafeInt(frame.size);
                }
                else {
                    this.stream.writeUInt4Byte(frame.size);
                }
            }
            else {
                this.stream.writeUInt3Byte(frame.size);
            }
            if (frame.formatFlags.unsynchronised) {
                frame.formatFlags.unsynchronised = false;
            }
            if (id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver] !== 0) {
                this.stream.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_FRAME_FLAGS1[this.head.ver], frame.statusFlags));
                this.stream.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_FRAME_FLAGS2[this.head.ver], frame.formatFlags));
            }
            this.stream.writeBuffer(frame.data);
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
class ID3v2Writer {
    write(stream, frames, head, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (head.ver === 0 || head.ver > 4) {
                return Promise.reject(Error('Unsupported Version'));
            }
            const writer = new Id3v2RawWriter(stream, head, options, frames);
            yield writer.write();
        });
    }
}
exports.ID3v2Writer = ID3v2Writer;
//# sourceMappingURL=id3v2_writer.js.map