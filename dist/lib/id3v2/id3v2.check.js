"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_frame_match_1 = require("./frames/id3v2.frame.match");
function checkID3v2(id3v2) {
    const result = [];
    for (const frame of id3v2.frames) {
        const def = id3v2_frame_match_1.findId3v2FrameDef(frame.id);
        if (def && id3v2.head && def.versions.indexOf(id3v2.head.ver) < 0) {
            result.push({ msg: 'ID3v2: invalid version for frame ' + frame.id, expected: def.versions.join('|'), actual: id3v2.head.ver });
        }
    }
    return result;
}
exports.checkID3v2 = checkID3v2;
//# sourceMappingURL=id3v2.check.js.map