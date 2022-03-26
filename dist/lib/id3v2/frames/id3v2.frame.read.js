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
exports.readID3v2Frame = exports.readSubFrames = exports.buildID3v2 = void 0;
const zlib = __importStar(require("zlib"));
const types_1 = require("../../common/types");
const buffer_reader_1 = require("../../common/buffer-reader");
const id3v2_header_consts_1 = require("../id3v2.header.consts");
const id3v2_reader_1 = require("../id3v2.reader");
const id3v2_frame_match_1 = require("./id3v2.frame.match");
const id3v2_frame_unsync_1 = require("./id3v2.frame.unsync");
function processRawFrame(frame, head) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((frame.formatFlags) && (frame.formatFlags.encrypted)) {
            return Promise.reject(Error('Frame Encryption currently not supported'));
        }
        if ((frame.formatFlags) && (frame.formatFlags.unsynchronised)) {
            frame.data = (0, id3v2_frame_unsync_1.removeUnsync)(frame.data);
        }
        if ((frame.formatFlags) && (frame.formatFlags.compressed)) {
            let data = frame.data;
            if (frame.formatFlags.compressed) {
                const sizebytes = id3v2_header_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
                data = data.slice(sizebytes);
            }
            return new Promise((resolve, reject) => {
                zlib.inflate(data, (err, result) => {
                    if (!err && result) {
                        frame.data = result;
                        resolve();
                    }
                    zlib.gunzip(data, (err2, result2) => {
                        if (!err2 && result2) {
                            frame.data = result;
                            resolve();
                        }
                        reject('Decompressing frame failed');
                    });
                });
            });
        }
        else if ((frame.formatFlags) && (frame.formatFlags.dataLengthIndicator)) {
            frame.data = frame.data.slice(4);
        }
    });
}
function buildID3v2(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const frames = [];
        for (const frame of tag.frames) {
            const f = yield readID3v2Frame(frame, tag.head);
            frames.push(f);
        }
        return {
            id: tag.id,
            start: tag.start,
            end: tag.end,
            head: tag.head,
            frames: frames
        };
    });
}
exports.buildID3v2 = buildID3v2;
function readSubFrames(bin, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const subtag = { id: types_1.ITagID.ID3v2, head, frames: [], start: 0, end: 0 };
        const reader = new id3v2_reader_1.ID3v2Reader();
        yield reader.readFrames(bin, subtag);
        const t = yield buildID3v2(subtag);
        return t.frames;
    });
}
exports.readSubFrames = readSubFrames;
function readID3v2Frame(rawFrame, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = (0, id3v2_frame_match_1.matchFrame)(rawFrame.id);
        let groupId;
        if (rawFrame.formatFlags && rawFrame.formatFlags.grouping) {
            groupId = rawFrame.data[0];
            rawFrame.data = rawFrame.data.slice(1);
        }
        const frame = {
            id: rawFrame.id,
            head: {
                encoding: undefined,
                statusFlags: rawFrame.statusFlags,
                formatFlags: rawFrame.formatFlags,
                size: rawFrame.size
            },
            value: {}
        };
        let result;
        try {
            yield processRawFrame(rawFrame, head);
            const reader = new buffer_reader_1.BufferReader(rawFrame.data);
            result = yield f.impl.parse(reader, rawFrame, head);
            if (frame.head) {
                frame.head.encoding = result.encoding ? result.encoding.name : undefined;
            }
            frame.value = result.value || { bin: rawFrame.data };
            if (result.subframes) {
                frame.subframes = result.subframes;
            }
        }
        catch (e) {
            frame.invalid = e.toString();
            frame.value = { bin: rawFrame.data };
        }
        if (groupId) {
            frame.groupId = groupId;
        }
        frame.title = f.title;
        return frame;
    });
}
exports.readID3v2Frame = readID3v2Frame;
//# sourceMappingURL=id3v2.frame.read.js.map