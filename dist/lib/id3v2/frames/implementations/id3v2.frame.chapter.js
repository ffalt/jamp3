import { ascii } from '../../../common/encodings.js';
import { writeRawSubFrames } from '../id3v2.frame.write.js';
import { readSubFrames } from '../id3v2.frame.read.js';
export const FrameCHAP = {
    parse: async (reader, frame, head) => {
        const id = reader.readStringTerminated(ascii);
        const start = reader.readUInt4Byte();
        const end = reader.readUInt4Byte();
        const offset = reader.readUInt4Byte();
        const offsetEnd = reader.readUInt4Byte();
        const bin = reader.rest();
        const subframes = await readSubFrames(bin, head);
        const value = { id, start, end, offset, offsetEnd };
        return { value, encoding: ascii, subframes };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        await stream.writeUInt4Byte(value.start);
        await stream.writeUInt4Byte(value.end);
        await stream.writeUInt4Byte(value.offset);
        await stream.writeUInt4Byte(value.offsetEnd);
        if (frame.subframes) {
            await writeRawSubFrames(frame.subframes, stream, head, defaultEncoding);
        }
    },
    simplify: (value) => {
        if (value && value.id && value.id.length > 0) {
            return `<chapter ${value.id}>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.chapter.js.map