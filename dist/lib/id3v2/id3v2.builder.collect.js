"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ID3V2FramesCollect {
    constructor(encoding) {
        this.encoding = encoding;
        this.frameValues = {};
    }
    replace(key, frame) {
        this.frameValues[key] = [frame];
    }
    replaceFrame(key, value) {
        this.replace(key, { id: key, value, head: this.head() });
    }
    add(key, frame) {
        this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
    }
    addFrame(key, value) {
        this.add(key, { id: key, value, head: this.head() });
    }
    addIDFrame(key, value) {
        const list = (this.frameValues[key] || [])
            .filter(f => f.value.id !== value.id);
        this.frameValues[key] = list.concat([{ id: key, value, head: this.head() }]);
    }
    head() {
        return {
            size: 0,
            statusFlags: {},
            formatFlags: {},
            encoding: this.encoding
        };
    }
    build() {
        return this.frameValues;
    }
}
exports.ID3V2FramesCollect = ID3V2FramesCollect;
//# sourceMappingURL=id3v2.builder.collect.js.map