import { neededStoreBytes } from '../../../common/utils.js';
export const FramePlayCount = {
    parse: async (reader, frame) => {
        const num = reader.readUIntDynamic(frame.data.length);
        const value = { num };
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        const byteLength = neededStoreBytes(value.num, 4);
        await stream.writeBigUInt(value.num, byteLength);
    },
    simplify: (value) => {
        if (value && value.num !== undefined) {
            return value.num.toString();
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.playcount.js.map