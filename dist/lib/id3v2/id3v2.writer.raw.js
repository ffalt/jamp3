import { ID3v2_EXTHEADER, ID3v2_FOOTER_MARKER, ID3v2_FRAME_FLAGS1, ID3v2_FRAME_FLAGS2, ID3v2_FRAME_HEADER, ID3v2_FRAME_HEADER_LENGTHS, ID3v2_HEADER_FLAGS } from './id3v2.header.consts.js';
import { unflags } from '../common/utils.js';
import { MemoryWriterStream } from '../common/stream-writer-memory.js';
import { BufferUtils } from '../common/buffer.js';
import { applyUnsync } from './frames/id3v2.frame.unsync.js';
export class Id3v2RawWriter {
    constructor(stream, head, options, frames) {
        this.writtenTagSize = 0;
        this.stream = stream;
        this.head = head;
        this.frames = frames || [];
        this.paddingSize = options.paddingSize === undefined ? 0 : options.paddingSize;
    }
    tagLevelUnsync() {
        return (this.head.ver <= 2 && !!this.head.v2?.flags.unsynchronisation) || (this.head.ver === 3 && !!this.head.v3?.flags.unsynchronisation);
    }
    async buildHeaderFlagsV4() {
        var _a;
        (_a = this.head).v4 || (_a.v4 = { flags: {} });
        this.head.v4.flags.unsynchronisation = false;
        this.head.v4.flags.extendedheader = !!this.head.v4.extended;
        const flagBits = unflags(ID3v2_HEADER_FLAGS[this.head.ver], this.head.v4.flags);
        if (this.head.v4.extended) {
            const extendedHeaderBuffer = await this.writeExtHeaderV4(this.head.v4.extended);
            return { flagBits, extendedHeaderBuffer };
        }
        return { flagBits };
    }
    async writeExtHeaderV4(extended) {
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
        const result = new MemoryWriterStream();
        await result.writeSyncSafeInt(totalSize);
        await result.writeByte(0x01);
        await result.writeBitsByte(unflags(ID3v2_EXTHEADER[4].FLAGS, extFlags));
        if (flagData.length > 0) {
            await result.writeBuffer(flagData);
        }
        return result.toBuffer();
    }
    async buildHeaderFlagsV3() {
        var _a;
        (_a = this.head).v3 || (_a.v3 = { flags: {} });
        this.head.v3.flags.extendedheader = !!this.head.v3.extended;
        const flagBits = unflags(ID3v2_HEADER_FLAGS[this.head.ver], this.head.v3.flags);
        if (this.head.v3.extended) {
            const logical = await this.writeExtHeaderV3(this.head.v3.extended);
            const extendedHeaderBuffer = this.tagLevelUnsync() ? applyUnsync(logical) : logical;
            return { flagBits, extendedHeaderBuffer };
        }
        return { flagBits };
    }
    async writeExtHeaderV3(extended) {
        const result = new MemoryWriterStream();
        await result.writeUInt4Byte(extended.flags1.crc ? 10 : 6);
        await result.writeBitsByte(unflags(ID3v2_EXTHEADER[3].FLAGS1, extended.flags1));
        await result.writeBitsByte(unflags(ID3v2_EXTHEADER[3].FLAGS2, extended.flags2));
        await result.writeUInt4Byte(this.paddingSize || 0);
        if (extended.flags1.crc) {
            await result.writeUInt4Byte(extended.crcData || 0);
        }
        return result.toBuffer();
    }
    async buildHeaderFlagsV2() {
        var _a;
        (_a = this.head).v2 || (_a.v2 = { flags: {} });
        const flagBits = unflags(ID3v2_HEADER_FLAGS[2], this.head.v2.flags);
        return { flagBits };
    }
    async buildHeaderFlags() {
        if (this.head.ver <= 2) {
            return this.buildHeaderFlagsV2();
        }
        if (this.head.ver === 3) {
            return await this.buildHeaderFlagsV3();
        }
        if (this.head.ver === 4) {
            return await this.buildHeaderFlagsV4();
        }
        return { flagBits: unflags(ID3v2_HEADER_FLAGS[this.head.ver], {}) };
    }
    calculateTagSize(frames, extendedHeaderSize) {
        let framesSize = 0;
        const frameHeadSize = ID3v2_FRAME_HEADER_LENGTHS.MARKER[this.head.ver] +
            ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] +
            ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver];
        const tagLevelUnsync = this.tagLevelUnsync();
        for (const frame of frames) {
            const dataSize = (tagLevelUnsync && !frame.formatFlags.unsynchronised) ? applyUnsync(frame.data).length : frame.size;
            framesSize = framesSize + dataSize + frameHeadSize;
        }
        const padding = (this.head.ver === 4 && this.head.v4?.flags.footer) ? 0 : this.paddingSize;
        return extendedHeaderSize + framesSize + padding;
    }
    async writeHeader(frames) {
        await this.stream.writeAscii('ID3');
        await this.stream.writeByte(this.head.ver);
        await this.stream.writeByte(this.head.rev);
        const versionHead = await this.buildHeaderFlags();
        this.head.flagBits = versionHead.flagBits;
        await this.stream.writeBitsByte(versionHead.flagBits);
        const tagSize = this.calculateTagSize(frames, versionHead.extendedHeaderBuffer ? versionHead.extendedHeaderBuffer.length : 0);
        this.writtenTagSize = tagSize;
        await this.stream.writeSyncSafeInt(tagSize);
        if (versionHead.extendedHeaderBuffer) {
            await this.stream.writeBuffer(versionHead.extendedHeaderBuffer);
        }
    }
    async writeFrames(frames) {
        for (const frame of frames) {
            await this.writeFrame(frame);
        }
    }
    async writeFooter() {
        await this.stream.writeAscii(ID3v2_FOOTER_MARKER);
        await this.stream.writeByte(this.head.ver);
        await this.stream.writeByte(this.head.rev);
        await this.stream.writeBitsByte(this.head.flagBits || []);
        await this.stream.writeSyncSafeInt(this.writtenTagSize);
    }
    async writeEnd() {
        if (this.head.ver === 4 && this.head.v4?.flags.footer) {
            await this.writeFooter();
        }
        else if (this.paddingSize > 0) {
            await this.stream.writeBuffer(BufferUtils.zeroBuffer(this.paddingSize));
        }
    }
    async writeFrame(frame) {
        await this.stream.writeAscii(frame.id);
        if (ID3v2_FRAME_HEADER_LENGTHS.SIZE[this.head.ver] === 4) {
            await (ID3v2_FRAME_HEADER.SYNCSAVEINT.includes(this.head.ver) ? this.stream.writeSyncSafeInt(frame.size) : this.stream.writeUInt4Byte(frame.size));
        }
        else {
            await this.stream.writeUInt3Byte(frame.size);
        }
        if (ID3v2_FRAME_HEADER_LENGTHS.FLAGS[this.head.ver] !== 0) {
            await this.stream.writeBitsByte(unflags(ID3v2_FRAME_FLAGS1[this.head.ver], frame.statusFlags));
            await this.stream.writeBitsByte(unflags(ID3v2_FRAME_FLAGS2[this.head.ver], frame.formatFlags));
        }
        const frameData = (this.tagLevelUnsync() && !frame.formatFlags.unsynchronised) ? applyUnsync(frame.data) : frame.data;
        await this.stream.writeBuffer(frameData);
    }
    async write() {
        await this.writeHeader(this.frames);
        await this.writeFrames(this.frames);
        await this.writeEnd();
    }
}
//# sourceMappingURL=id3v2.writer.raw.js.map