"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mp3_frame_1 = require("./mp3_frame");
function analyzeBitrateMode(frames) {
    const bitRates = {};
    let duration = 0;
    let audioBytes = 0;
    let count = 0;
    frames.forEach(frame => {
        const header = mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(frame));
        bitRates[header.bitRate] = (bitRates[header.bitRate] || 0) + 1;
        duration += header.time;
        audioBytes += header.size;
        count++;
    });
    let encoded = 'CBR';
    const first = frames.length > 0 ? mp3_frame_1.expandRawHeader(mp3_frame_1.expandRawHeaderArray(frames[0])) : undefined;
    let bitRate = first ? first.bitRate : 0;
    const rates = Object.keys(bitRates).map(s => parseInt(s, 10));
    if (rates.length > 1) {
        encoded = 'VBR';
        let sumBitrate = 0;
        let countBitrate = 0;
        rates.forEach(rate => {
            sumBitrate += (rate * bitRates[rate]);
            countBitrate += bitRates[rate];
        });
        bitRate = Math.trunc(sumBitrate / countBitrate);
    }
    return { encoded, bitRate, duration, count, audioBytes };
}
exports.analyzeBitrateMode = analyzeBitrateMode;
//# sourceMappingURL=mp3_bitrate.js.map