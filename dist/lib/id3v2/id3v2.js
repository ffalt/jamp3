import fse from 'fs-extra';
import { ID3v2Reader } from './id3v2.reader.js';
import { ID3v2Writer } from './id3v2.writer.js';
import { fileRangeToBuffer } from '../common/utils.js';
import { updateFile } from '../common/update-file.js';
import { ITagID } from '../common/types.js';
import { rawHeaderOffSet } from '../mp3/mp3.mpeg.frame.js';
import { checkID3v2 } from './id3v2.check.js';
import { simplifyTag } from './id3v2.simplify.js';
import { FileWriterStream } from '../common/stream-writer-file.js';
import { writeRawFrames } from './frames/id3v2.frame.write.js';
import { buildID3v2 } from './frames/id3v2.frame.read.js';
export class ID3v2 {
    static check(tag) {
        return checkID3v2(tag);
    }
    static simplify(tag, dropIDsList) {
        return simplifyTag(tag, dropIDsList);
    }
    async read(filename) {
        const reader = new ID3v2Reader();
        const tag = await reader.read(filename);
        if (tag) {
            return buildID3v2(tag);
        }
    }
    async readStream(stream) {
        const reader = new ID3v2Reader();
        const tag = await reader.readStream(stream);
        if (tag) {
            return buildID3v2(tag);
        }
    }
    async readRaw(filename) {
        const reader = new ID3v2Reader();
        const tag = await reader.read(filename);
        if (tag) {
            return await fileRangeToBuffer(filename, tag.start, Math.max(tag.start, tag.end - 1));
        }
    }
    async remove(filename, options) {
        let removed = false;
        await updateFile(filename, { id3v2: true, mpegQuick: true }, !!options.keepBackup, layout => layout.tags.some(t => t.id === ITagID.ID3v2 && t.end > 0), async (layout, fileWriter) => {
            removed = await this.copyAudio(filename, layout, fileWriter);
        });
        return removed;
    }
    async writeBuilder(filename, builder, options) {
        await this.write(filename, { frames: builder.buildFrames() }, builder.version(), builder.rev(), options);
    }
    async write(filename, tag, version, rev, options) {
        const opts = { keepBackup: false, paddingSize: 100, ...options };
        const head = await this.buildHead(tag, version, rev);
        const raw_frames = await writeRawFrames(tag.frames, head, options.defaultEncoding);
        const exists = await fse.pathExists(filename);
        await (exists ? this.replaceTag(filename, raw_frames, head, opts) : this.writeTag(filename, raw_frames, head, opts));
    }
    async buildHead(tag, version, rev) {
        const head = { ver: version, rev: rev, size: 0, valid: true, flagBits: tag.head ? tag.head.flagBits : undefined };
        if (tag.head) {
            if (version === 4 && tag.head.v4) {
                head.v4 = tag.head.v4;
            }
            if (version === 3 && tag.head.v3) {
                head.v3 = tag.head.v3;
            }
            if (version <= 2 && tag.head.v2) {
                head.v2 = tag.head.v2;
            }
        }
        return head;
    }
    async writeTag(filename, frames, head, options) {
        const stream = new FileWriterStream();
        await stream.open(filename);
        const writer = new ID3v2Writer();
        try {
            await writer.write(stream, frames, head, options);
        }
        catch (error) {
            await stream.close();
            return Promise.reject(error);
        }
        await stream.close();
    }
    async copyAudio(filename, layout, fileWriter) {
        let start = 0;
        let specEnd = 0;
        let skipped = false;
        for (const tag of layout.tags) {
            if (!((tag.id === ITagID.ID3v2) && (start < tag.end))) {
                continue;
            }
            const rawTag = tag;
            const footerSize = rawTag.head.v4?.flags.footer ? 10 : 0;
            specEnd = rawTag.head.size + tag.start + 10 + footerSize;
            start = tag.end;
            skipped = true;
        }
        const tagAreaEnd = Math.max(start, specEnd);
        if (layout.frameheaders.length > 0) {
            const mediastart = rawHeaderOffSet(layout.frameheaders[0]);
            start = Math.min(tagAreaEnd, mediastart);
        }
        else {
            start = tagAreaEnd;
        }
        await fileWriter.copyFrom(filename, start);
        return skipped;
    }
    async replaceTag(filename, frames, head, options) {
        await updateFile(filename, { id3v2: true, mpegQuick: true }, !!options.keepBackup, () => true, async (layout, fileWriter) => {
            const writer = new ID3v2Writer();
            await writer.write(fileWriter, frames, head, options);
            await this.copyAudio(filename, layout, fileWriter);
        });
    }
}
//# sourceMappingURL=id3v2.js.map