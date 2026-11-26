export const FrameRGAD = {
    parse: async (reader) => {
        const peak = reader.readUInt4Byte();
        const radioAdjustment = reader.readSInt2Byte();
        const audiophileAdjustment = reader.readSInt2Byte();
        const value = { peak, radioAdjustment, audiophileAdjustment };
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeUInt4Byte(value.peak);
        await stream.writeSInt2Byte(value.radioAdjustment);
        await stream.writeSInt2Byte(value.audiophileAdjustment);
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        const parts = [`peak=${value.peak}`, `radio=${value.radioAdjustment}`, `audiophile=${value.audiophileAdjustment}`];
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.gain-adjustment.js.map