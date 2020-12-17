import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {isBitSetAt} from '../../../common/utils';
import {IID3V2} from '../../id3v2.types';
import {writeRawSubFrames} from '../id3v2.frame.write';
import {readSubFrames} from '../id3v2.frame.read';

export const FrameCTOC: IFrameImpl = {
	/**
	 3.2. Table of contents frame

	 The purpose of "CTOC" frames is to allow a table of contents to be defined. In the simplest case, a single "CTOC" frame can be used to provide a flat (single-level) table of contents. However, multiple "CTOC" frames can also be used to define a hierarchical (multi-level) table of contents.
	 There may be more than one frame of this type in a tag but each must have an Element ID that is unique with respect to any other "CTOC" or "CHAP" frame in the tag.
	 Each "CTOC" frame represents one level or element of a table of contents by providing a list of Child Element IDs. These match the Element IDs of other "CHAP" and "CTOC" frames in the tag. {{{<ID3v2.3 or ID3v2.4 frame header, ID: "CTOC"> (10 bytes) Element ID <text string> $00 Flags %000000ab Entry count $xx (8-bit unsigned int) <Child Element ID list> <Optional embedded sub-frames> }}}
	 The Element ID uniquely identifies the frame. It is not intended to be human readable and should not be presented to the end-user.
	 Flag a - Top-level bit
	 This is set to 1 to identify the top-level "CTOC" frame. This frame is the root of the Table of Contents tree and is not a child of any other "CTOC" frame. Only one "CTOC" frame in an ID3v2 tag can have this bit set to 1. In all other "CTOC" frames this bit shall be set to 0.
	 Flag b - Ordered bit
	 This should be set to 1 if the entries in the Child Element ID list are ordered or set to 0 if they not are ordered. This provides a hint as to whether the elements should be played as a continuous ordered sequence or played individually. The Entry count is the number of entries in the Child Element ID list that follows and must be greater than zero. Each entry in the list consists of:
	 {{{Child Element ID <text string> $00
		}}}
	 The last entry in the child Element ID list is followed by a sequence of optional frames that are embedded within the "CTOC" frame and which describe this element of the
	 table of contents (e.g. a "TIT2" frame representing the name of the element) or provide related material such as URLs and images. These sub-frames are contained within the
	 bounds of the "CTOC" frame as signalled by the size field in the "CTOC" frame header.
	 If a parser does not recognise "CTOC" frames it can skip them using the size field in the frame header. When it does this it will skip any embedded sub-frames carried within the frame.
	 Figure 2 shows an example of a "CTOC" frame which references a sequence of chapters. It contains a single "TIT2" sub-frame which provides a name for this element of the table of contents; "Part 1".
	 CTOCFrame-1.0.png Figure 2: Example CTOC frame
	 */
	parse: async (reader, frame, head) => {
		const id = reader.readStringTerminated(ascii);
		const bits = reader.readBitsByte();
		const ordered = isBitSetAt(bits, 0);
		const topLevel = isBitSetAt(bits, 1);
		let entrycount = reader.readBitsByte();
		if (entrycount < 0) {
			entrycount = (entrycount * -1) + 2;
		}
		const children: Array<string> = [];
		while (reader.hasData()) {
			const childId = reader.readStringTerminated(ascii);
			children.push(childId);
			if (entrycount <= children.length) {
				break;
			}
		}
		const bin = reader.rest();
		const subframes = await readSubFrames(bin, head);
		const value: IID3V2.FrameValue.ChapterToc = {id, ordered, topLevel, children};
		return {value, encoding: ascii, subframes};
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.ChapterToc>frame.value;
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
	simplify: (value: IID3V2.FrameValue.ChapterToc) => {
		if (value && value.children && value.children.length > 0) {
			return `<toc ${value.children.length}entries>`;
		}
		return null;
	}
};
