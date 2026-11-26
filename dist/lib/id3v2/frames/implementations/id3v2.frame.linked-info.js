import { ascii } from '../../../common/encodings.js';
import { validCharKeyCode } from '../../../common/utils.js';
export const FrameLINK = {
    parse: async (reader, frame, head) => {
        const maxIdLength = head.ver <= 2 ? 3 : 4;
        let idLength = 0;
        while (idLength < maxIdLength &&
            (reader.position + idLength) < reader.data.length &&
            validCharKeyCode(reader.data[reader.position + idLength])) {
            idLength++;
        }
        const id = reader.readFixedAsciiString(idLength);
        const url = reader.readStringTerminated(ascii);
        const value = { url, id, additional: [] };
        while (reader.hasData()) {
            const additional = reader.readStringTerminated(ascii);
            if (additional.length > 0) {
                value.additional.push(additional);
            }
        }
        return { value, encoding: ascii };
    },
    write: async (frame, stream, head) => {
        const value = frame.value;
        const maxIdLength = head.ver <= 2 ? 3 : 4;
        await stream.writeAscii(value.id.slice(0, maxIdLength));
        await stream.writeStringTerminated(value.url, ascii);
        for (const additional of value.additional) {
            await stream.writeStringTerminated(additional, ascii);
        }
    },
    simplify: (value) => {
        if (!value || !value.url) {
            return null;
        }
        const parts = [value.id, value.url];
        const additional = value.additional || [];
        for (const a of additional) {
            parts.push(a);
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.linked-info.js.map