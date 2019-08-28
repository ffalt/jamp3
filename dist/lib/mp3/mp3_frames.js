"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mp3_frame_1 = require("./mp3_frame");
function followChain(frame, pos, frames) {
    const result = [];
    result.push(frame);
    frames = frames.filter(f => mp3_frame_1.rawHeaderSize(f) > 0);
    for (let i = pos + 1; i < frames.length; i++) {
        const nextpos = mp3_frame_1.rawHeaderOffSet(frame) + mp3_frame_1.rawHeaderSize(frame);
        const direct = getNextMatch(nextpos, i - 1, frames);
        if (direct >= 0) {
            const nextframe = frames[direct];
            result.push(nextframe);
            frame = nextframe;
            i = direct;
        }
        else {
            const nextframe = frames[i];
            const diff = mp3_frame_1.rawHeaderOffSet(nextframe) - nextpos;
            if (diff === 0) {
                result.push(nextframe);
                frame = nextframe;
            }
            else if (diff > 0) {
                if ((mp3_frame_1.rawHeaderVersionIdx(nextframe) === mp3_frame_1.rawHeaderVersionIdx(frame) &&
                    mp3_frame_1.rawHeaderLayerIdx(nextframe) === mp3_frame_1.rawHeaderLayerIdx(frame))) {
                    result.push(nextframe);
                    frame = nextframe;
                }
                else {
                }
            }
            else {
            }
        }
    }
    return result;
}
function getNextMatch(offset, pos, frames) {
    for (let j = pos + 1; j < frames.length; j++) {
        if (mp3_frame_1.rawHeaderOffSet(frames[j]) === offset) {
            return j;
        }
        else if (mp3_frame_1.rawHeaderOffSet(frames[j]) > offset) {
            return -1;
        }
    }
    return -1;
}
function buildMPEGChains(frames, maxCheckFrames, followMaxChain) {
    const done = [];
    const chains = [];
    const count = Math.min(maxCheckFrames, frames.length);
    for (let i = 0; i < count; i++) {
        const frame = frames[i];
        if (done.indexOf(frame) < 0) {
            const chain = { frame, count: 0, pos: i };
            chains.push(chain);
            done.push(frame);
            let next = getNextMatch(mp3_frame_1.rawHeaderOffSet(frame) + mp3_frame_1.rawHeaderSize(frame), i, frames);
            while (next >= 0 && chain.count < followMaxChain) {
                chain.count++;
                const nextframe = frames[next];
                done.push(nextframe);
                next = getNextMatch(mp3_frame_1.rawHeaderOffSet(nextframe) + mp3_frame_1.rawHeaderSize(nextframe), next, frames);
            }
        }
    }
    return chains;
}
function findBestMPEGChain(frames, maxCheckFrames, followMaxChain) {
    const chains = buildMPEGChains(frames, maxCheckFrames, followMaxChain);
    const bestChains = chains.filter(chain => chain.count > 0).sort((a, b) => b.count - a.count);
    return bestChains[0];
}
function getBestMPEGChain(frames, followMaxChain) {
    if (frames.length === 0) {
        return;
    }
    let select;
    let checkMaxFrames = 50;
    while (!select && checkMaxFrames < 500) {
        select = findBestMPEGChain(frames, checkMaxFrames, followMaxChain);
        if (checkMaxFrames > frames.length) {
            break;
        }
        checkMaxFrames += 50;
    }
    return select;
}
exports.getBestMPEGChain = getBestMPEGChain;
function filterBestMPEGChain(frames, followMaxChain) {
    const chain = getBestMPEGChain(frames, followMaxChain);
    if (!chain) {
        return frames;
    }
    return followChain(chain.frame, chain.pos, frames);
}
exports.filterBestMPEGChain = filterBestMPEGChain;
//# sourceMappingURL=mp3_frames.js.map