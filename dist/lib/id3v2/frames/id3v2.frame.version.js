import { FrameDefs } from './id3v2.frame.defs.js';
export function upgrade23DateFramesTov24Date(dateFrames) {
    const year = dateFrames.find(f => ['TYER', 'TYE'].includes(f.id));
    const date = dateFrames.find(f => ['TDAT', 'TDA'].includes(f.id));
    const time = dateFrames.find(f => ['TIME', 'TIM'].includes(f.id));
    if (!year && !date && !time) {
        return;
    }
    const result = [];
    if (year && year.value && Object.hasOwn(year.value, 'text')) {
        result.push(year.value.text);
    }
    if (date && date.value && Object.hasOwn(date.value, 'text')) {
        result.push(date.value.text);
    }
    if (time && time.value && Object.hasOwn(time.value, 'text')) {
        result.push(time.value.text);
    }
    const value = { text: result.join('-') };
    return { id: 'TDRC', title: 'Recording time', value };
}
function downgradeFrame(id, dest) {
    const downgradeKey = Object.keys(FrameDefs).find(key => FrameDefs[key].upgrade === id);
    if (!downgradeKey) {
        return null;
    }
    const fdown = FrameDefs[downgradeKey];
    if (fdown.versions.includes(dest)) {
        return downgradeKey;
    }
    return (fdown.versions[0] > dest) ? ensureID3v2FrameVersionDef(downgradeKey, dest) : null;
}
function upgradeFrame(upgradeKey, dest) {
    if (!upgradeKey) {
        return null;
    }
    const fup = FrameDefs[upgradeKey];
    if (fup.versions.includes(dest)) {
        return upgradeKey;
    }
    return (fup.versions[0] < dest) ? ensureID3v2FrameVersionDef(upgradeKey, dest) : null;
}
export function ensureID3v2FrameVersionDef(id, dest) {
    const def = FrameDefs[id];
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
//# sourceMappingURL=id3v2.frame.version.js.map