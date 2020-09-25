"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFrameBinId = exports.matchFrame = exports.findId3v2FrameDef = exports.Matcher = void 0;
const id3v2_frame_defs_1 = require("./id3v2.frame.defs");
const id3v2_frame_text_1 = require("./implementations/id3v2.frame.text");
const id3v2_frame_ascii_1 = require("./implementations/id3v2.frame.ascii");
const utils_1 = require("../../common/utils");
const id3v2_frame_unknown_1 = require("./implementations/id3v2.frame.unknown");
exports.Matcher = [
    {
        match: (id) => {
            return id[0] === 'T' && id !== 'TXX' && id !== 'TXXX';
        },
        matchBin: (id) => {
            if (id[0] !== 84) {
                return false;
            }
            let allX = true;
            for (let i = 1; i < id.length; i++) {
                if (!utils_1.validCharKeyCode(id[i])) {
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
        match: (id) => {
            return (id[0] === 'W' && id !== 'WXX' && id !== 'WXXX');
        },
        matchBin: (id) => {
            if (id[0] !== 87) {
                return false;
            }
            let allX = true;
            for (let i = 1; i < id.length; i++) {
                if (!utils_1.validCharKeyCode(id[i])) {
                    return false;
                }
                allX = allX && (id[i] === 88);
            }
            return !allX;
        },
        value: {
            title: 'Unknown URL Field',
            versions: [3, 4],
            impl: id3v2_frame_ascii_1.FrameAscii,
        }
    }
];
function findId3v2FrameDef(id) {
    const f = id3v2_frame_defs_1.FrameDefs[id];
    if (f) {
        return f;
    }
    for (let i = 0; i < exports.Matcher.length; i++) {
        if (exports.Matcher[i].match(id)) {
            return exports.Matcher[i].value;
        }
    }
    return null;
}
exports.findId3v2FrameDef = findId3v2FrameDef;
function matchFrame(id) {
    return findId3v2FrameDef(id) || { title: 'Unknown Frame', impl: id3v2_frame_unknown_1.FrameUnknown, versions: [2, 3, 4] };
}
exports.matchFrame = matchFrame;
let tree;
function fillTree() {
    tree = {};
    Object.keys(id3v2_frame_defs_1.FrameDefs).forEach(key => {
        let node = tree;
        for (let i = 0; i < key.length - 1; i++) {
            const c = key.charCodeAt(i);
            node[c] = node[c] || {};
            node = node[c];
        }
        const last = key.charCodeAt(key.length - 1);
        node[last] = node[last] || { frameDef: id3v2_frame_defs_1.FrameDefs[key] };
    });
}
function findId3v2FrameDefBuffer(id) {
    const last = id[id.length - 1];
    if (last === 32 || last === 0) {
        id = id.slice(0, id.length - 1);
    }
    if (!tree) {
        fillTree();
    }
    let node = tree;
    for (let i = 0; i < id.length; i++) {
        const c = id[i];
        if (!node[c]) {
            node = tree;
            break;
        }
        node = node[c];
    }
    if (node.frameDef) {
        return node.frameDef;
    }
    for (let i = 0; i < exports.Matcher.length; i++) {
        if (exports.Matcher[i].matchBin(id)) {
            return exports.Matcher[i].value;
        }
    }
}
function isValidFrameBinId(id) {
    return !!findId3v2FrameDefBuffer(id);
}
exports.isValidFrameBinId = isValidFrameBinId;
//# sourceMappingURL=id3v2.frame.match.js.map