import { binary } from '../../../common/encodings.js';
export const FrameMusicCDId = {
    parse: async (reader, frame) => {
        const value = { bin: frame.data };
        return { value, encoding: binary };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeBuffer(value.bin);
    },
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return `<bin ${value.bin.length}bytes>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.musiccdid.js.map