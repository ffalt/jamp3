import { ascii } from '../../../common/encodings.js';
import { neededStoreBytes } from '../../../common/utils.js';
export const FrameRelativeVolumeAdjustment2 = {
    parse: async (reader, frame) => {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const id = reader.readStringTerminated(ascii);
        const channels = [];
        while (reader.unread() >= 3) {
            const type = reader.readByte();
            const adjustment = reader.readSInt(2);
            const channel = { type, adjustment };
            if (reader.unread() >= 1) {
                const bitspeakvolume = reader.readByte();
                const bytesInPeak = bitspeakvolume > 0 ? Math.ceil(bitspeakvolume / 8) : 0;
                if (bytesInPeak > 0 && reader.unread() >= bytesInPeak) {
                    channel.peak = reader.readUInt(bytesInPeak);
                }
            }
            channels.push(channel);
        }
        const value = { id, channels };
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        for (const channel of value.channels) {
            await stream.writeByte(channel.type);
            await stream.writeSInt(channel.adjustment, 2);
            const bytes = channel.peak === undefined ? 0 : neededStoreBytes(channel.peak, 2);
            await stream.writeUInt(bytes * 8, 1);
            if (channel.peak !== undefined && bytes > 0) {
                await stream.writeUInt(channel.peak, bytes);
            }
        }
    },
    simplify: (value) => {
        if (!value || !value.id) {
            return null;
        }
        const parts = [value.id];
        const channels = value.channels || [];
        for (const channel of channels) {
            const chParts = [`type=${channel.type}`, `adj=${channel.adjustment}`];
            if (channel.peak !== undefined) {
                chParts.push(`peak=${channel.peak}`);
            }
            parts.push(chParts.join(','));
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.rva2.js.map