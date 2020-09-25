"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureID3v2FrameVersionDef = exports.upgrade23DateFramesTov24Date = void 0;
const id3v2_frame_defs_1 = require("./id3v2.frame.defs");
function upgrade23DateFramesTov24Date(dateFrames) {
    const year = dateFrames.find(f => ['TYER', 'TYE'].indexOf(f.id) >= 0);
    const date = dateFrames.find(f => ['TDAT', 'TDA'].indexOf(f.id) >= 0);
    const time = dateFrames.find(f => ['TIME', 'TIM'].indexOf(f.id) >= 0);
    if (!year && !date && !time) {
        return;
    }
    const result = [];
    if (year && year.value && year.value.hasOwnProperty('text')) {
        result.push(year.value.text);
    }
    if (date && date.value && date.value.hasOwnProperty('text')) {
        result.push(date.value.text);
    }
    if (time && time.value && time.value.hasOwnProperty('text')) {
        result.push(time.value.text);
    }
    return {
        id: 'TDRC',
        title: 'Recording time',
        value: { text: result.join('-') }
    };
}
exports.upgrade23DateFramesTov24Date = upgrade23DateFramesTov24Date;
function downgradeFrame(id, dest) {
    const downgradeKey = Object.keys(id3v2_frame_defs_1.FrameDefs).find(key => id3v2_frame_defs_1.FrameDefs[key].upgrade === id);
    if (!downgradeKey) {
        return null;
    }
    const fdown = id3v2_frame_defs_1.FrameDefs[downgradeKey];
    if (fdown.versions.includes(dest)) {
        return downgradeKey;
    }
    return (fdown.versions[0] > dest) ? ensureID3v2FrameVersionDef(downgradeKey, dest) : null;
}
function upgradeFrame(upgradeKey, dest) {
    if (!upgradeKey) {
        return null;
    }
    const fup = id3v2_frame_defs_1.FrameDefs[upgradeKey];
    if (fup.versions.includes(dest)) {
        return upgradeKey;
    }
    return (fup.versions[0] < dest) ? ensureID3v2FrameVersionDef(upgradeKey, dest) : null;
}
function ensureID3v2FrameVersionDef(id, dest) {
    const def = id3v2_frame_defs_1.FrameDefs[id];
    if (!def) {
        return null;
    }
    if (def.versions.includes(dest)) {
        return id;
    }
    if (def.versions[0] > dest) {
        return downgradeFrame(id, dest);
    }
    return upgradeFrame(def.upgrade, dest);
}
exports.ensureID3v2FrameVersionDef = ensureID3v2FrameVersionDef;
//# sourceMappingURL=id3v2.frame.version.js.map