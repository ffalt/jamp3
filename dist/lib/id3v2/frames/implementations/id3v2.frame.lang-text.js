import { removeZeroString } from '../../../common/utils.js';
import { ascii } from '../../../common/encodings.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FrameLangText = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const language = removeZeroString(reader.readString(3, ascii)).trim();
        const text = reader.readStringTerminated(enc);
        const value = { language, text };
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await stream.writeAsciiString(value.language || '', 3);
        await stream.writeString(value.text, enc);
    },
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.lang-text.js.map