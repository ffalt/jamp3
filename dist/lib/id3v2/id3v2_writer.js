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
const utils_1 = require("../common/utils");
const id3v2_consts_1 = require("./id3v2_consts");
const buffer_1 = require("../common/buffer");
class Id3v2RawWriter {
    constructor(stream, head, frames, paddingSize) {
        this.stream = stream;
        this.head = head;
        this.frames = frames || [];
        this.paddingSize = paddingSize === undefined ? 0 : paddingSize;
    }
    writeHeader(frames) {
        return __awaiter(this, void 0, void 0, function* () {
            let framesSize = 0;
            const frameHeadSize = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.MARKER[this.head.ver] + id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] + id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver];
            for (const frame of frames) {
                framesSize = framesSize + frame.size + frameHeadSize;
            }
            this.stream.writeAscii('ID3');
            this.stream.writeByte(this.head.ver);
            this.stream.writeByte(this.head.rev);
            if (this.head.flags && this.head.flags.unsynchronisation) {
                this.head.flags.unsynchronisation = false;
            }
            if (this.head.flags && this.head.flags.extended) {
                this.head.flags.extended = false;
            }
            const flagarray = utils_1.unflags(id3v2_consts_1.ID3v2_HEADER_FLAGS[this.head.ver], this.head.flags);
            this.stream.writeBitsByte(flagarray);
            const extendedHeaderSize = 0;
            const footerSize = 0;
            const tagSize = extendedHeaderSize + framesSize + (footerSize || this.paddingSize);
            this.stream.writeSyncSafeInt(tagSize);
        });
    }
    writeExtHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.head.extended) {
                return;
            }
            if (this.head.ver === 3) {
                if (!this.head.extended.ver3) {
                    return;
                }
                this.stream.writeUInt4Byte(this.head.extended.size);
                this.stream.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS1, this.head.extended.ver3.flags1));
                this.stream.writeBitsByte(utils_1.unflags(id3v2_consts_1.ID3v2_EXTHEADER[3].FLAGS2, this.head.extended.ver3.flags2));
                this.stream.writeUInt4Byte(this.head.extended.ver3.sizeOfPadding || 0);
                if (this.head.extended.ver3.flags1.crc) {
                    this.stream.writeUInt4Byte(this.head.extended.ver3.crcData || 0);
                }
            }
            else if (this.head.ver === 4) {
                return Promise.reject(Error('TODO extended header v2.4'));
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
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.writeHeader(this.frames);
            yield this.writeExtHeader();
            yield this.writeFrames(this.frames);
            yield this.writeEnd();
        });
    }
}
exports.Id3v2RawWriter = Id3v2RawWriter;
class ID3v2Writer {
    write(stream, frames, head, paddingSize) {
        return __awaiter(this, void 0, void 0, function* () {
            if (head.ver === 0 || head.ver > 4) {
                return Promise.reject(Error('Unsupported Version'));
            }
            const writer = new Id3v2RawWriter(stream, head, frames, paddingSize);
            yield writer.write();
        });
    }
}
exports.ID3v2Writer = ID3v2Writer;
//# sourceMappingURL=id3v2_writer.js.map