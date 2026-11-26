import { ascii } from '../../../common/encodings.js';
export const FrameIdBin = {
    parse: async (reader) => {
        const id = reader.readStringTerminated(ascii);
        const bin = reader.rest();
        const value = { id, bin };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        await stream.writeBuffer(value.bin);
    },
    simplify: (value) => {
        if (value && value.bin && value.bin.length > 0) {
            return `<bin ${value.bin.length}bytes>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.id-bin.js.map