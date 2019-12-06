"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("../../common/buffer");
function removeUnsync(data) {
    const result = buffer_1.BufferUtils.zeroBuffer(data.length);
    result[0] = data[0];
    let pos = 1;
    for (let i = 1; i < data.length; i++) {
        if (data[i] === 0 && data[i - 1] === 0xFF) {
        }
        else {
            result[pos] = data[i];
            pos++;
        }
    }
    return result.slice(0, pos);
}
exports.removeUnsync = removeUnsync;
//# sourceMappingURL=id3v2.frame.unsync.js.map