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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MP3Reader = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const id3v1_reader_1 = require("../id3v1/id3v1.reader");
const id3v2_reader_1 = require("../id3v2/id3v2.reader");
const mp3_mpeg_frame_1 = require("./mp3.mpeg.frame");
const buffer_1 = require("../common/buffer");
const mp3_mpeg_chain_1 = require("./mp3.mpeg.chain");
const stream_reader_1 = require("../common/stream-reader");
class MP3Reader {
    constructor() {
        this.options = {};
        this.layout = {
            frameheaders: [],
            headframes: [],
            tags: [],
            size: 0
        };
        this.id3v2reader = new id3v2_reader_1.ID3v2Reader();
        this.id3v1reader = new id3v1_reader_1.ID3v1Reader();
        this.mpegFramereader = new mp3_mpeg_frame_1.MPEGFrameReader();
        this.stream = new stream_reader_1.ReaderStream();
        this.scanMpeg = true;
        this.scanid3v1 = true;
        this.scanid3v2 = true;
        this.scanMPEGFrame = true;
        this.hasMPEGHeadFrame = false;
    }
    readFullMPEGFrame(chunk, pos, header) {
        if (this.demandData(chunk, pos)) {
            return true;
        }
        header.offset = this.stream.pos - chunk.length + pos;
        const a = this.mpegFramereader.readFrame(chunk, pos, header);
        if (a.frame) {
            if (a.frame.vbri || a.frame.xing) {
                this.layout.headframes.push(a.frame);
            }
            this.layout.frameheaders.push(a.frame.header);
            if (this.options.mpegQuick) {
                this.hasMPEGHeadFrame = this.hasMPEGHeadFrame || !!a.frame.mode;
                if (this.layout.frameheaders.length % 50 === 0) {
                    if (this.hasMPEGHeadFrame) {
                        this.scanMpeg = false;
                    }
                    else {
                        const chain = mp3_mpeg_chain_1.getBestMPEGChain(this.layout.frameheaders, 20);
                        if (chain && chain.count >= 10) {
                            this.scanMpeg = false;
                        }
                    }
                }
            }
        }
        return false;
    }
    readMPEGFrame(chunk, pos) {
        if (this.demandData(chunk, pos)) {
            return true;
        }
        const header = this.mpegFramereader.readMPEGFrameHeader(chunk, pos);
        if (header) {
            this.scanid3v2 = false;
            if (!this.scanMPEGFrame) {
                header.offset = this.stream.pos - chunk.length + pos;
                this.layout.frameheaders.push(mp3_mpeg_frame_1.collapseRawHeader(header));
            }
            else {
                return this.readFullMPEGFrame(chunk, pos, header);
            }
        }
        return false;
    }
    readID3V1(chunk, pos) {
        if (this.demandData(chunk, pos)) {
            return true;
        }
        const tag = this.id3v1reader.readTag(chunk.slice(pos, pos + 128));
        if (!tag) {
            return false;
        }
        tag.start = this.stream.pos - chunk.length + pos;
        tag.end = tag.start + 128;
        this.layout.tags.push(tag);
        if (!this.stream.end || chunk.length - 128 - pos > 0) {
            this.stream.unshift(chunk.slice(pos + 1));
        }
        else {
            this.stream.unshift(chunk.slice(pos + 128));
        }
        return true;
    }
    readID3V2(chunk, pos) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.demandData(chunk, pos)) {
                return true;
            }
            const id3Header = this.id3v2reader.headerReader.readID3v2Header(chunk, pos);
            if (!id3Header || !id3Header.valid) {
                return false;
            }
            const start = this.stream.pos - chunk.length + pos;
            this.stream.unshift(chunk.slice(pos));
            const result = yield this.id3v2reader.readReaderStream(this.stream);
            if (result) {
                let rest = result.rest || buffer_1.BufferUtils.zeroBuffer(0);
                if (result.tag && result.tag.head.valid) {
                    this.layout.tags.push(result.tag);
                    result.tag.start = start;
                    result.tag.end = this.stream.pos - rest.length;
                    if (!this.options.detectDuplicateID3v2) {
                        this.scanid3v2 = false;
                    }
                    if (this.options.id3v1IfNotID3v2) {
                        this.scanid3v1 = false;
                    }
                }
                else {
                    rest = rest.slice(1);
                }
                this.stream.unshift(rest);
                return true;
            }
            return false;
        });
    }
    processChunkToEnd(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.streamSize !== undefined) {
                return false;
            }
            yield this.stream.consumeToEnd();
            return false;
        });
    }
    processChunkID3v1(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            let pos = 0;
            if (!this.stream.end && (this.stream.buffersLength > 200)) {
                this.stream.skip(this.stream.buffersLength - 200);
                chunk = this.stream.get(200);
                pos = 0;
            }
            while (chunk.length - pos >= 4) {
                const c1 = chunk[pos];
                const c2 = chunk[pos + 1];
                const c3 = chunk[pos + 2];
                if ((c1 === 84) && (c2 === 65) && (c3 === 71) && this.readID3V1(chunk, pos)) {
                    return true;
                }
                pos++;
            }
            return false;
        });
    }
    processChunkID3v1AndID3v2AndMpeg(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            let pos = 0;
            while (chunk.length - pos >= 4) {
                const c1 = chunk[pos];
                const c2 = chunk[pos + 1];
                const c3 = chunk[pos + 2];
                if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51 && (yield this.readID3V2(chunk, pos))) {
                    return true;
                }
                else if (this.scanMpeg && c1 === 255 && this.readMPEGFrame(chunk, pos)) {
                    return true;
                }
                else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && this.readID3V1(chunk, pos)) {
                    return true;
                }
                pos++;
            }
            return false;
        });
    }
    processChunkID3v1AndID3v2(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            let pos = 0;
            while (chunk.length - pos >= 4) {
                const c1 = chunk[pos];
                const c2 = chunk[pos + 1];
                const c3 = chunk[pos + 2];
                if ((c1 === 73 && c2 === 68 && c3 === 51) && (yield this.readID3V2(chunk, pos))) {
                    return true;
                }
                else if ((c1 === 84 && c2 === 65 && c3 === 71) && this.readID3V1(chunk, pos)) {
                    return true;
                }
                pos++;
            }
            return false;
        });
    }
    demandData(chunk, pos) {
        if (!this.stream.end && (chunk.length - pos) < 200) {
            this.stream.unshift(chunk.slice(pos));
            return true;
        }
        return false;
    }
    processChunk(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.demandData(chunk, 0)) {
                return true;
            }
            if (!this.scanMpeg && !this.scanid3v2 && !this.scanid3v1) {
                return this.processChunkToEnd(chunk);
            }
            else if (!this.scanMpeg && !this.scanid3v2) {
                if (yield this.processChunkID3v1(chunk)) {
                    return true;
                }
            }
            else if (!this.scanMpeg) {
                if (yield this.processChunkID3v1AndID3v2(chunk)) {
                    return true;
                }
            }
            else if (yield this.processChunkID3v1AndID3v2AndMpeg(chunk)) {
                return true;
            }
            if (chunk.length > 3) {
                this.stream.unshift(chunk.slice(chunk.length - 3));
            }
            return true;
        });
    }
    scan() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stream.end) {
                return;
            }
            const requestChunkLength = 20000;
            let go = true;
            while (go) {
                const data = yield this.stream.read(requestChunkLength);
                if (!data || (data.length === 0)) {
                    go = false;
                    break;
                }
                try {
                    go = yield this.processChunk(data);
                }
                catch (e) {
                    return Promise.reject(e);
                }
            }
            this.layout.size = (this.options.streamSize !== undefined) ? this.options.streamSize : this.stream.pos;
        });
    }
    setOptions(options) {
        this.options = options || {};
        this.scanMpeg = options.mpeg || options.mpegQuick || false;
        this.scanid3v1 = options.id3v1 || options.id3v1IfNotID3v2 || false;
        this.scanid3v2 = options.id3v2 || options.id3v1IfNotID3v2 || false;
        this.layout = {
            headframes: [],
            frameheaders: [],
            tags: [],
            size: 0
        };
    }
    read(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setOptions(options);
            if (!options.streamSize) {
                options.streamSize = (yield fs_extra_1.default.stat(filename)).size;
            }
            yield this.stream.open(filename);
            try {
                yield this.scan();
                this.stream.close();
            }
            catch (e) {
                this.stream.close();
                return Promise.reject(e);
            }
            return this.layout;
        });
    }
    readStream(stream, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setOptions(options);
            yield this.stream.openStream(stream);
            yield this.scan();
            return this.layout;
        });
    }
}
exports.MP3Reader = MP3Reader;
//# sourceMappingURL=mp3.reader.js.map