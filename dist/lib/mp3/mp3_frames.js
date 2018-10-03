"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findIndexOfOffset(start, list, offset) {
    for (let i = start; i < list.length; i++) {
        if (list[i].header.offset === offset) {
            return i;
        }
        else if (list[i].header.offset > offset) {
            return -1;
        }
    }
    return -1;
}
function followChain(frame, pos, frames) {
    const result = [];
    result.push(frame);
    frames = frames.filter(f => f.header.size > 0);
    for (let i = pos + 1; i < frames.length; i++) {
        const nextpos = frame.header.offset + frame.header.size;
        const direct = getNextMatch(nextpos, i - 1, frames);
        if (direct >= 0) {
            const nextframe = frames[direct];
            result.push(nextframe);
            frame = nextframe;
            i = direct;
        }
        else {
            const nextframe = frames[i];
            const diff = nextframe.header.offset - nextpos;
            if (diff === 0) {
                result.push(nextframe);
                frame = nextframe;
            }
            else if (diff > 0) {
                if ((nextframe.header.versionIdx === frame.header.versionIdx &&
                    nextframe.header.layerIdx === frame.header.layerIdx)) {
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
        if (frames[j].header.offset === offset) {
            return j;
        }
        else if (frames[j].header.offset > offset) {
            return -1;
        }
    }
    return -1;
}
function getBestMPEGChain(frames, followMaxChain) {
    if (frames.length === 0) {
        return;
    }
    const done = [];
    const count = Math.min(50, frames.length);
    const chains = [];
    for (let i = 0; i < count; i++) {
        const frame = frames[i];
        if (done.indexOf(frame) < 0) {
            const chain = { frame, count: 0, pos: i };
            chains.push(chain);
            done.push(frame);
            let next = getNextMatch(frame.header.offset + frame.header.size, i, frames);
            while (next >= 0 && chain.count < followMaxChain) {
                chain.count++;
                const nextframe = frames[next];
                done.push(nextframe);
                next = getNextMatch(nextframe.header.offset + nextframe.header.size, next, frames);
            }
        }
    }
    let select = chains.filter(chain => chain.count > 0)[0];
    if (!select) {
        select = chains[0];
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