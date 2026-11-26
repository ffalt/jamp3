import { rawHeaderLayerIdx, rawHeaderOffSet, rawHeaderSize, rawHeaderVersionIdx } from './mp3.mpeg.frame.js';
function followChain(frame, frames) {
    const result = [];
    let useFrame = frame;
    result.push(useFrame);
    const useFrames = frames.filter(f => rawHeaderSize(f) > 0);
    let i = useFrames.indexOf(frame);
    if (i < 0) {
        return result;
    }
    for (i += 1; i < useFrames.length; i++) {
        const nextpos = rawHeaderOffSet(useFrame) + rawHeaderSize(useFrame);
        const direct = getNextMatch(nextpos, i - 1, useFrames);
        if (direct >= 0) {
            const nextframe = useFrames[direct];
            result.push(nextframe);
            useFrame = nextframe;
            i = direct;
        }
        else {
            const nextframe = useFrames[i];
            const diff = rawHeaderOffSet(nextframe) - nextpos;
            if (diff === 0) {
                result.push(nextframe);
                useFrame = nextframe;
            }
            else if (diff > 0) {
                if (rawHeaderVersionIdx(nextframe) === rawHeaderVersionIdx(useFrame) && rawHeaderLayerIdx(nextframe) === rawHeaderLayerIdx(useFrame)) {
                    result.push(nextframe);
                    useFrame = nextframe;
                    const resync = getNextMatch(rawHeaderOffSet(nextframe) + rawHeaderSize(nextframe), i, useFrames);
                    if (resync >= 0) {
                        i = resync - 1;
                    }
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
        if (rawHeaderOffSet(frames[j]) === offset) {
            return j;
        }
        if (rawHeaderOffSet(frames[j]) > offset) {
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
        if (!done.includes(frame)) {
            const chain = { frame, count: 0, pos: i };
            chains.push(chain);
            done.push(frame);
            let next = getNextMatch(rawHeaderOffSet(frame) + rawHeaderSize(frame), i, frames);
            while (next >= 0 && chain.count < followMaxChain) {
                chain.count++;
                const nextframe = frames[next];
                done.push(nextframe);
                next = getNextMatch(rawHeaderOffSet(nextframe) + rawHeaderSize(nextframe), next, frames);
            }
        }
    }
    return chains;
}
function findBestMPEGChain(frames, maxCheckFrames, followMaxChain) {
    const chains = buildMPEGChains(frames, maxCheckFrames, followMaxChain);
    const bestChains = chains
        .filter(chain => chain.count > 0)
        .sort((a, b) => b.count - a.count);
    return bestChains[0];
}
export function getBestMPEGChain(frames, followMaxChain) {
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
export function filterBestMPEGChain(frames, followMaxChain) {
    const chain = getBestMPEGChain(frames, followMaxChain);
    if (!chain) {
        return frames;
    }
    return followChain(chain.frame, frames);
}
//# sourceMappingURL=mp3.mpeg.chain.js.map