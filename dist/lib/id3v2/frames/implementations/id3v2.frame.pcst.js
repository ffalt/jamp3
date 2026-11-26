export const FramePCST = {
    parse: async (reader) => {
        const num = reader.readUInt4Byte();
        const value = { num };
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeUInt4Byte(value.num);
    },
    simplify: (value) => value.num.toString()
};
//# sourceMappingURL=id3v2.frame.pcst.js.map