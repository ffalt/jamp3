import { Id3v2RawWriter } from './id3v2.writer.raw.js';
export class ID3v2Writer {
    async write(stream, frames, head, options) {
        if (head.ver === 0 || head.ver > 4) {
            return Promise.reject(new Error('Unsupported Version'));
        }
        const writer = new Id3v2RawWriter(stream, head, options, frames);
        await writer.write();
    }
}
//# sourceMappingURL=id3v2.writer.js.map