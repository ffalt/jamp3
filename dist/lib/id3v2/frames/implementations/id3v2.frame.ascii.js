import { ascii } from '../../../common/encodings.js';
export const FrameAscii = {
    parse: async (reader) => {
        const text = reader.readStringTerminated(ascii);
        const value = { text };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeString(value.text, ascii);
    },
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.ascii.js.map