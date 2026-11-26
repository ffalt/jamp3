import { ascii } from '../../../common/encodings.js';
import { neededStoreBytes } from '../../../common/utils.js';
export const FramePopularimeter = {
    parse: async (reader) => {
        const email = reader.readStringTerminated(ascii);
        const rating = reader.readByte();
        let count = 0;
        if (reader.hasData()) {
            count = reader.readUIntDynamic(reader.unread());
        }
        const value = { count, rating, email };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.email, ascii);
        await stream.writeByte(value.rating);
        if (value.count > 0) {
            const byteLength = neededStoreBytes(value.count, 4);
            await stream.writeBigUInt(value.count, byteLength);
        }
    },
    simplify: (value) => {
        if (value && value.email !== undefined) {
            return value.email + (value.count === undefined ? '' : `;count=${value.count}`) + (value.rating === undefined ? '' : `;rating=${value.rating}`);
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.popularimeter.js.map