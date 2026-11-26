export class ID3V2FramesCollect {
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
        this.frameValues[key] = [...(this.frameValues[key] || []), frame];
    }
    addFrame(key, value) {
        this.add(key, { id: key, value, head: this.head() });
    }
    addIDFrame(key, value) {
        const list = (this.frameValues[key] || [])
            .filter(f => f.value.id !== value.id);
        const frame = { id: key, value, head: this.head() };
        this.frameValues[key] = [...list, frame];
    }
    head() {
        return {
            size: 0,
            statusFlags: {},
            formatFlags: {},
            encoding: this.encoding
        };
    }
    clearFrames(key) {
        delete this.frameValues[key];
    }
    loadFrames(frames) {
        for (const frame of frames) {
            this.frameValues[frame.id] = [...(this.frameValues[frame.id] || []), frame];
        }
    }
    build() {
        return this.frameValues;
    }
}
//# sourceMappingURL=id3v2.builder.collect.js.map