"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matcher = void 0;
exports.findId3v2FrameDef = findId3v2FrameDef;
exports.matchFrame = matchFrame;
exports.isValidFrameBinId = isValidFrameBinId;
const id3v2_frame_defs_1 = require("./id3v2.frame.defs");
const id3v2_frame_text_1 = require("./implementations/id3v2.frame.text");
const id3v2_frame_ascii_1 = require("./implementations/id3v2.frame.ascii");
const utils_1 = require("../../common/utils");
const id3v2_frame_unknown_1 = require("./implementations/id3v2.frame.unknown");
exports.Matcher = [
    {
        match: (id) => id[0] === 'T' && id !== 'TXX' && id !== 'TXXX',
        matchBin: (id) => {
            if (id[0] !== 84) {
                return false;
            }
            let allX = true;
            for (let i = 1; i < id.length; i++) {
                if (!(0, utils_1.validCharKeyCode)(id[i])) {
                    return false;
                }
                allX = allX && (id[i] === 88);
            }
            return !allX;
        },
        value: {
            title: 'Unknown Text Field',
            versions: [3, 4],
            impl: id3v2_frame_text_1.FrameText
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
                if (!(0, utils_1.validCharKeyCode)(id[i])) {
                    return false;
                }
                allX = allX && (id[i] === 88);
            }
            return !allX;
        },
        value: {
            title: 'Unknown URL Field',
            versions: [3, 4],
            impl: id3v2_frame_ascii_1.FrameAscii
        }
    }
];
function findId3v2FrameDef(id) {
    const f = id3v2_frame_defs_1.FrameDefs[id];
    if (f) {
        return f;
    }
    for (const element of exports.Matcher) {
        if (element.match(id)) {
            return element.value;
        }
    }
    return null;
}
function matchFrame(id) {
    return findId3v2FrameDef(id) || { title: 'Unknown Frame', impl: id3v2_frame_unknown_1.FrameUnknown, versions: [2, 3, 4] };
}
let tree;
function fillTree() {
    tree = {};
    for (const key of Object.keys(id3v2_frame_defs_1.FrameDefs)) {
        let node = tree;
        for (let i = 0; i < key.length - 1; i++) {
            const c = key.codePointAt(i);
            if (c !== undefined) {
                node[c] = node[c] || {};
                node = node[c];
            }
        }
        const last = key.codePointAt(key.length - 1);
        if (last !== undefined) {
            node[last] = node[last] || {};
            node[last].frameDef = id3v2_frame_defs_1.FrameDefs[key];
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
    for (const element of exports.Matcher) {
        if (element.matchBin(currentID)) {
            return element.value;
        }
    }
}
function isValidFrameBinId(id) {
    return !!findId3v2FrameDefBuffer(id);
}
//# sourceMappingURL=id3v2.frame.match.js.map