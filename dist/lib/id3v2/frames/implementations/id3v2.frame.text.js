import { utf8 } from '../../../common/encodings.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
import { readMultiTextValues, writeMultiTextValues } from '../id3v2.frame.multitext.js';
export const FrameText = {
    parse: async (reader, frame) => {
        if (frame.data.length === 0) {
            return { value: { text: '' }, encoding: utf8 };
        }
        const enc = reader.readEncoding();
        const list = readMultiTextValues(reader, enc);
        const value = { text: list.join('\n') };
        if (list.length > 1) {
            value.list = list;
        }
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await writeMultiTextValues(stream, value.list && value.list.length > 0 ? value.list : [value.text], enc);
    },
    simplify: (value) => {
        if (value && value.text && value.text.length > 0) {
            return value.text;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.text.js.map