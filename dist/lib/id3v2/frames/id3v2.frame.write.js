"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getWriteTextEncoding = exports.writeRawFrames = exports.writeRawSubFrames = void 0;
const zlib = __importStar(require("zlib"));
const stream_writer_memory_1 = require("../../common/stream-writer-memory");
const id3v2_frame_match_1 = require("./id3v2.frame.match");
const id3v2_header_consts_1 = require("../id3v2.header.consts");
const buffer_1 = require("../../common/buffer");
const encodings_1 = require("../../common/encodings");
const id3v2_frame_version_1 = require("./id3v2.frame.version");
const id3v2_writer_raw_1 = require("../id3v2.writer.raw");
function writeRawSubFrames(frames, stream, head, defaultEncoding) {
    return __awaiter(this, void 0, void 0, function* () {
        const writer = new id3v2_writer_raw_1.Id3v2RawWriter(stream, head, { paddingSize: 0 });
        const rawframes = yield writeRawFrames(frames, head, defaultEncoding);
        for (const frame of rawframes) {
            yield writer.writeFrame(frame);
        }
    });
}
exports.writeRawSubFrames = writeRawSubFrames;
function writeRawFrames(frames, head, defaultEncoding) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        for (const frame of frames) {
            const raw = yield writeRawFrame(frame, head, defaultEncoding);
            result.push(raw);
        }
        return result;
    });
}
exports.writeRawFrames = writeRawFrames;
function writeRawFrame(frame, head, defaultEncoding) {
    return __awaiter(this, void 0, void 0, function* () {
        const frameHead = frame.head || {
            size: 0,
            statusFlags: {},
            formatFlags: {}
        };
        let id = frame.id;
        let data;
        if (frame.invalid) {
            const val = frame.value;
            if (!val.bin) {
                return Promise.reject(Error('Invalid frame definition (trying to write a frame with parser error)'));
            }
            data = val.bin;
        }
        else {
            const stream = new stream_writer_memory_1.MemoryWriterStream();
            const orgDef = (0, id3v2_frame_match_1.matchFrame)(frame.id);
            if (orgDef.versions.indexOf(head.ver) < 0) {
                const toWriteFrameID = (0, id3v2_frame_version_1.ensureID3v2FrameVersionDef)(frame.id, head.ver);
                if (!toWriteFrameID) {
                    yield orgDef.impl.write(frame, stream, head, defaultEncoding);
                }
                else {
                    id = toWriteFrameID;
                    const toWriteFrameDef = (0, id3v2_frame_match_1.matchFrame)(toWriteFrameID);
                    yield toWriteFrameDef.impl.write(frame, stream, head, defaultEncoding);
                }
            }
            else {
                yield orgDef.impl.write(frame, stream, head, defaultEncoding);
            }
            data = stream.toBuffer();
            if ((frameHead.formatFlags) && (frameHead.formatFlags.compressed)) {
                const sizebytes = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
                const uncompressedStream = new stream_writer_memory_1.MemoryWriterStream();
                if (sizebytes === 4) {
                    yield uncompressedStream.writeUInt4Byte(data.length);
                }
                else {
                    yield uncompressedStream.writeUInt3Byte(data.length);
                }
                data = buffer_1.BufferUtils.concatBuffer(uncompressedStream.toBuffer(), zlib.deflateSync(data));
            }
            else if ((frameHead.formatFlags) && (frameHead.formatFlags.dataLengthIndicator)) {
                const dataLengthStream = new stream_writer_memory_1.MemoryWriterStream();
                yield dataLengthStream.writeSyncSafeInt(data.length);
                data = buffer_1.BufferUtils.concatBuffer(dataLengthStream.toBuffer(), data);
            }
        }
        if (frameHead.formatFlags && frameHead.formatFlags.grouping) {
            if (frame.groupId === undefined) {
                return Promise.reject(Error('Missing frame groupId but flag is set'));
            }
            const buf = buffer_1.BufferUtils.zeroBuffer(1);
            buf[0] = frame.groupId;
            data = buffer_1.BufferUtils.concatBuffer(buf, data);
        }
        return { id: id, start: 0, end: 0, size: data.length, data: data, statusFlags: frameHead.statusFlags || {}, formatFlags: frameHead.formatFlags || {} };
    });
}
function getWriteTextEncoding(frame, head, defaultEncoding) {
    let encoding = (frame.head ? frame.head.encoding : undefined) || defaultEncoding;
    if (!encoding || !encodings_1.Encodings[encoding]) {
        encoding = (head.ver === 4) ? 'utf-8' : 'ucs2';
    }
    return encodings_1.Encodings[encoding] || encodings_1.ascii;
}
exports.getWriteTextEncoding = getWriteTextEncoding;
//# sourceMappingURL=id3v2.frame.write.js.map