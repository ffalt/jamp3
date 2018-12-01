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
const id3v1_reader_1 = require("../id3v1/id3v1_reader");
const id3v2_reader_1 = require("../id3v2/id3v2_reader");
const mp3_frame_1 = require("./mp3_frame");
const buffer_1 = require("../common/buffer");
const mp3_frames_1 = require("./mp3_frames");
class MP3Reader {
    constructor() {
        this.opts = { filename: '' };
        this.layout = {
            frames: [],
            tags: [],
            size: 0
        };
        this.id3v2reader = new id3v2_reader_1.ID3v2Reader();
        this.id3v1reader = new id3v1_reader_1.ID3v1Reader();
        this.mpegFramereader = new mp3_frame_1.MPEGFrameReader();
        this.stream = new streams_1.ReaderStream();
        this.scanMpeg = true;
        this.scanid3v1 = true;
        this.scanid3v2 = true;
        this.scanMPEGFrame = true;
        this.hasMPEGHeadFrame = false;
        this.finished = () => {
        };
    }
    readID3V1(chunk, i, readNext) {
        const tag = this.id3v1reader.readTag(chunk.slice(i, i + 128));
        if (!tag) {
            return false;
        }
        tag.start = this.stream.pos - chunk.length + i;
        tag.end = tag.start + 128;
        this.layout.tags.push(tag);
        if (!this.stream.end || chunk.length - 128 - i > 0) {
            readNext(chunk.slice(i + 1));
        }
        else {
            readNext(chunk.slice(i + 128));
        }
        return true;
    }
    readID3V2(chunk, i, reader, readNext, cb) {
        const id3Header = this.id3v2reader.readID3v2Header(chunk, i);
        if (id3Header && id3Header.valid) {
            const start = this.stream.pos - chunk.length + i;
            this.stream.unshift(chunk.slice(i));
            this.id3v2reader.readTag(reader)
                .then((result) => {
                if (!result) {
                    return cb();
                }
                let rest = result.rest || buffer_1.BufferUtils.zeroBuffer(0);
                if (result.tag && result.tag.head.valid) {
                    this.layout.tags.push(result.tag);
                    result.tag.start = start;
                    result.tag.end = this.stream.pos;
                    this.scanid3v2 = false;
                    if (this.opts.id3v1IfNotid3v2) {
                        this.scanid3v1 = false;
                    }
                }
                else {
                    rest = rest.slice(1);
                }
                readNext(rest);
            }).catch(e => {
                cb(e);
            });
            return true;
        }
        return false;
    }
    readMPEGFrame(chunk, i, header) {
        const a = this.mpegFramereader.readFrame(chunk, i, header);
        if (a.frame) {
            header.offset = this.stream.pos - chunk.length + i;
            this.layout.frames.push(a.frame);
            if (this.opts.mpegQuick) {
                this.hasMPEGHeadFrame = this.hasMPEGHeadFrame || !!a.frame.mode;
                if (this.layout.frames.length % 50 === 0) {
                    if (this.hasMPEGHeadFrame) {
                        this.scanMpeg = false;
                    }
                    else {
                        const chain = mp3_frames_1.getBestMPEGChain(this.layout.frames, 20);
                        if (chain && chain.count >= 10) {
                            this.scanMpeg = false;
                        }
                    }
                }
            }
        }
    }
    processChunk(stackLevel, chunk, cb) {
        let i = 0;
        const requestChunkLength = 1800;
        const readNext = (unwind) => {
            if (unwind && unwind.length > 0) {
                this.stream.unshift(unwind);
            }
            this.stream.read(requestChunkLength)
                .then(data => {
                if (!data || (data.length === 0)) {
                    return cb();
                }
                if (stackLevel > 1000) {
                    process.nextTick(() => {
                        this.processChunk(0, data, cb);
                    });
                }
                else {
                    this.processChunk(stackLevel + 1, data, cb);
                }
            })
                .catch(e => {
                cb(e);
            });
        };
        const demandData = () => {
            if (!this.stream.end && (chunk.length - i) < 200) {
                readNext(chunk.slice(i));
                return true;
            }
            return false;
        };
        const readMPEGFrame = () => {
            const header = this.mpegFramereader.readMPEGFrameHeader(chunk, i);
            if (header) {
                if (!this.scanMPEGFrame) {
                    header.offset = this.stream.pos - chunk.length + i;
                    this.layout.frames.push({ header });
                }
                else {
                    if (demandData()) {
                        return true;
                    }
                    this.readMPEGFrame(chunk, i, header);
                }
            }
            return false;
        };
        if (demandData()) {
            return;
        }
        if (!this.scanMpeg && !this.scanid3v2 && !this.scanid3v1) {
            if (this.opts.fileSize !== undefined) {
                return cb();
            }
            return this.stream.consumeToEnd().then(() => cb()).catch(e => cb(e));
        }
        else if (!this.scanMpeg && !this.scanid3v2) {
            if (!this.stream.end && this.stream.buffersLength > 200) {
                this.stream.skip(this.stream.buffersLength - 200);
                chunk = this.stream.get(200);
                i = 0;
            }
            while (chunk.length - i >= 4) {
                const c1 = chunk[i];
                const c2 = chunk[i + 1];
                const c3 = chunk[i + 2];
                if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
                    return;
                }
                i++;
            }
        }
        else if (!this.scanMpeg) {
            while (chunk.length - i >= 4) {
                const c1 = chunk[i];
                const c2 = chunk[i + 1];
                const c3 = chunk[i + 2];
                if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
                    return;
                }
                else if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51 && (demandData() || this.readID3V2(chunk, i, this.stream, readNext, cb))) {
                    return;
                }
                i++;
            }
        }
        else {
            while (chunk.length - i >= 4) {
                const c1 = chunk[i];
                const c2 = chunk[i + 1];
                const c3 = chunk[i + 2];
                if (this.scanMpeg && c1 === 255 && readMPEGFrame()) {
                    return;
                }
                else if (this.scanid3v1 && c1 === 84 && c2 === 65 && c3 === 71 && (demandData() || this.readID3V1(chunk, i, readNext))) {
                    return;
                }
                else if (this.scanid3v2 && c1 === 73 && c2 === 68 && c3 === 51 && (demandData() || this.readID3V2(chunk, i, this.stream, readNext, cb))) {
                    return;
                }
                i++;
            }
        }
        if (chunk.length > 3) {
            return readNext(chunk.slice(chunk.length - 3));
        }
        readNext();
    }
    scan() {
        if (this.stream.end) {
            return this.finished(undefined, this.layout);
        }
        this.processChunk(0, buffer_1.BufferUtils.zeroBuffer(0), (err2) => {
            if (err2) {
                return this.finished(err2);
            }
            if (this.opts.fileSize !== undefined) {
                this.layout.size = this.opts.fileSize;
            }
            else {
                this.layout.size = this.stream.pos;
            }
            return this.finished(undefined, this.layout);
        });
    }
    read(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            this.opts = opts;
            this.scanMpeg = opts.mpeg || opts.mpegQuick || false;
            this.scanid3v1 = opts.id3v1 || opts.id3v1IfNotid3v2 || false;
            this.scanid3v2 = opts.id3v2 || opts.id3v1IfNotid3v2 || false;
            return new Promise((resolve, reject) => {
                this.finished = (err, layout) => {
                    this.stream.close();
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(layout);
                    }
                };
                this.stream.open(opts.filename)
                    .then(() => {
                    this.scan();
                })
                    .catch(e => reject(e));
            });
        });
    }
}
exports.MP3Reader = MP3Reader;
//# sourceMappingURL=mp3_reader.js.map