import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FrameBooleanString = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const intAsString = reader.readStringTerminated(enc);
        const i = Number.parseInt(intAsString, 10).toString();
        const value = { bool: i === '1' };
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await stream.writeStringTerminated(value.bool ? '1' : '0', enc);
    },
    simplify: (value) => {
        if (value) {
            return value.bool ? 'true' : 'false';
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.boolstring.js.map