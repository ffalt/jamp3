import { ascii } from '../../../common/encodings.js';
export const FrameIdAscii = {
    parse: async (reader) => {
        const id = reader.readStringTerminated(ascii);
        const text = reader.readStringTerminated(ascii);
        const value = { id, text };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        await stream.writeString(value.text, ascii);
    },
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.id-ascii.js.map