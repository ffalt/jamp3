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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareResult = exports.prepareResultID3v2 = exports.prepareResultID3v1 = void 0;
const __1 = require("../..");
const mp3_mpeg_chain_1 = require("./mp3.mpeg.chain");
const mp3_mpeg_frame_1 = require("./mp3.mpeg.frame");
const mp3_bitrate_1 = require("./mp3.bitrate");
const id3v2_frame_read_1 = require("../id3v2/frames/id3v2.frame.read");
function calculateDuration(frameCount, sampleCount, sampleRate) {
    if (frameCount > 0 && sampleCount > 0 && sampleRate > 0) {
        return Math.trunc(frameCount * sampleCount / sampleRate * 1000) / 1000;
    }
    return 0;
}
function buildFrames(chain, layout) {
    const frames = {
        audio: chain,
        headers: layout.headframes.map(frame => {
            return {
                header: (0, mp3_mpeg_frame_1.expandRawHeader)((0, mp3_mpeg_frame_1.expandRawHeaderArray)(frame.header)),
                mode: frame.mode,
                xing: frame.xing,
                vbri: frame.vbri
            };
        })
    };
    return frames;
}
function setResultBase(chain, mpeg) {
    const header = (0, mp3_mpeg_frame_1.expandRawHeader)((0, mp3_mpeg_frame_1.expandRawHeaderArray)(chain[0]));
    mpeg.mode = header.channelType;
    mpeg.bitRate = header.bitRate;
    mpeg.channels = header.channelCount;
    mpeg.sampleRate = header.samplingRate;
    mpeg.sampleCount = header.samples;
    mpeg.version = header.version;
    mpeg.layer = header.layer;
}
function setResultEstimate(layout, chain, mpeg) {
    let audioBytes = layout.size;
    if (chain.length > 0) {
        audioBytes -= (0, mp3_mpeg_frame_1.rawHeaderOffSet)(chain[0]);
        if (layout.tags.find(t => t.id === __1.ITagID.ID3v1)) {
            audioBytes -= 128;
        }
        mpeg.durationEstimate = (audioBytes * 8) / mpeg.bitRate;
    }
}
function setResultCalculated(frameCount, audioBytes, duration, mpeg) {
    mpeg.frameCount = frameCount;
    mpeg.audioBytes = audioBytes;
    mpeg.durationRead = Math.trunc(duration) / 1000;
    mpeg.durationEstimate = calculateDuration(mpeg.frameCount, mpeg.sampleCount, mpeg.sampleRate);
}
function setResultHeadFrame(headframe, mpeg) {
    if (headframe.xing) {
        mpeg.audioBytesDeclared = headframe.xing.bytes || 0;
        mpeg.frameCountDeclared = headframe.xing.frames || 0;
        mpeg.encoded = headframe.mode === 'Xing' ? 'VBR' : 'CBR';
    }
    else if (headframe.vbri) {
        mpeg.audioBytesDeclared = headframe.vbri.bytes;
        mpeg.frameCountDeclared = headframe.vbri.frames;
        mpeg.encoded = 'VBR';
    }
    mpeg.durationEstimate = calculateDuration(mpeg.frameCountDeclared, mpeg.sampleCount, mpeg.sampleRate);
}
function defaultMPEGResult() {
    return {
        durationEstimate: 0, durationRead: 0, channels: 0, frameCount: 0, frameCountDeclared: 0, bitRate: 0,
        sampleRate: 0, sampleCount: 0, audioBytes: 0, audioBytesDeclared: 0,
        version: '', layer: '', encoded: '', mode: ''
    };
}
function prepareResultMPEG(options, layout) {
    return __awaiter(this, void 0, void 0, function* () {
        const mpeg = defaultMPEGResult();
        const chain = (0, mp3_mpeg_chain_1.filterBestMPEGChain)(layout.frameheaders, 50);
        const frames = buildFrames(chain, layout);
        const bitRateMode = (0, mp3_bitrate_1.analyzeBitrateMode)(chain);
        if (chain.length > 0) {
            setResultBase(chain, mpeg);
        }
        mpeg.encoded = bitRateMode.encoded;
        mpeg.bitRate = bitRateMode.bitRate;
        if (options.mpegQuick) {
            setResultEstimate(layout, chain, mpeg);
        }
        else {
            setResultCalculated(bitRateMode.count, bitRateMode.audioBytes, bitRateMode.duration, mpeg);
        }
        const headframe = frames.headers[0];
        if (headframe) {
            setResultHeadFrame(headframe, mpeg);
        }
        return { mpeg, frames };
    });
}
function prepareResultID3v1(layout) {
    return __awaiter(this, void 0, void 0, function* () {
        const id3v1s = layout.tags.filter((o) => o.id === __1.ITagID.ID3v1);
        const id3v1 = id3v1s.length > 0 ? id3v1s[id3v1s.length - 1] : undefined;
        if (id3v1 && id3v1.end === layout.size) {
            return id3v1;
        }
    });
}
exports.prepareResultID3v1 = prepareResultID3v1;
function prepareResultID3v2(layout) {
    return __awaiter(this, void 0, void 0, function* () {
        const id3v2s = layout.tags.filter(o => o.id === __1.ITagID.ID3v2);
        const id3v2raw = id3v2s.length > 0 ? id3v2s[0] : undefined;
        if (id3v2raw) {
            return yield (0, id3v2_frame_read_1.buildID3v2)(id3v2raw);
        }
    });
}
exports.prepareResultID3v2 = prepareResultID3v2;
function prepareResult(options, layout) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = { size: layout.size };
        if (options.raw) {
            result.raw = layout;
        }
        if (options.id3v1 || options.id3v1IfNotID3v2) {
            result.id3v1 = yield prepareResultID3v1(layout);
        }
        if (options.id3v2 || options.id3v1IfNotID3v2) {
            result.id3v2 = yield prepareResultID3v2(layout);
        }
        if (options.mpeg || options.mpegQuick) {
            const { mpeg, frames } = yield prepareResultMPEG(options, layout);
            result.mpeg = mpeg;
            result.frames = frames;
        }
        return result;
    });
}
exports.prepareResult = prepareResult;
//# sourceMappingURL=mp3.result.js.map