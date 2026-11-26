import { ascii } from '../../../common/encodings.js';
export const FrameAENC = {
    parse: async (reader) => {
        const id = reader.readStringTerminated(ascii);
        if (reader.unread() < 2) {
            return Promise.reject(new Error('Not enough data'));
        }
        const previewStart = reader.readUInt2Byte();
        if (reader.unread() < 2) {
            return Promise.reject(new Error('Not enough data'));
        }
        const previewLength = reader.readUInt2Byte();
        const bin = reader.rest();
        const value = { id, previewStart, previewLength, bin };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        await stream.writeUInt2Byte(value.previewStart);
        await stream.writeUInt2Byte(value.previewLength);
        await stream.writeBuffer(value.bin);
    },
    simplify: (value) => {
        if (!value || value.id === undefined) {
            return null;
        }
        const parts = [value.id];
        if (value.previewStart !== undefined) {
            parts.push(`start=${value.previewStart}`);
        }
        if (value.previewLength !== undefined) {
            parts.push(`length=${value.previewLength}`);
        }
        if (value.bin && value.bin.length > 0) {
            parts.push(`bin=${value.bin.length}bytes`);
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.aenc.js.map