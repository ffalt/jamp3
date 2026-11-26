import { Markers } from '../common/marker.js';
import { BufferUtils } from '../common/buffer.js';
import { ITagID } from '../common/types.js';
import { ReaderStream } from '../common/stream-reader.js';
import { BufferReader } from '../common/buffer-reader.js';
export const ID3v1_MARKER = 'TAG';
export class ID3v1Reader {
    readTag(data) {
        if (data.length < 128 || !Markers.isMarker(data, 0, Markers.MARKERS.tag)) {
            return null;
        }
        const tag = { id: ITagID.ID3v1, start: 0, end: 0, version: 0, value: {} };
        const reader = new BufferReader(data);
        reader.position = 3;
        const value = {};
        value.title = reader.readFixedAutodectectString(30);
        value.artist = reader.readFixedAutodectectString(30);
        value.album = reader.readFixedAutodectectString(30);
        value.year = reader.readFixedAutodectectString(4);
        if ((data[125] === 0) && (data[126] !== 0)) {
            value.comment = reader.readFixedAutodectectString(29);
            tag.version = 1;
            value.track = reader.readByte();
        }
        else {
            value.comment = reader.readFixedAutodectectString(30);
            tag.version = 0;
        }
        value.genreIndex = reader.readByte();
        tag.value = value;
        return tag;
    }
    async readReaderStream(reader) {
        if (reader.end) {
            return;
        }
        const index = await reader.scan(BufferUtils.fromString(ID3v1_MARKER));
        if (index < 0) {
            return;
        }
        const data = await reader.read(400);
        if (!data || (data.length < 128)) {
            return;
        }
        if (data.length !== 128) {
            reader.unshift(data.subarray(1));
            return await this.readReaderStream(reader);
        }
        const tag = this.readTag(data);
        if (tag) {
            return tag;
        }
        reader.unshift(data.subarray(1));
        return await this.readReaderStream(reader);
    }
    async readStream(stream) {
        const reader = new ReaderStream();
        try {
            await reader.openStream(stream);
            return await this.readReaderStream(reader);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async read(filename) {
        const reader = new ReaderStream();
        try {
            await reader.open(filename);
            const tag = await this.readReaderStream(reader);
            reader.close();
            return tag;
        }
        catch (error) {
            reader.close();
            return Promise.reject(error);
        }
    }
}
//# sourceMappingURL=id3v1.reader.js.map