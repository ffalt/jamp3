import { BufferUtils } from '../../common/buffer.js';
export function removeUnsync(data) {
    const result = BufferUtils.zeroBuffer(data.length);
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
    return result.subarray(0, pos);
}
export function removeUnsyncCounted(data, amount) {
    const result = BufferUtils.zeroBuffer(Math.min(amount, data.length));
    let pos = 0;
    let i = 0;
    while (i < data.length && pos < amount) {
        result[pos] = data[i];
        pos++;
        i++;
        if (data[i - 1] === 0xFF && data[i] === 0x00) {
            i++;
        }
    }
    return { data: result.subarray(0, pos), rawLength: i };
}
export function needsUnsync(data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
            return true;
        }
    }
    return false;
}
export function applyUnsync(data) {
    if (!needsUnsync(data)) {
        return data;
    }
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
            count++;
        }
    }
    const result = BufferUtils.zeroBuffer(data.length + count);
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