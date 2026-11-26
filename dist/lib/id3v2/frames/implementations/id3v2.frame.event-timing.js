export const FrameETCO = {
    parse: async (reader) => {
        const format = reader.readBitsByte();
        const events = [];
        while (reader.unread() >= 5) {
            const type = reader.readBitsByte();
            const timestamp = reader.readUInt4Byte();
            events.push({ type, timestamp });
        }
        const value = { format, events };
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeByte(value.format);
        const events = value.events || [];
        for (const event of events) {
            await stream.writeByte(event.type);
            await stream.writeUInt4Byte(event.timestamp);
        }
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        const events = (value.events || []).map(e => `${e.type}@${e.timestamp}`);
        return [`format=${value.format}`, ...events].join(';');
    }
};
//# sourceMappingURL=id3v2.frame.event-timing.js.map