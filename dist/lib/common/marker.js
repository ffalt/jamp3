"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Markers {
    static makeMarker(str) {
        const mark = [];
        for (let i = 0; i < str.length; i++) {
            mark.push(str.charCodeAt(i));
        }
        return mark;
    }
    static isMarker(buffer, offset, marker) {
        if (buffer.length - offset < marker.length) {
            return false;
        }
        for (let i = marker.length - 1; i >= 0; i--) {
            if (marker[i] !== buffer.readUInt8(offset + i)) {
                return false;
            }
        }
        return true;
    }
}
exports.Markers = Markers;
Markers.MARKERS = {
    tag: Markers.makeMarker('TAG'),
    id3: Markers.makeMarker('ID3'),
    xing: Markers.makeMarker('Xing'),
    info: Markers.makeMarker('Info'),
    vbri: Markers.makeMarker('VBRI')
};
//# sourceMappingURL=marker.js.map