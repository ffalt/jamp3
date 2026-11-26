import { FrameDefs } from './id3v2.frame.defs.js';
import { FrameText } from './implementations/id3v2.frame.text.js';
import { FrameAscii } from './implementations/id3v2.frame.ascii.js';
import { validCharKeyCode } from '../../common/utils.js';
import { FrameUnknown } from './implementations/id3v2.frame.unknown.js';
export const Matcher = [
    {
        match: (id) => id[0] === 'T' && id !== 'TXX' && id !== 'TXXX',
        matchBin: (id) => {
            if (id[0] !== 84) {
                return false;
            }
            let allX = true;
            for (let i = 1; i < id.length; i++) {
                if (!validCharKeyCode(id[i])) {
                    return false;
                }
                allX && (allX = id[i] === 88);
            }
            return !allX;
        },
        value: {
            title: 'Unknown Text Field',
            versions: [3, 4],
            impl: FrameText
        }
    },
    {
        match: (id) => (id[0] === 'W' && id !== 'WXX' && id !== 'WXXX'),
        matchBin: (id) => {
            if (id[0] !== 87) {
                return false;
            }
            let allX = true;
            for (let i = 1; i < id.length; i++) {
                if (!validCharKeyCode(id[i])) {
                    return false;
                }
                allX && (allX = id[i] === 88);
            }
            return !allX;
        },
        value: {
            title: 'Unknown URL Field',
            versions: [3, 4],
            impl: FrameAscii
        }
    }
];
export function findId3v2FrameDef(id) {
    const f = FrameDefs[id];
    if (f) {
        return f;
    }
    for (const element of Matcher) {
        if (element.match(id)) {
            return element.value;
        }
    }
    return null;
}
export function matchFrame(id) {
    return findId3v2FrameDef(id) || { title: 'Unknown Frame', impl: FrameUnknown, versions: [2, 3, 4] };
}
let tree;
function fillTree() {
    tree = {};
    for (const [key, frameDef] of Object.entries(FrameDefs)) {
        let node = tree;
        for (let i = 0; i < key.length - 1; i++) {
            const c = key.codePointAt(i);
            if (c !== undefined) {
                node[c] || (node[c] = {});
                node = node[c];
            }
        }
        const last = key.codePointAt(key.length - 1);
        if (last !== undefined) {
            node[last] || (node[last] = {});
            node[last].frameDef = frameDef;
        }
    }
}
function findId3v2FrameDefBuffer(id) {
    let currentID = id;
    const last = currentID.at(-1);
    if (last === 32 || last === 0) {
        currentID = currentID.subarray(0, -1);
    }
    if (!tree) {
        fillTree();
    }
    let node = tree;
    for (const c of currentID) {
        if (!node[c]) {
            node = tree;
            break;
        }
        node = node[c];
    }
    if (node.frameDef) {
        return node.frameDef;
    }
    for (const element of Matcher) {
        if (element.matchBin(currentID)) {
            return element.value;
        }
    }
}
export function isValidFrameBinId(id) {
    return !!findId3v2FrameDefBuffer(id);
}
//# sourceMappingURL=id3v2.frame.match.js.map