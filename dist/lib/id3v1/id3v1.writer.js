class Id3v1RawWriter {
    constructor(stream, tag, version) {
        this.stream = stream;
        this.version = version;
        this.tag = tag;
    }
    async write() {
        await this.stream.writeAscii('TAG');
        await this.stream.writeFixedAsciiString(this.tag.title || '', 30);
        await this.stream.writeFixedAsciiString(this.tag.artist || '', 30);
        await this.stream.writeFixedAsciiString(this.tag.album || '', 30);
        await this.stream.writeFixedAsciiString(this.tag.year || '', 4);
        if (this.version === 0) {
            await this.stream.writeFixedAsciiString(this.tag.comment || '', 30);
        }
        else {
            await this.stream.writeFixedAsciiString(this.tag.comment || '', 28);
            await this.stream.writeByte(0);
            await this.stream.writeByte(this.tag.track || 0);
        }
        await this.stream.writeByte(this.tag.genreIndex || 0);
    }
}
export class ID3v1Writer {
    async write(stream, tag, version) {
        if (version < 0 || version > 1) {
            return Promise.reject(new Error('Unsupported Version'));
        }
        const writer = new Id3v1RawWriter(stream, tag, version);
        await writer.write();
    }
}
//# sourceMappingURL=id3v1.writer.js.map