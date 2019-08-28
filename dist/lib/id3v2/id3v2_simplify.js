"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_frames_1 = require("./id3v2_frames");
const id3v2_simplify_maps_1 = require("./id3v2_simplify_maps");
function simplifyTag(tag, dropIDsList) {
    const result = {};
    const slugcounter = {};
    const frames = tag.frames.filter(f => !id3v2_simplify_maps_1.DateUpgradeMap[f.id]);
    const dateframes = tag.frames.filter(f => !!id3v2_simplify_maps_1.DateUpgradeMap[f.id]);
    const dateFrame = id3v2_frames_1.upgrade23DateFramesTov24Date(dateframes);
    if (dateFrame) {
        frames.push(dateFrame);
    }
    frames.forEach((frame) => {
        const simples = id3v2_simplify_maps_1.simplifyFrame(frame, dropIDsList);
        if (simples) {
            for (const simple of simples) {
                const count = (slugcounter[simple.slug] || 0) + 1;
                slugcounter[simple.slug] = count;
                const name = simple.slug + (count > 1 ? '|' + count : '');
                result[name] = simple.text;
            }
        }
    });
    return result;
}
exports.simplifyTag = simplifyTag;
//# sourceMappingURL=id3v2_simplify.js.map