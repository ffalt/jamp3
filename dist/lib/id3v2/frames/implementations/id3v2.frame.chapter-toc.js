import { ascii } from '../../../common/encodings.js';
import { isBitSetAt } from '../../../common/utils.js';
import { writeRawSubFrames } from '../id3v2.frame.write.js';
import { readSubFrames } from '../id3v2.frame.read.js';
export const FrameCTOC = {
    parse: async (reader, frame, head) => {
        const id = reader.readStringTerminated(ascii);
        const bits = reader.readBitsByte();
        const ordered = isBitSetAt(bits, 0);
        const topLevel = isBitSetAt(bits, 1);
        const entrycount = reader.readBitsByte();
        const children = [];
        while (reader.hasData()) {
            const childId = reader.readStringTerminated(ascii);
            children.push(childId);
            if (entrycount <= children.length) {
                break;
            }
        }
        const bin = reader.rest();
        const subframes = await readSubFrames(bin, head);
        const value = { id, ordered, topLevel, children };
        return { value, encoding: ascii, subframes };
    },
    write: async (frame, stream, head, defaultEncoding) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        await stream.writeByte((value.ordered ? 1 : 0) + ((value.topLevel ? 1 : 0) * 2));
        await stream.writeByte(value.children.length);
        for (const childId of value.children) {
            await stream.writeStringTerminated(childId, ascii);
        }
        if (frame.subframes) {
            await writeRawSubFrames(frame.subframes, stream, head, defaultEncoding);
        }
    },
    simplify: (value) => {
        if (value && value.children && value.children.length > 0) {
            return `<toc ${value.children.length}entries>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.chapter-toc.js.map