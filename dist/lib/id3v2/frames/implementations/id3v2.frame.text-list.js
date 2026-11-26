import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FrameTextList = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const list = [];
        while (reader.hasData()) {
            const text = reader.readStringTerminated(enc);
            if (text.length > 0) {
                list.push(text);
            }
        }
        const value = { list };
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        for (let index = 0; index < value.list.length; index++) {
            await stream.writeString(value.list[index], enc);
            if (index !== value.list.length - 1) {
                await stream.writeTerminator(enc);
            }
        }
    },
    simplify: (value) => {
        if (value && value.list && value.list.length > 0) {
            return value.list.join(' / ');
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.text-list.js.map