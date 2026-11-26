import { mpeg_bitrates, mpeg_channel_count, mpeg_channel_mode_jointstereoIdx, mpeg_channel_mode_types, mpeg_channel_modes, mpeg_emphasis, mpeg_frame_samples, mpeg_layer_joint_extension, mpeg_layer_names_long, mpeg_slot_size, mpeg_srates, mpeg_version_names_long } from './mp3.mpeg.consts.js';
import { isBit } from '../common/utils.js';
import { BufferReader } from '../common/buffer-reader.js';
import { Markers } from '../common/marker.js';
export function sideInfoSize(header) {
    if (header.layerIdx !== 1) {
        return 0;
    }
    const mpeg1 = header.versionIdx === 3;
    const mono = header.modeIdx === 3;
    if (mpeg1) {
        return mono ? 17 : 32;
    }
    return mono ? 9 : 17;
}
export function collapseRawHeader(header) {
    return [
        header.offset,
        header.size,
        header.front,
        header.back
    ];
}
export function rawHeaderOffSet(header) {
    return header[0];
}
export function rawHeaderSize(header) {
    return header[1];
}
export function rawHeaderVersionIdx(header) {
    return (header[2] >> 3) & 0x3;
}
export function rawHeaderLayerIdx(header) {
    return (header[2] >> 1) & 0x3;
}
export function expandMPEGFrameFlags(front, back, offset) {
    const hasSync = (front & 65504) === 65504;
    const validVer = (front & 0x18) !== 0x8;
    const validLayer = (front & 0x6) !== 0x0;
    const validBitRate = (back & 61440) !== 61440;
    const validSample = (back & 3072) !== 3072;
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
    if (mpeg_bitrates[versionIdx] &&
        mpeg_bitrates[versionIdx][layerIdx] &&
        (mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] > 0) &&
        mpeg_srates[versionIdx] &&
        (mpeg_srates[versionIdx][sampleIdx] > 0) &&
        mpeg_frame_samples[versionIdx] &&
        (mpeg_frame_samples[versionIdx][layerIdx] > 0) &&
        (mpeg_slot_size[layerIdx] > 0)) {
        const bitrate = mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] * 1000;
        const samprate = mpeg_srates[versionIdx][sampleIdx];
        const samples = mpeg_frame_samples[versionIdx][layerIdx];
        const slot_size = mpeg_slot_size[layerIdx];
        const bps = samples / 8;
        const slots = Math.floor(((bps / slot_size) * bitrate) / samprate);
        const size = (slots * slot_size) + ((padded) ? slot_size : 0);
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
export function expandRawHeaderArray(header) {
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
export function expandRawHeader(header) {
    const samplingRate = mpeg_srates[header.versionIdx][header.sampleIdx];
    const samples = mpeg_frame_samples[header.versionIdx][header.layerIdx];
    const time = samplingRate > 0 ? (samples / samplingRate) * 1000 : 0;
    return {
        ...header,
        time,
        version: mpeg_version_names_long[header.versionIdx],
        layer: mpeg_layer_names_long[header.layerIdx],
        channelMode: mpeg_channel_modes[header.modeIdx],
        channelType: mpeg_channel_mode_types[header.modeIdx],
        channelCount: mpeg_channel_count[header.modeIdx],
        extension: header.modeIdx === mpeg_channel_mode_jointstereoIdx ? mpeg_layer_joint_extension[header.layerIdx][header.modeExtIdx] : undefined,
        emphasis: mpeg_emphasis[header.emphasisIdx],
        samplingRate,
        bitRate: mpeg_bitrates[header.versionIdx][header.layerIdx][header.bitrateIdx] * 1000,
        samples
    };
}
export class MPEGFrameReader {
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
        const reader = new BufferReader(data);
        reader.position = offset;
        frame.mode = reader.readFixedAsciiString(4);
        const version = reader.readSInt(2);
        const delay = reader.readSInt(2);
        const quality = reader.readSInt(2);
        const bytes = reader.readUInt(4);
        const frames = reader.readUInt(4);
        const toc_entries = reader.readSInt(2);
        const toc_scale = reader.readSInt(2);
        const toc_entry_size = reader.readSInt(2);
        const toc_frames = reader.readSInt(2);
        const toc_size = toc_entries * toc_entry_size;
        const toc = reader.readBuffer(toc_size);
        frame.vbri = {
            version,
            delay,
            quality,
            bytes,
            frames,
            toc_entries,
            toc_scale,
            toc_entry_size,
            toc_frames,
            toc
        };
        return reader.position;
    }
    readXing(data, frame, offset) {
        const reader = new BufferReader(data);
        reader.position = offset;
        frame.mode = reader.readFixedAsciiString(4);
        const field = reader.readSInt(4);
        frame.xing = {
            fields: {
                frames: isBit(field, 1),
                bytes: isBit(field, 2),
                toc: isBit(field, 4),
                quality: isBit(field, 8)
            }
        };
        if (frame.xing.fields.frames) {
            frame.xing.frames = reader.readUInt(4);
        }
        if (frame.xing.fields.bytes) {
            frame.xing.bytes = reader.readUInt(4);
        }
        if (frame.xing.fields.toc) {
            frame.xing.toc = reader.readBuffer(100);
        }
        if (frame.xing.fields.quality) {
            frame.xing.quality = reader.readSInt(4);
        }
        return reader.position;
    }
    readFrame(chunk, offset, header, scanVbrHeader) {
        const frame = { header: collapseRawHeader(header) };
        let off = 0;
        if (scanVbrHeader) {
            const xingOffset = offset + 4 + sideInfoSize(header);
            if (Markers.isMarker(chunk, xingOffset, Markers.MARKERS.xing) || Markers.isMarker(chunk, xingOffset, Markers.MARKERS.info)) {
                off = this.readXing(chunk, frame, xingOffset);
            }
            else {
                const vbriOffset = offset + 4 + 32;
                if (Markers.isMarker(chunk, vbriOffset, Markers.MARKERS.vbri)) {
                    off = this.readVbri(chunk, frame, vbriOffset);
                }
            }
        }
        return { offset: off, frame };
    }
}
//# sourceMappingURL=mp3.mpeg.frame.js.map