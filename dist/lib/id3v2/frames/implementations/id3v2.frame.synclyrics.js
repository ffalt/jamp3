import { removeZeroString } from '../../../common/utils.js';
import { ascii } from '../../../common/encodings.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FrameSYLT = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const language = removeZeroString(reader.readString(3, ascii)).trim();
        const timestampFormat = reader.readByte();
        const contentType = reader.readByte();
        const id = reader.readStringTerminated(enc);
        const events = [];
        while (reader.hasData()) {
            const text = reader.readStringTerminated(enc);
            if (reader.unread() >= 4) {
                const timestamp = reader.readUInt4Byte();
                events.push({ timestamp, text });
            }
        }
        const value = { language, timestampFormat, contentType, id, events };
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await stream.writeAsciiString(value.language, 3);
        await stream.writeByte(value.timestampFormat);
        await stream.writeByte(value.contentType);
        await stream.writeStringTerminated(value.id, enc);
        for (const event of value.events) {
            await stream.writeStringTerminated(event.text, enc);
            await stream.writeUInt4Byte(event.timestamp);
        }
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        const parts = [
            `lang=${value.language}`,
            `format=${value.timestampFormat}`,
            `contentType=${value.contentType}`,
            `id=${value.id}`
        ];
        const events = (value.events || []).map(e => `${e.text}@${e.timestamp}`);
        if (events.length > 0) {
            parts.push(events.join('|'));
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.synclyrics.js.map