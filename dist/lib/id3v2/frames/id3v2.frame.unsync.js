"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUnsync = removeUnsync;
exports.needsUnsync = needsUnsync;
exports.applyUnsync = applyUnsync;
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
function needsUnsync(data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
            return true;
        }
    }
    return false;
}
function applyUnsync(data) {
    if (!needsUnsync(data)) {
        return data;
    }
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
            count++;
        }
    }
    const result = buffer_1.BufferUtils.zeroBuffer(data.length + count);
    let pos = 0;
    for (let i = 0; i < data.length; i++) {
        result[pos++] = data[i];
        if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
            result[pos++] = 0x00;
        }
    }
    return result;
}
//# sourceMappingURL=id3v2.frame.unsync.js.map