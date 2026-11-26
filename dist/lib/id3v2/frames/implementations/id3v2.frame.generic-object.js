import { ascii } from '../../../common/encodings.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FrameGEOB = {
    parse: async (reader) => {
        const enc = reader.readEncoding();
        const mimeType = reader.readStringTerminated(ascii);
        const filename = reader.readStringTerminated(enc);
        const contentDescription = reader.readStringTerminated(enc);
        const bin = reader.rest();
        const value = { mimeType, filename, contentDescription, bin };
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        await stream.writeStringTerminated(value.mimeType, ascii);
        await stream.writeStringTerminated(value.filename, enc);
        await stream.writeStringTerminated(value.contentDescription, enc);
        await stream.writeBuffer(value.bin);
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        const parts = [value.mimeType, value.filename, value.contentDescription];
        if (value.bin && value.bin.length > 0) {
            parts.push(`bin=${value.bin.length}bytes`);
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.generic-object.js.map