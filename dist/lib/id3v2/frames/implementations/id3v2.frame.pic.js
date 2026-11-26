import { ascii } from '../../../common/encodings.js';
import { ID3V2ValueTypes } from '../../id3v2.consts.js';
import { getWriteTextEncoding } from '../id3v2.frame.write.js';
export const FramePic = {
    parse: async (reader, frame, head) => {
        const enc = reader.readEncoding();
        const mimeType = head.ver <= 2 ? reader.readString(3, ascii) : reader.readStringTerminated(ascii);
        const pictureType = reader.readByte();
        const description = reader.readStringTerminated(enc);
        const value = { mimeType, pictureType: pictureType, description };
        if (mimeType === '-->') {
            value.url = reader.readStringTerminated(enc);
        }
        else {
            value.bin = reader.rest();
        }
        return { value, encoding: enc };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        const enc = getWriteTextEncoding(frame, head, defaultEncoding);
        await stream.writeEncoding(enc);
        if (head.ver <= 2) {
            await (value.url ? stream.writeString('-->', ascii) : stream.writeAsciiString(value.mimeType || '', 3));
        }
        else {
            await stream.writeStringTerminated(value.url ? '-->' : (value.mimeType || ''), ascii);
        }
        await stream.writeByte(value.pictureType);
        await stream.writeStringTerminated(value.description, enc);
        if (value.url) {
            await stream.writeString(value.url, enc);
        }
        else if (value.bin) {
            await stream.writeBuffer(value.bin);
        }
    },
    simplify: (value) => {
        if (value) {
            return `<pic ${ID3V2ValueTypes.pictureType[value.pictureType] || 'unknown'};${value.mimeType};${value.bin ? `${value.bin.length}bytes` : value.url}>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.pic.js.map