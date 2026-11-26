import fse from 'fs-extra';
import { MP3Reader } from './mp3.reader.js';
import { rawHeaderOffSet } from './mp3.mpeg.frame.js';
import { ITagID } from '../common/types.js';
import { updateFile } from '../common/update-file.js';
import { prepareResult } from './mp3.result.js';
export class MP3 {
    async readStream(stream, options, streamSize) {
        const reader = new MP3Reader();
        const layout = await reader.readStream(stream, { streamSize, ...options });
        return await prepareResult(options, layout);
    }
    async read(filename, options) {
        const reader = new MP3Reader();
        const layout = await reader.read(filename, options);
        return await prepareResult(options, layout);
    }
    async removeTags(filename, options) {
        const stat = await fse.stat(filename);
        const opts = {
            streamSize: stat.size,
            id3v2: options.id3v2,
            detectDuplicateID3v2: options.id3v2,
            id3v1: options.id3v1,
            mpegQuick: options.id3v2
        };
        let id2v1removed = false;
        let id2v2removed = false;
        await updateFile(filename, opts, !!options.keepBackup, layout => {
            for (const tag of layout.tags) {
                if ((options.id3v2 && tag.id === ITagID.ID3v2 && tag.end > 0) ||
                    (options.id3v1 && tag.id === ITagID.ID3v1 && tag.end === stat.size && tag.start < stat.size)) {
                    return true;
                }
            }
            return false;
        }, async (layout, fileWriter) => {
            let start = 0;
            let finish = stat.size;
            let specEnd = 0;
            for (const tag of layout.tags) {
                if (tag.id === ITagID.ID3v2 && options.id3v2) {
                    if (start < tag.end) {
                        specEnd = tag.head.size + tag.start + 10;
                        start = tag.end;
                        id2v2removed = true;
                    }
                }
                else if (tag.id === ITagID.ID3v1 && options.id3v1 && tag.end === stat.size && finish > tag.start) {
                    finish = tag.start;
                    id2v1removed = true;
                }
            }
            if (options.id3v2) {
                start = layout.frameheaders.length > 0 ? rawHeaderOffSet(layout.frameheaders[0]) : Math.max(start, specEnd);
            }
            if (finish > start) {
                await fileWriter.copyRange(filename, start, finish);
            }
        });
        return id2v2removed || id2v1removed ? { id3v2: id2v2removed, id3v1: id2v1removed } : undefined;
    }
}
//# sourceMappingURL=mp3.js.map