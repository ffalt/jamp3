import fse from 'fs-extra';
import { ID3v1Reader } from './id3v1.reader.js';
import { ID3v1Writer } from './id3v1.writer.js';
import { ITagID } from '../common/types.js';
import { updateFile } from '../common/update-file.js';
import { FileWriterStream } from '../common/stream-writer-file.js';
export class ID3v1 {
    async read(filename) {
        const reader = new ID3v1Reader();
        return await reader.read(filename);
    }
    async readStream(stream) {
        const reader = new ID3v1Reader();
        return await reader.readStream(stream);
    }
    async remove(filename, options) {
        const stat = await fse.stat(filename);
        let removed = false;
        await updateFile(filename, { id3v1: true }, !!options.keepBackup, () => true, async (layout, fileWriter) => {
            let finish = stat.size;
            for (const t of layout.tags) {
                if (t.id !== ITagID.ID3v1) {
                    continue;
                }
                removed = true;
                if (finish > t.start) {
                    finish = t.start;
                }
            }
            await fileWriter.copyRange(filename, 0, finish);
        });
        return removed;
    }
    async write(filename, tag, version, options) {
        const exists = await fse.pathExists(filename);
        await (exists ? this.replaceTag(filename, tag, version, !!options.keepBackup) : this.writeTag(filename, tag, version));
    }
    async writeTag(filename, tag, version) {
        const stream = new FileWriterStream();
        await stream.open(filename);
        const writer = new ID3v1Writer();
        try {
            await writer.write(stream, tag, version);
        }
        catch (error) {
            await stream.close();
            return Promise.reject(error);
        }
        await stream.close();
    }
    async replaceTag(filename, tag, version, keepBackup) {
        const stat = await fse.stat(filename);
        await updateFile(filename, { id3v1: true }, keepBackup, () => true, async (layout, fileWriter) => {
            let finish = stat.size;
            for (const t of layout.tags) {
                if (t.id === ITagID.ID3v1 && finish > t.start) {
                    finish = t.start;
                }
            }
            await fileWriter.copyRange(filename, 0, finish);
            const writer = new ID3v1Writer();
            await writer.write(fileWriter, tag, version);
        });
    }
}
//# sourceMappingURL=id3v1.js.map