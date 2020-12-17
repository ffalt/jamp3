"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPEGFrameReader = exports.expandRawHeader = exports.expandRawHeaderArray = exports.expandMPEGFrameFlags = exports.rawHeaderLayerIdx = exports.rawHeaderVersionIdx = exports.rawHeaderSize = exports.rawHeaderOffSet = exports.collapseRawHeader = void 0;
const mp3_mpeg_consts_1 = require("./mp3.mpeg.consts");
const utils_1 = require("../common/utils");
const buffer_reader_1 = require("../common/buffer-reader");
function collapseRawHeader(header) {
    return [
        header.offset,
        header.size,
        header.front,
        header.back
    ];
}
exports.collapseRawHeader = collapseRawHeader;
function rawHeaderOffSet(header) {
    return header[0];
}
exports.rawHeaderOffSet = rawHeaderOffSet;
function rawHeaderSize(header) {
    return header[1];
}
exports.rawHeaderSize = rawHeaderSize;
function rawHeaderVersionIdx(header) {
    return (header[2] >> 3) & 0x3;
}
exports.rawHeaderVersionIdx = rawHeaderVersionIdx;
function rawHeaderLayerIdx(header) {
    return (header[2] >> 1) & 0x3;
}
exports.rawHeaderLayerIdx = rawHeaderLayerIdx;
function expandMPEGFrameFlags(front, back, offset) {
    const hasSync = (front & 0xFFE0) === 0xFFE0;
    const validVer = (front & 0x18) !== 0x8;
    const validLayer = (front & 0x6) !== 0x0;
    const validBitRate = (back & 0xF000) !== 0xF000;
    const validSample = (back & 0xC00) !== 0xC00;
    if (!hasSync || !validVer || !validLayer || !validBitRate || !validSample) {
        return null;
    }
    const versionIdx = (front >> 3) & 0x3;
    const layerIdx = (front >> 1) & 0x3;
    const protection = (front & 0x1) === 0;
    const bitrateIdx = back >> 12;
    const sampleIdx = (back >> 10) & 0x3;
    const padded = ((back >> 9) & 0x1) === 1;
    const privatebit = ((back >> 8) & 0x1);
    const modeIdx = (back >> 6) & 0x3;
    const modeExtIdx = (back >> 4) & 0x3;
    const copyright = ((back >> 3) & 0x1) === 1;
    const original = ((back >> 2) & 0x1) === 1;
    const emphasisIdx = back & 0x3;
    if (mp3_mpeg_consts_1.mpeg_bitrates[versionIdx] && mp3_mpeg_consts_1.mpeg_bitrates[versionIdx][layerIdx] && (mp3_mpeg_consts_1.mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] > 0) &&
        mp3_mpeg_consts_1.mpeg_srates[versionIdx] && (mp3_mpeg_consts_1.mpeg_srates[versionIdx][sampleIdx] > 0) &&
        mp3_mpeg_consts_1.mpeg_frame_samples[versionIdx] && (mp3_mpeg_consts_1.mpeg_frame_samples[versionIdx][layerIdx] > 0) &&
        (mp3_mpeg_consts_1.mpeg_slot_size[layerIdx] > 0)) {
        const bitrate = mp3_mpeg_consts_1.mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] * 1000;
        const samprate = mp3_mpeg_consts_1.mpeg_srates[versionIdx][sampleIdx];
        const samples = mp3_mpeg_consts_1.mpeg_frame_samples[versionIdx][layerIdx];
        const slot_size = mp3_mpeg_consts_1.mpeg_slot_size[layerIdx];
        const bps = samples / 8.0;
        const size = Math.floor(((bps * bitrate) / samprate)) + ((padded) ? slot_size : 0);
        return {
            offset,
            front,
            back,
            size,
            versionIdx,
            layerIdx,
            sampleIdx,
            bitrateIdx,
            modeIdx,
            modeExtIdx,
            emphasisIdx,
            padded,
            protected: protection,
            copyright,
            original,
            privatebit
        };
    }
    return null;
}
exports.expandMPEGFrameFlags = expandMPEGFrameFlags;
function expandRawHeaderArray(header) {
    const result = expandMPEGFrameFlags(header[2], header[3], header[0]);
    if (!result) {
        return {
            offset: 0,
            size: 0,
            versionIdx: 0,
            layerIdx: 0,
            front: 0,
            back: 0,
            sampleIdx: 0,
            bitrateIdx: 0,
            modeIdx: 0,
            modeExtIdx: 0,
            emphasisIdx: 0,
            padded: false,
            protected: false,
            copyright: false,
            original: false,
            privatebit: 0
        };
    }
    return result;
}
exports.expandRawHeaderArray = expandRawHeaderArray;
function expandRawHeader(header) {
    const samplingRate = mp3_mpeg_consts_1.mpeg_srates[header.versionIdx][header.sampleIdx];
    const samples = mp3_mpeg_consts_1.mpeg_frame_samples[header.versionIdx][header.layerIdx];
    const time = samplingRate > 0 ? (samples / samplingRate) * 1000 : 0;
    return Object.assign(Object.assign({}, header), { time, version: mp3_mpeg_consts_1.mpeg_version_names_long[header.versionIdx], layer: mp3_mpeg_consts_1.mpeg_layer_names_long[header.layerIdx], channelMode: mp3_mpeg_consts_1.mpeg_channel_modes[header.modeIdx], channelType: mp3_mpeg_consts_1.mpeg_channel_mode_types[header.modeIdx], channelCount: mp3_mpeg_consts_1.mpeg_channel_count[header.modeIdx], extension: header.modeIdx === mp3_mpeg_consts_1.mpeg_channel_mode_jointstereoIdx ? mp3_mpeg_consts_1.mpeg_layer_joint_extension[header.layerIdx][header.modeExtIdx] : undefined, emphasis: mp3_mpeg_consts_1.mpeg_emphasis[header.emphasisIdx], samplingRate, bitRate: mp3_mpeg_consts_1.mpeg_bitrates[header.versionIdx][header.layerIdx][header.bitrateIdx] * 1000, samples });
}
exports.expandRawHeader = expandRawHeader;
class MPEGFrameReader {
    readMPEGFrameHeader(buffer, offset) {
        if (buffer.length - offset < 4) {
            return null;
        }
        const front = buffer.readUInt16BE(offset);
        const back = buffer.readUInt16BE(offset + 2);
        return expandMPEGFrameFlags(front, back, offset);
    }
    verfiyCRC() {
    }
    readLame() {
    }
    readVbri(data, frame, offset) {
        const reader = new buffer_reader_1.BufferReader(data);
        reader.position = offset;
        frame.mode = reader.readFixedAsciiString(4);
        const version = reader.readSInt(2);
        const delay = reader.readSInt(2);
        const quality = reader.readSInt(2);
        const bytes = reader.readSInt(4);
        const frames = reader.readSInt(4);
        const toc_entries = reader.readSInt(2);
        const toc_scale = reader.readSInt(2);
        const toc_entry_size = reader.readSInt(2);
        const toc_frames = reader.readSInt(2);
        const toc_size = toc_entries * toc_entry_size;
        const toc = reader.readBuffer(toc_size);
        frame.vbri = {
            version, delay, quality, bytes, frames,
            toc_entries, toc_scale, toc_entry_size, toc_frames, toc
        };
        return reader.position;
    }
    readXing(data, frame, offset) {
        const reader = new buffer_reader_1.BufferReader(data);
        reader.position = offset;
        frame.mode = reader.readFixedAsciiString(4);
        const field = reader.readSInt(4);
        frame.xing = {
            fields: {
                frames: utils_1.isBit(field, 1),
                bytes: utils_1.isBit(field, 2),
                toc: utils_1.isBit(field, 4),
                quality: utils_1.isBit(field, 8)
            }
        };
        if (frame.xing.fields.frames) {
            frame.xing.frames = reader.readSInt(4);
        }
        if (frame.xing.fields.bytes) {
            frame.xing.bytes = reader.readSInt(4);
        }
        if (frame.xing.fields.toc) {
            frame.xing.toc = reader.readBuffer(100);
        }
        if (frame.xing.fields.quality) {
            frame.xing.quality = reader.readSInt(4);
        }
        return reader.position;
    }
    readFrame(chunk, offset, header) {
        const frame = { header: collapseRawHeader(header) };
        let off = 0;
        const length = offset + Math.min(40, chunk.length - 4 - offset);
        for (let i = offset; i < length; i++) {
            const c = chunk[i];
            const c2 = chunk[i + 1];
            const c3 = chunk[i + 2];
            const c4 = chunk[i + 3];
            if ((c === 88 && c2 === 105 && c3 === 110 && c4 === 103) ||
                (c === 73 && c2 === 110 && c3 === 102 && c4 === 111)) {
                off = this.readXing(chunk, frame, i);
            }
            else if (c === 86 && c2 === 66 && c3 === 82 && c4 === 73) {
                off = this.readVbri(chunk, frame, i);
            }
            if (off > 0) {
                break;
            }
        }
        return { offset: off, frame };
    }
}
exports.MPEGFrameReader = MPEGFrameReader;
//# sourceMappingURL=mp3.mpeg.frame.js.map