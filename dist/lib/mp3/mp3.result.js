import { ITagID } from '../common/types.js';
import { filterBestMPEGChain } from './mp3.mpeg.chain.js';
import { expandRawHeader, expandRawHeaderArray, rawHeaderOffSet } from './mp3.mpeg.frame.js';
import { analyzeBitrateMode } from './mp3.bitrate.js';
import { buildID3v2 } from '../id3v2/frames/id3v2.frame.read.js';
function calculateDuration(frameCount, sampleCount, sampleRate) {
    if (frameCount > 0 && sampleCount > 0 && sampleRate > 0) {
        return Math.trunc(frameCount * sampleCount / sampleRate * 1000) / 1000;
    }
    return 0;
}
function buildFrames(chain, layout) {
    return {
        audio: chain,
        headers: layout.headframes.map(frame => ({
            header: expandRawHeader(expandRawHeaderArray(frame.header)),
            mode: frame.mode,
            xing: frame.xing,
            vbri: frame.vbri
        }))
    };
}
function setResultBase(chain, mpeg) {
    const header = expandRawHeader(expandRawHeaderArray(chain[0]));
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
        audioBytes -= rawHeaderOffSet(chain[0]);
        if (layout.tags.some(t => t.id === ITagID.ID3v1 && t.end === layout.size && t.start < layout.size)) {
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
function setResultHeadFrame(headframe, mpeg, isQuick) {
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
    if (!isQuick || (mpeg.frameCountDeclared > 0)) {
        mpeg.durationEstimate = calculateDuration(mpeg.frameCountDeclared, mpeg.sampleCount, mpeg.sampleRate);
    }
}
function defaultMPEGResult() {
    return {
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
}
async function prepareResultMPEG(options, layout) {
    const mpeg = defaultMPEGResult();
    const chain = filterBestMPEGChain(layout.frameheaders, 50);
    const frames = buildFrames(chain, layout);
    const bitRateMode = analyzeBitrateMode(chain);
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
        setResultHeadFrame(headframe, mpeg, options.mpegQuick);
    }
    return { mpeg, frames };
}
export async function prepareResultID3v1(layout) {
    const id3v1s = layout.tags.filter(o => o.id === ITagID.ID3v1);
    const id3v1 = id3v1s.length > 0 ? id3v1s.at(-1) : undefined;
    if (id3v1 && id3v1.end === layout.size) {
        return id3v1;
    }
}
export async function prepareResultID3v2(layout) {
    const id3v2s = layout.tags.filter(o => o.id === ITagID.ID3v2);
    const id3v2raw = id3v2s.length > 0 ? id3v2s[0] : undefined;
    if (id3v2raw) {
        return await buildID3v2(id3v2raw);
    }
}
export async function prepareResult(options, layout) {
    const result = { size: layout.size };
    if (options.raw) {
        result.raw = layout;
    }
    if (options.id3v1 || options.id3v1IfNotID3v2) {
        result.id3v1 = await prepareResultID3v1(layout);
    }
    if (options.id3v2 || options.id3v1IfNotID3v2) {
        result.id3v2 = await prepareResultID3v2(layout);
    }
    if (options.mpeg || options.mpegQuick) {
        const { mpeg, frames } = await prepareResultMPEG(options, layout);
        result.mpeg = mpeg;
        result.frames = frames;
    }
    return result;
}
//# sourceMappingURL=mp3.result.js.map