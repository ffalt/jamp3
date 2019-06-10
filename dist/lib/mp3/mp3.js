"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mp3_reader_1 = require("./mp3_reader");
const id3v2_1 = require("../id3v2/id3v2");
const mp3_frames_1 = require("./mp3_frames");
const mp3_frame_1 = require("./mp3_frame");
const fs_extra_1 = __importDefault(require("fs-extra"));
const __1 = require("../..");
const update_file_1 = require("../common/update-file");
function analyzeBitrateMode(frames) {
    const bitRates = {};
    let duration = 0;
    let audioBytes = 0;
    let count = 0;
    frames.forEach(frame => {
        const header = mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(frame));
        bitRates[header.bitRate] = (bitRates[header.bitRate] || 0) + 1;
        duration += header.time;
        audioBytes += header.size;
        count++;
    });
    let encoded = 'CBR';
    const first = frames.length > 0 ? mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(frames[0])) : undefined;
    let bitRate = first ? first.bitRate : 0;
    const rates = Object.keys(bitRates).map(s => parseInt(s, 10));
    if (rates.length > 1) {
        encoded = 'VBR';
        let sumBitrate = 0;
        let countBitrate = 0;
        rates.forEach(rate => {
            sumBitrate += (rate * bitRates[rate]);
            countBitrate += bitRates[rate];
        });
        bitRate = Math.trunc(sumBitrate / countBitrate);
    }
    return { encoded, bitRate, duration, count, audioBytes };
}
exports.analyzeBitrateMode = analyzeBitrateMode;
class MP3 {
    prepareResult(opts, layout) {
        return __awaiter(this, void 0, void 0, function* () {
            const id3v1s = layout.tags.filter((o) => o.id === __1.ITagID.ID3v1);
            const result = { size: layout.size };
            if (opts.raw) {
                result.raw = layout;
            }
            if (opts.id3v1 || opts.id3v1IfNotid3v2) {
                const id3v1 = id3v1s.length > 0 ? id3v1s[id3v1s.length - 1] : undefined;
                if (id3v1 && id3v1.end === layout.size) {
                    result.id3v1 = id3v1;
                }
            }
            if (opts.mpeg || opts.mpegQuick) {
                const mpeg = {
                    durationEstimate: 0,
                    durationRead: 0,
                    channels: 0,
                    frameCount: 0,
                    frameCountDeclared: 0,
                    bitRate: 0,
                    sampleRate: 0,
                    sampleCount: 0,
                    audioBytes: 0,
                    audioBytesDeclared: 0,
                    version: '',
                    layer: '',
                    encoded: '',
                    mode: ''
                };
                const chain = mp3_frames_1.filterBestMPEGChain(layout.frameheaders, 50);
                result.frames = {
                    audio: chain,
                    headers: layout.headframes.map(frame => {
                        return {
                            header: mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(frame.header)),
                            mode: frame.mode,
                            xing: frame.xing,
                            vbri: frame.vbri
                        };
                    })
                };
                if (chain.length > 0) {
                    const header = mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(chain[0]));
                    mpeg.mode = header.channelType;
                    mpeg.bitRate = header.bitRate;
                    mpeg.channels = header.channelCount;
                    mpeg.sampleRate = header.samplingRate;
                    mpeg.sampleCount = header.samples;
                    mpeg.version = header.version;
                    mpeg.layer = header.layer;
                }
                const headframe = result.frames.headers[0];
                const bitRateMode = analyzeBitrateMode(chain);
                mpeg.encoded = bitRateMode.encoded;
                mpeg.bitRate = bitRateMode.bitRate;
                if (opts.mpegQuick) {
                    let audioBytes = layout.size;
                    if (chain.length > 0) {
                        audioBytes -= mp3_frame_1.rawHeaderOffSet(chain[0]);
                        if (id3v1s.length > 0) {
                            audioBytes -= 128;
                        }
                        mpeg.durationEstimate = (audioBytes * 8) / mpeg.bitRate;
                    }
                }
                else {
                    mpeg.frameCount = bitRateMode.count;
                    mpeg.audioBytes = bitRateMode.audioBytes;
                    mpeg.durationRead = Math.trunc(bitRateMode.duration) / 1000;
                    if (mpeg.frameCount > 0 && mpeg.sampleCount > 0 && mpeg.sampleRate > 0) {
                        mpeg.durationEstimate = Math.trunc(mpeg.frameCount * mpeg.sampleCount / mpeg.sampleRate * 1000) / 1000;
                    }
                }
                if (headframe) {
                    if (headframe.xing) {
                        if (headframe.xing.bytes !== undefined) {
                            mpeg.audioBytesDeclared = headframe.xing.bytes;
                        }
                        if (headframe.xing.frames !== undefined) {
                            mpeg.frameCountDeclared = headframe.xing.frames;
                        }
                        mpeg.encoded = headframe.mode === 'Xing' ? 'VBR' : 'CBR';
                    }
                    else if (headframe.vbri) {
                        mpeg.audioBytesDeclared = headframe.vbri.bytes;
                        mpeg.frameCountDeclared = headframe.vbri.frames;
                        mpeg.encoded = 'VBR';
                    }
                    if (mpeg.frameCountDeclared > 0 && mpeg.sampleCount > 0 && mpeg.sampleRate > 0) {
                        mpeg.durationEstimate = Math.trunc(mpeg.frameCountDeclared * mpeg.sampleCount / mpeg.sampleRate * 1000) / 1000;
                    }
                }
                result.mpeg = mpeg;
            }
            const id3v2s = layout.tags.filter(o => o.id === __1.ITagID.ID3v2);
            const id3v2raw = id3v2s.length > 0 ? id3v2s[0] : undefined;
            if ((opts.id3v2 || opts.id3v1IfNotid3v2) && id3v2raw) {
                result.id3v2 = yield id3v2_1.buildID3v2(id3v2raw);
            }
            return result;
        });
    }
    readStream(stream, opts, streamSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new mp3_reader_1.MP3Reader();
            const layout = yield reader.readStream(stream, Object.assign({ streamSize }, opts));
            return yield this.prepareResult(opts, layout);
        });
    }
    read(filename, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new mp3_reader_1.MP3Reader();
            const stat = yield fs_extra_1.default.stat(filename);
            const layout = yield reader.read(filename, Object.assign({ streamSize: stat.size }, opts));
            return yield this.prepareResult(opts, layout);
        });
    }
    removeTags(filename, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield fs_extra_1.default.stat(filename);
            const readerOpts = { streamSize: stat.size, id3v2: opts.id3v2, detectDuplicateID3v2: opts.id3v2, id3v1: opts.id3v1, mpegQuick: opts.id3v2 };
            let id2v1removed = false;
            let id2v2removed = false;
            yield update_file_1.updateFile(filename, readerOpts, !!opts.keepBackup, layout => {
                for (const tag of layout.tags) {
                    if (opts.id3v2 && tag.id === __1.ITagID.ID3v2 && tag.end > 0) {
                        return true;
                    }
                    else if (opts.id3v1 && tag.id === __1.ITagID.ID3v1 && tag.end === stat.size && tag.start < stat.size) {
                        return true;
                    }
                }
                return false;
            }, (layout, fileWriter) => __awaiter(this, void 0, void 0, function* () {
                let start = 0;
                let finish = stat.size;
                let specEnd = 0;
                for (const tag of layout.tags) {
                    if (tag.id === __1.ITagID.ID3v2 && opts.id3v2) {
                        if (start < tag.end) {
                            specEnd = tag.head.size + tag.start + 10;
                            start = tag.end;
                            id2v2removed = true;
                        }
                    }
                    else if (tag.id === __1.ITagID.ID3v1 && opts.id3v1 && tag.end === stat.size) {
                        if (finish > tag.start) {
                            finish = tag.start;
                            id2v1removed = true;
                        }
                    }
                }
                if (opts.id3v2) {
                    if (layout.frameheaders.length > 0) {
                        const mediastart = mp3_frame_1.rawHeaderOffSet(layout.frameheaders[0]);
                        start = specEnd < mediastart ? specEnd : mediastart;
                    }
                    else {
                        start = Math.max(start, specEnd);
                    }
                }
                if (finish > start) {
                    yield fileWriter.copyRange(filename, start, finish);
                }
            }));
            return id2v2removed || id2v1removed ? { id3v2: id2v2removed, id3v1: id2v1removed } : undefined;
        });
    }
}
exports.MP3 = MP3;
//# sourceMappingURL=mp3.js.map