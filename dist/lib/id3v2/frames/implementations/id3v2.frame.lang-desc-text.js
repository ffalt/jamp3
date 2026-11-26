import { removeZeroString } from '../../../common/utils.js';
import { ascii } from '../../../common/encodings.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
import { readMultiTextValues, writeMultiTextValues } from '../id3v2.frame.multitext.js';
export const FrameLangDescText = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const language = removeZeroString(reader.readString(3, ascii)).trim();
        const id = reader.readStringTerminated(enc);
        const list = readMultiTextValues(reader, enc);
        const value = { id, language, text: list.join('\n') };
        if (list.length > 1) {
            value.list = list;
        }
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await stream.writeAsciiString(value.language || '', 3);
        await stream.writeStringTerminated(value.id || '', enc);
        await writeMultiTextValues(stream, value.list && value.list.length > 0 ? value.list : [value.text], enc);
    },
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.lang-desc-text.js.map