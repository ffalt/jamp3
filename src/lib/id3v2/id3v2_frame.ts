import {Encodings, IEncoding} from '../common/encodings';
import {DataReader, WriterStream} from '../common/streams';
import {isBitSetAt, neededStoreBytes, removeZeroString} from '../common/utils';
import {readSubFrames, writeSubFrames} from './id3v2_frames';
import {ID3v2_ValuePicTypes, IID3V2} from './id3v2__types';
import {ID3v2} from './id3v2';

const ascii = Encodings['ascii'];
const binary = Encodings['binary'];
const utf8 = Encodings['utf-8'];

function getWriteTextEncoding(frame: IID3V2.Frame, head: IID3V2.TagHeader): IEncoding {
	return frame.head ? Encodings[frame.head.encoding || 'utf-8'] || utf8 : utf8;
}

export interface IFrameImpl {
	parse: (reader: DataReader, frame: IID3V2.RawFrame, head: IID3V2.TagHeader) => Promise<{ value: IID3V2.FrameValue.Base, encoding?: IEncoding, subframes?: Array<IID3V2.Frame> }>;
	write: (frame: IID3V2.Frame, stream: WriterStream, head: IID3V2.TagHeader) => Promise<void>;
	simplify: (value: any) => string | null;
}

export const FrameIdAscii: IFrameImpl = {
	/**
	 Owner identifier    <text string> $00
	 Identifier    <up to 64 bytes binary data>
	 */
	parse: async (reader) => {
		const id = reader.readStringTerminated(ascii);
		const text = reader.readStringTerminated(ascii);
		const value: IID3V2.FrameValue.IdAscii = {id, text};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.IdAscii>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		stream.writeString(value.text, ascii);
	},
	simplify: (value: IID3V2.FrameValue.IdAscii) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameLangDescText: IFrameImpl = {
	/**
	 Text encoding          $xx
	 Language               $xx xx xx
	 Short content descrip. <text string according to encoding> $00 (00)
	 The actual text        <full text string according to encoding>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const language = removeZeroString(reader.readString(3, ascii)).trim();
		const id = reader.readStringTerminated(enc);
		const text = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.LangDescText = {id, language, text};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.LangDescText>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeAsciiString(value.language || '', 3);
		stream.writeStringTerminated(value.id || '', enc);
		stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.LangDescText) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameIdBin: IFrameImpl = {
	/**
	 Owner identifier        <text string> $00
	 The private data        <binary data>
	 */
	parse: async (reader) => {
		const id = reader.readStringTerminated(ascii);
		const bin = reader.rest();
		const value: IID3V2.FrameValue.IdBin = {id, bin};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.IdBin>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.IdBin) => {
		if (value && value.bin && value.bin.length > 0) {
			return '<bin ' + value.bin.length + 'bytes>';
		}
		return null;
	}
};

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
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.ChapterToc>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		stream.writeByte((value.ordered ? 1 : 0) + ((value.topLevel ? 1 : 0) * 2));
		stream.writeByte(value.children.length);
		value.children.forEach(childId => {
			stream.writeStringTerminated(childId, ascii);
		});
		if (frame.subframes) {
			await writeSubFrames(frame.subframes, stream, head);
		}
	},
	simplify: (value: IID3V2.FrameValue.ChapterToc) => {
		if (value && value.children && value.children.length > 0) {
			return '<toc ' + value.children.length + 'entries>';
		}
		return null;
	}
};

export const FrameCHAP: IFrameImpl = {
	/**
	 <ID3v2.3 or ID3v2.4 frame header, ID: "CHAP">           (10 bytes)
	 Element ID      <text string> $00
	 Start time      $xx xx xx xx
	 End time        $xx xx xx xx
	 Start offset    $xx xx xx xx
	 End offset      $xx xx xx xx
	 <Optional embedded sub-frames>
	 */
	parse: async (reader, frame, head) => {
		const id = reader.readStringTerminated(ascii);
		const start = reader.readUInt4Byte();
		const end = reader.readUInt4Byte();
		const offset = reader.readUInt4Byte();
		const offsetEnd = reader.readUInt4Byte();
		const bin = reader.rest();
		const subframes = await readSubFrames(bin, head);
		const value: IID3V2.FrameValue.Chapter = {id, start, end, offset, offsetEnd};
		return {value, encoding: ascii, subframes};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.Chapter>frame.value;
		const enc = Encodings['ascii'];
		stream.writeStringTerminated(value.id, enc);
		stream.writeUInt4Byte(value.start);
		stream.writeUInt4Byte(value.end);
		stream.writeUInt4Byte(value.offset);
		stream.writeUInt4Byte(value.offsetEnd);
		if (frame.subframes) {
			await writeSubFrames(frame.subframes, stream, head);
		}
	},
	simplify: (value: IID3V2.FrameValue.Chapter) => {
		if (value && value.id && value.id.length > 0) {
			return '<chapter ' + value.id + '>';
		}
		return null;
	}
};

export const FramePic: IFrameImpl = {
	/**
	 v2.3/4
	 Text encoding   $xx
	 MIME type       <text string> $00
	 Picture type    $xx
	 Description     <text string according to encoding> $00 (00)
	 Picture data    <binary data>

	 v2.2
	 Text encoding      $xx
	 Image format       $xx xx xx
	 Picture type       $xx
	 Description        <textstring> $00 (00)
	 Picture data       <binary data>

	 */
	parse: async (reader, frame, head) => {
		const enc = reader.readEncoding();
		let mimeType;
		if (head.ver === 2) {
			mimeType = reader.readString(3, ascii);
		} else {
			mimeType = reader.readStringTerminated(ascii);
		}
		const pictureType = reader.readByte();
		const description = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.Pic = {mimeType, pictureType: pictureType, description};
		if (mimeType === '-->') {
			value.url = reader.readStringTerminated(enc);
		} else {
			value.bin = reader.rest();
		}
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.Pic>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		if (head.ver === 2) {
			if (value.url) {
				stream.writeString('-->', ascii);
			} else {
				stream.writeAsciiString(value.mimeType || '', 3);
			}
		} else {
			stream.writeStringTerminated(value.url ? value.url : (value.mimeType || ''), ascii);
		}
		stream.writeByte(value.pictureType);
		stream.writeStringTerminated(value.description, enc);
		if (value.url) {
			stream.writeString(value.url, enc);
		} else if (value.bin) {
			stream.writeBuffer(value.bin);
		}
	},
	simplify: (value: IID3V2.FrameValue.Pic) => {
		if (value) {
			return '<pic ' + (ID3v2_ValuePicTypes[value.pictureType] || 'unknown') + ';' + value.mimeType + ';' +
				(value.bin ? value.bin.length + 'bytes' : value.url) + '>';
		}
		return null;
	}
};

export const FrameText: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Information    <text string according to encoding>
	 */
	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return {value: {text: ''}, encoding: utf8};
		}
		const enc = reader.readEncoding();
		const text = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.Text = {text};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.Text>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.Text) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameTextConcatList: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Information    <text string according to encoding>
	 */
	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return {value: {text: ''}, encoding: utf8};
		}
		const enc = reader.readEncoding();
		let text = reader.readStringTerminated(enc);
		while (reader.hasData()) {
			const appendtext = reader.readStringTerminated(enc);
			if (appendtext.length > 0) {
				text += '/' + appendtext;
			}
		}
		const value: IID3V2.FrameValue.Text = {text};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.Text>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.Text) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameTextList: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Information    <text string according to encoding>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const list: Array<string> = [];
		while (reader.hasData()) {
			const text = reader.readStringTerminated(enc);
			if (text.length > 0) {
				list.push(text);
			}
		}
		const value: IID3V2.FrameValue.TextList = {list};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.TextList>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		value.list.forEach((entry, index) => {
			stream.writeString(entry, enc);
			if (index !== value.list.length - 1) {
				stream.writeTerminator(enc);
			}
		});
	},
	simplify: (value: IID3V2.FrameValue.TextList) => {
		if (value && value.list && value.list.length > 0) {
			return value.list.join(' / ');
		}
		return null;
	}
};

export const FrameAsciiValue: IFrameImpl = {
	/**
	 Information    <text string>
	 */
	parse: async (reader) => {
		const text = reader.readStringTerminated(ascii);
		const value: IID3V2.FrameValue.Ascii = {text};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Ascii>frame.value;
		stream.writeString(value.text, ascii);
	},
	simplify: (value: IID3V2.FrameValue.Ascii) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameIdText: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Description    <text string according to encoding> $00 (00)
	 Value    <text string according to encoding>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const id = reader.readStringTerminated(enc);
		const text = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.IdText = {id, text};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeStringTerminated(value.id, enc);
		stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.IdText) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};

export const FrameMusicCDId: IFrameImpl = {
	/**
	 This frame is intended for music that comes from a CD, so that the CD can be
	 identified in databases such as the CDDB. The frame consists of a binary dump of the
	 Table Of Contents, TOC, from the CD, which is a header of 4 bytes and then 8 bytes/track
	 on the CD plus 8 bytes for the 'lead out' making a maximum of 804 bytes. The offset to the beginning
	 of every track on the CD should be described with a four bytes absolute CD-frame address per track,
	 and not with absolute time. This frame requires a present and valid "TRCK" frame, even if the CD's only
	 got one track. There may only be one "MCDI" frame in each tag.

	 <Header for 'Music CD identifier', ID: "MCDI">
	 CD TOC <binary data>
	 */
	parse: async (reader, frame) => {
		const value: IID3V2.FrameValue.Bin = {bin: frame.data};
		return {value, encoding: binary};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Bin>frame.value;
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.IdBin) => {
		if (value && value.bin && value.bin.length > 0) {
			return '<bin ' + value.bin.length + 'bytes>';
		}
		return null;
	}
};

export const FramePlayCounter: IFrameImpl = {
	/**
	 This is simply a counter of the number of times a file has been played. The value is increased by one every time the file begins to play.
	 There may only be one "PCNT" frame in each tag. When the counter reaches all one's, one byte is inserted in front of the
	 counter thus making the counter eight bits bigger.
	 The counter must be at least 32-bits long to begin with.
	 <Header for 'Play counter', ID: "PCNT">
	 Counter         $xx xx xx xx (xx ...)
	 */
	parse: async (reader, frame) => {
		let num = 0;
		try {
			num = reader.readUInt(frame.data.length);
		} catch (e) {
		}
		const value: IID3V2.FrameValue.Number = {num};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Number>frame.value;
		const byteLength = neededStoreBytes(value.num, 4);
		stream.writeUInt(value.num, byteLength);
	},
	simplify: (value: IID3V2.FrameValue.Number) => {
		if (value && value.num !== undefined) {
			return value.num.toString();
		}
		return null;
	}
};

export const FramePopularimeter: IFrameImpl = {
	/**
	 The purpose of this frame is to specify how good an audio file is.
	 Many interesting applications could be found to this frame such as a playlist
	 that features better audiofiles more often than others or it could be used to
	 profile a person's taste and find other 'good' files by comparing people's profiles.
	 The frame is very simple. It contains the email address to the user, one rating byte and a four byte play counter,
	 intended to be increased with one for every time the file is played. The email is a terminated string.
	 The rating is 1-255 where 1 is worst and 255 is best. 0 is unknown. If no personal counter is wanted it
	 may be omitted. When the counter reaches all one's, one byte is inserted in front of the counter thus making
	 the counter eight bits bigger in the same away as the play counter ("PCNT").
	 There may be more than one "POPM" frame in each tag, but only one with the same email address.

	 <Header for 'Popularimeter', ID: "POPM">
	 Email to user   <text string> $00
	 Rating          $xx
	 Counter         $xx xx xx xx (xx ...)


	 Popularimeter   "POP"
	 Email to user   <textstring> $00
	 Rating          $xx
	 Counter         $xx xx xx xx (xx ...)
	 */
	parse: async (reader) => {
		const email = reader.readStringTerminated(ascii);
		const rating = reader.readByte();
		let count = 0;
		if (reader.hasData()) {
			try {
				count = reader.readUInt(reader.unread());
			} catch (e) {
				count = 0;
			}
		}
		const value: IID3V2.FrameValue.Popularimeter = {count, rating, email};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Popularimeter>frame.value;
		stream.writeStringTerminated(value.email, ascii);
		stream.writeByte(value.rating);
		if (value.count > 0) {
			const byteLength = neededStoreBytes(value.count, 4);
			stream.writeUInt(value.count, byteLength);
		}
	},
	simplify: (value: IID3V2.FrameValue.Popularimeter) => {
		if (value && value.email !== undefined) {
			return value.email + (value.count !== undefined ? ';count=' + value.count : '') + (value.rating !== undefined ? ';rating=' + value.rating : '');
		}
		return null;
	}
};

export const FrameRelativeVolumeAdjustment: IFrameImpl = {
	/**
	 It allows the user to say how much he wants to increase/decrease the volume on each channel while the file is played.
	 The purpose is to be able to align all files to a reference volume, so that you don't have to change the volume constantly. This frame may also be used to balance adjust the audio.
	 If the volume peak levels are known then this could be described with the 'Peak volume right' and 'Peak volume left' field. If Peakvolume is not known these fields could be left zeroed or,
	 if no other data follows, be completely omitted. There may only be one "RVAD" frame in each tag.

	 <Header for 'Relative volume adjustment', ID: "RVAD">
	 Increment/decrement             %00xxxxxx
	 Bits used for volume descr.     $xx
	 Relative volume change, right   $xx xx (xx ...)
	 Relative volume change, left    $xx xx (xx ...)
	 Peak volume right               $xx xx (xx ...)
	 Peak volume left                $xx xx (xx ...)

	 In the increment/decrement field bit 0 is used to indicate the right channel and bit 1 is used to indicate the left channel. 1 is increment and 0 is decrement.

	 The 'bits used for volume description' field is normally $10 (16 bits) for MPEG 2 layer I, II and III and MPEG 2.5. This value may not be $00. The volume is always represented with whole bytes, padded in the beginning (highest bits) when 'bits used for volume description' is not a multiple of eight.

	 This datablock is then optionally followed by a volume definition for the left and right back channels. If this information is appended to the frame the first two channels will be treated as front channels. In the increment/decrement field bit 2 is used to indicate the right back channel and bit 3 for the left back channel.

	 Relative volume change, right back      $xx xx (xx ...)
	 Relative volume change, left back       $xx xx (xx ...)
	 Peak volume right back                  $xx xx (xx ...)
	 Peak volume left back                   $xx xx (xx ...)

	 If the center channel adjustment is present the following is appended to the existing frame, after the left and right back channels. The center channel is represented by bit 4 in the increase/decrease field.

	 Relative volume change, center  $xx xx (xx ...)
	 Peak volume center              $xx xx (xx ...)

	 If the bass channel adjustment is present the following is appended to the existing frame, after the center channel. The bass channel is represented by bit 5 in the increase/decrease field.

	 Relative volume change, bass    $xx xx (xx ...)
	 Peak volume bass                $xx xx (xx ...)
	 */

	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return {value: {}};
		}
		const flags = reader.readBitsByte();
		const bitLength = reader.readBitsByte();
		const byteLength = bitLength / 8;
		if (byteLength <= 1 || byteLength > 4) {
			return Promise.reject(Error('Unsupported description bit size of: ' + bitLength));
		}
		let val = reader.readUInt(byteLength);
		const right = (isBitSetAt(flags, 0) || (val === 0) ? 1 : -1) * val;
		val = reader.readUInt(byteLength);
		const left = (isBitSetAt(flags, 1) || (val === 0) ? 1 : -1) * val;
		const value: IID3V2.FrameValue.RVA = {
			right, left
		};
		if (reader.unread() >= byteLength * 2) {
			value.peakRight = reader.readUInt(byteLength);
			value.peakLeft = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.peakRight = reader.readUInt(byteLength);
			value.peakLeft = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.rightBack = (isBitSetAt(flags, 4) ? 1 : -1) * reader.readUInt(byteLength);
			value.leftBack = (isBitSetAt(flags, 8) ? 1 : -1) * reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.peakRightBack = reader.readUInt(byteLength);
			value.peakLeftBack = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.center = (isBitSetAt(flags, 10) ? 1 : -1) * reader.readUInt(byteLength);
			value.peakCenter = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.bass = (isBitSetAt(flags, 20) ? 1 : -1) * reader.readUInt(byteLength);
			value.peakBass = reader.readUInt(byteLength);
		}
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.RVA>frame.value;
		const flags = [
			0,
			0,
			value.bass !== undefined ? (value.bass >= 0 ? 0 : 1) : 0,
			value.center !== undefined ? (value.center >= 0 ? 0 : 1) : 0,
			value.leftBack !== undefined ? (value.leftBack >= 0 ? 0 : 1) : 0,
			value.rightBack !== undefined ? (value.rightBack >= 0 ? 0 : 1) : 0,
			value.left < 0 ? 0 : 1,
			value.right < 0 ? 0 : 1
		];
		stream.writeBitsByte(flags);
		let byteLength = 2;
		Object.keys(value).forEach(key => {
			const num = <number>(<any>value)[key];
			if (!isNaN(num)) {
				byteLength = Math.max(neededStoreBytes(Math.abs(num), 2), byteLength);
			}
		});
		stream.writeByte(byteLength * 8);
		stream.writeUInt(Math.abs(value.right), byteLength);
		stream.writeUInt(Math.abs(value.left), byteLength);
		if (value.peakRight !== undefined && value.peakLeft !== undefined) {
			stream.writeUInt(value.peakRight, byteLength);
			stream.writeUInt(value.peakLeft, byteLength);
			if (value.rightBack !== undefined && value.leftBack !== undefined) {
				stream.writeUInt(Math.abs(value.rightBack), byteLength);
				stream.writeUInt(Math.abs(value.leftBack), byteLength);
				if (value.peakRightBack !== undefined && value.peakLeftBack !== undefined) {
					stream.writeUInt(value.peakRightBack, byteLength);
					stream.writeUInt(value.peakLeftBack, byteLength);
					if (value.center !== undefined && value.peakCenter !== undefined) {
						stream.writeUInt(Math.abs(value.center), byteLength);
						stream.writeUInt(value.peakLeftBack, byteLength);
						if (value.bass !== undefined && value.peakBass !== undefined) {
							stream.writeUInt(Math.abs(value.center), byteLength);
							stream.writeUInt(value.peakCenter, byteLength);
						}
					}
				}
			}
		}
	},
	simplify: (value: IID3V2.FrameValue.RVA) => {
		return null; // TODO simplify IID3V2.FrameValue.RVA
	}
};

export const FrameRelativeVolumeAdjustment2: IFrameImpl = {
	/**
	 4.11.   Relative volume adjustment (2)

	 This is a more subjective frame than the previous ones. It allows the
	 user to say how much he wants to increase/decrease the volume on each
	 channel when the file is played. The purpose is to be able to align
	 all files to a reference volume, so that you don't have to change the
	 volume constantly. This frame may also be used to balance adjust the
	 audio. The volume adjustment is encoded as a fixed point decibel
	 value, 16 bit signed integer representing (adjustment*512), giving
	 +/- 64 dB with a precision of 0.001953125 dB. E.g. +2 dB is stored as
	 $04 00 and -2 dB is $FC 00. There may be more than one "RVA2" frame
	 in each tag, but only one with the same identification string.

	 <Header for 'Relative volume adjustment (2)', ID: "RVA2">
	 Identification          <text string> $00

	 The 'identification' string is used to identify the situation and/or
	 device where this adjustment should apply. The following is then
	 repeated for every channel

	 Type of channel         $xx
	 Volume adjustment       $xx xx
	 Bits representing peak  $xx
	 Peak volume             $xx (xx ...)


	 Type of channel:  $00  Other
	 $01  Master volume
	 $02  Front right
	 $03  Front left
	 $04  Back right
	 $05  Back left
	 $06  Front centre
	 $07  Back centre
	 $08  Subwoofer

	 Bits representing peak can be any number between 0 and 255. 0 means
	 that there is no peak volume field. The peak volume field is always
	 padded to whole bytes, setting the most significant bits to zero.
	 */

	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return {value: {}};
		}
		// const AdjustmentType: any = {
		// 	0: 'Other',
		// 	1: 'Master volume',
		// 	2: 'Front right',
		// 	3: 'Front left',
		// 	4: 'Back right',
		// 	5: 'Back left',
		// 	6: 'Front centre',
		// 	7: 'Back centre',
		// 	8: 'Subwoofer'
		// };
		const id = reader.readStringTerminated(ascii);
		const channels: Array<IID3V2.FrameValue.RVA2Channel> = [];
		while (reader.unread() >= 3) {
			const type = reader.readByte();
			const adjustment = reader.readSInt(2); // 16-bit signed
			const channel: IID3V2.FrameValue.RVA2Channel = {type, adjustment};
			while (reader.unread() >= 1) {
				const bitspeakvolume = reader.readByte();
				const bytesInPeak = bitspeakvolume > 0 ? Math.ceil(bitspeakvolume / 8) : 0;
				if (bytesInPeak > 0 && reader.unread() >= bytesInPeak) {
					channel.peak = reader.readUInt(bytesInPeak);
				}
			}
			channels.push(channel);
		}
		const value: IID3V2.FrameValue.RVA2 = {id, channels};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.RVA2>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		value.channels.forEach(channel => {
			stream.writeByte(channel.type);
			stream.writeSInt(channel.adjustment, 2);
			const bytes = channel.peak === undefined ? 0 : neededStoreBytes(channel.peak, 2);
			stream.writeUInt(bytes * 8, 2);
			if (channel.peak !== undefined && bytes > 0) {
				stream.writeUInt(channel.peak, bytes);
			}
		});
	},
	simplify: (value: IID3V2.FrameValue.RVA2) => {
		return null; // TODO simplify IID3V2.FrameValue.RVA2
	}
};

export const FramePartOfCompilation: IFrameImpl = {
	/**
	 TCMP
	 This is a simple text frame that iTunes uses to indicate if the file is part of a compilation.

	 Information
	 1 if part of a compilation
	 0 or not present if not part of a compilation

	 This is written to a v2.2 tag as TCP.
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const intAsString = reader.readStringTerminated(enc);
		const i = parseInt(intAsString, 10).toString();
		const value: IID3V2.FrameValue.Bool = {bool: i === '1'};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.Bool>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeStringTerminated(value.bool ? '1' : '0', enc);
	},
	simplify: (value: IID3V2.FrameValue.Bool) => {
		if (value) {
			return value.bool ? 'true' : 'false';
		}
		return null;
	}
};

export const FramePCST: IFrameImpl = {
	/**
	 // PCST
	 Itunes - Indicates a podcast.

	 This is written to a v2.2 tag as PCS.
	 */
	parse: async (reader) => {
		const num = reader.readUInt4Byte();
		const value: IID3V2.FrameValue.Number = {num};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Number>frame.value;
		stream.writeUInt4Byte(value.num);
	},
	simplify: (value: IID3V2.FrameValue.Number) => {
		return value.num.toString();
	}
};

export const FrameETCO: IFrameImpl = {
	/*
	 This frame allows synchronisation with key events in a song or sound. The header is:

	 <Header for 'Event timing codes', ID: "ETCO">
	 Time stamp format    $xx

	 Where time stamp format is:

	 $01 Absolute time, 32 bit sized, using MPEG frames as unit
	 $02 Absolute time, 32 bit sized, using milliseconds as unit

	 Abolute time means that every stamp contains the time from the beginning of the file.

	 Followed by a list of key events in the following format:

	 Type of event   $xx
	 Time stamp      $xx (xx ...)

	 The 'Time stamp' is set to zero if directly at the beginning of the sound or after the previous event. All events should be sorted in chronological order. The type of event is as follows:

	 $00     padding (has no meaning)
	 $01     end of initial silence
	 $02     intro start
	 $03     mainpart start
	 $04     outro start
	 $05     outro end
	 $06     verse start
	 $07     refrain start
	 $08     interlude start
	 $09     theme start
	 $0A     variation start
	 $0B     key change
	 $0C     time change
	 $0D     momentary unwanted noise (Snap, Crackle & Pop)
	 $0E     sustained noise
	 $0F     sustained noise end
	 $10     intro end
	 $11     mainpart end
	 $12     verse end
	 $13     refrain end
	 $14     theme end
	 $15-$DF reserved for future use
	 $E0-$EF not predefined sync 0-F
	 $F0-$FC reserved for future use
	 $FD     audio end (start of silence)
	 $FE     audio file ends
	 $FF     one more byte of events follows (all the following bytes with the value $FF have the same function)

	 Terminating the start events such as "intro start" is not required. The 'Not predefined sync's ($E0-EF) are for user events. You might want to synchronise your music to something, like setting of an explosion on-stage, turning on your screensaver etc.

	 There may only be one "ETCO" frame in each tag.
 */
	parse: async (reader) => {
		const format = reader.readBitsByte();
		const events: Array<{ type: number, timestamp: number }> = [];
		while (reader.unread() >= 5) {
			const type = reader.readBitsByte();
			const timestamp = reader.readUInt4Byte();
			events.push({type, timestamp});
		}
		const value: IID3V2.FrameValue.EventTimingCodes = {format, events};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.EventTimingCodes>frame.value;
		stream.writeByte(value.format);
		(value.events || []).forEach(event => {
			stream.writeUByte(event.type);
			stream.writeUInt4Byte(event.timestamp);
		});
	},
	simplify: (value: IID3V2.FrameValue.EventTimingCodes) => {
		return null; // TODO simplify IID3V2.FrameValue.EventTimingCodes
	}
};

export const FrameAENC: IFrameImpl = {
	/**
	 This frame indicates if the actual audio stream is encrypted, and by whom. Since standardization of such encryption scheme is beyond this document, all "AENC" frames begin
	 with a terminated string with a URL containing an email address, or a link to a location where an email address can be found, that belongs to the organisation responsible
	 for this specific encrypted audio file. Questions regarding the encrypted audio should be sent to the email address specified. If a $00 is found directly after the 'Frame size'
	 and the audiofile indeed is encrypted, the whole file may be considered useless.

	 After the 'Owner identifier', a pointer to an unencrypted part of the audio can be specified. The 'Preview start' and 'Preview length' is described in frames.
	 If no part is unencrypted, these fields should be left zeroed. After the 'preview length' field follows optionally a datablock required for decryption of the audio.
	 There may be more than one "AENC" frames in a tag, but only one with the same 'Owner identifier'.

	 <Header for 'Audio encryption', ID: "AENC">
	 Owner identifier        <text string> $00
	 Preview start           $xx xx
	 Preview length          $xx xx
	 Encryption info         <binary data>
	 */
	parse: async (reader) => {
		const id = reader.readStringTerminated(ascii);
		if (reader.unread() < 2) {
			return Promise.reject(Error('Not enough data'));
		}
		const previewStart = reader.readUInt2Byte();
		if (reader.unread() < 2) {
			return Promise.reject(Error('Not enough data'));
		}
		const previewLength = reader.readUInt2Byte();
		const bin = reader.rest();
		const value: IID3V2.FrameValue.AudioEncryption = {id, previewStart, previewLength, bin};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.AudioEncryption>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		stream.writeUInt2Byte(value.previewStart);
		stream.writeUInt2Byte(value.previewLength);
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.AudioEncryption) => {
		return null; // TODO simplify IID3V2.FrameValue.AudioEncryption
	}
};

export const FrameLINK: IFrameImpl = {
	/**
	 v2.3:
	 To keep space waste as low as possible this frame may be used to link information from another ID3v2 tag that might reside in another audio file or alone in a binary file.
	 It is recommended that this method is only used when the files are stored on a CD-ROM or other circumstances when the risk of file seperation is low. The frame contains a
	 frame identifier, which is the frame that should be linked into this tag, a URL field, where a reference to the file where the frame is given, and additional ID data,
	 if needed. Data should be retrieved from the first tag found in the file to which this link points. There may be more than one "LINK" frame in a tag, but only one with
	 the same contents. A linked frame is to be considered as part of the tag and has the same restrictions as if it was a physical part of the tag (i.e. only one "RVRB" frame allowed,
	 whether it's linked or not).

	 <Header for 'Linked information', ID: "LINK">
	 URL                     <text string> $00
	 ID and additional data  <text string(s)>

	 Frames that may be linked and need no additional data are "IPLS", "MCID", "ETCO", "MLLT", "SYTC", "RVAD", "EQUA", "RVRB", "RBUF", the text information frames and the URL link frames.
	 The "TXXX", "APIC", "GEOB" and "AENC" frames may be linked with the content descriptor as additional ID data.
	 The "COMM", "SYLT" and "USLT" frames may be linked with three bytes of language descriptor directly followed by a content descriptor as additional ID data.

	 v2.4
	 To keep information duplication as low as possible this frame may be used to link information from another ID3v2 tag that might reside in
	 another audio file or alone in a binary file. It is RECOMMENDED that this method is only used when the files are stored on a CD-ROM or
	 other circumstances when the risk of file separation is low. The frame contains a frame identifier, which is the frame that should be
	 linked into this tag, a URL [URL] field, where a reference to the file where the frame is given, and additional ID data, if needed.
	 Data should be retrieved from the first tag found in the file to which this link points. There may be more than one "LINK" frame in a
	 tag, but only one with the same contents. A linked frame is to be considered as part of the tag and has the same restrictions as if it
	 was a physical part of the tag (i.e. only one "RVRB" frame allowed, whether it's linked or not).

	 <Header for 'Linked information', ID: "LINK">
	 URL                     <text string> $00
	 ID and additional data  <text string(s)>

	 Frames that may be linked and need no additional data are "ASPI","ETCO", "EQU2", "MCID", "MLLT", "OWNE", "RVA2", "RVRB", "SYTC", the text information frames and the URL link frames.
	 The "AENC", "APIC", "GEOB" and "TXXX" frames may be linked with
	 the content descriptor as additional ID data.
	 The "USER" frame may be linked with the language field as additional ID data.
	 The "PRIV" frame may be linked with the owner identifier as additional ID data.
	 The "COMM", "SYLT" and "USLT" frames may be linked with three bytes of language descriptor directly followed by a content descriptor as additional ID data.
	 */

	parse: async (reader) => {
		const url = reader.readStringTerminated(ascii);
		const id = reader.readStringTerminated(ascii);
		const value: IID3V2.FrameValue.Link = {url, id, additional: []};
		while (reader.hasData()) {
			const additional = reader.readStringTerminated(ascii);
			if (additional.length > 0) {
				value.additional.push(additional);
			}
		}
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Link>frame.value;
		stream.writeStringTerminated(value.url, ascii);
		stream.writeStringTerminated(value.id, ascii);
		value.additional.forEach(additional => {
			stream.writeStringTerminated(additional, ascii);
		});
	},
	simplify: (value: IID3V2.FrameValue.Link) => {
		return null; // TODO simplify IID3V2.FrameValue.Link
	}
};

export const FrameSYLT: IFrameImpl = {
	/**
	 This is another way of incorporating the words, said or sung lyrics, in the audio file as text, this time, however,
	 in sync with the audio. It might also be used to describing events e.g. occurring on a stage or on the screen in sync with the audio.
	 The header includes a content descriptor, represented with as terminated textstring. If no descriptor is entered, 'Content descriptor' is $00 (00) only.

	 <Header for 'Synchronised lyrics/text', ID: "SYLT">
	 Text encoding       $xx
	 Language            $xx xx xx
	 Time stamp format   $xx
	 Content type        $xx
	 Content descriptor  <text string according to encoding> $00 (00)

	 Encoding:

	 $00     ISO-8859-1 character set is used => $00 is sync identifier.
	 $01     Unicode character set is used => $00 00 is sync identifier.

	 Content type:

	 $00     is other
	 $01     is lyrics
	 $02     is text transcription
	 $03     is movement/part name (e.g. "Adagio")
	 $04     is events (e.g. "Don Quijote enters the stage")
	 $05     is chord (e.g. "Bb F Fsus")
	 $06     is trivia/'pop up' information

	 Time stamp format is:

	 $01 Absolute time, 32 bit sized, using MPEG frames as unit
	 $02 Absolute time, 32 bit sized, using milliseconds as unit

	 Abolute time means that every stamp contains the time from the beginning of the file.

	 The text that follows the frame header differs from that of the unsynchronised lyrics/text transcription in one major way. E
	 ach syllable (or whatever size of text is considered to be convenient by the encoder) is a null terminated string followed by a time stamp denoting where in the sound fileit belongs. Each sync thus has the following structure:

	 Terminated text to be synced (typically a syllable)
	 Sync identifier (terminator to above string)    $00 (00)
	 Time stamp      $xx (xx ...)

	 The 'time stamp' is set to zero or the whole sync is omitted if located directly at the beginning of the sound. All time stamps should be sorted in chronological order. The sync can be considered as a validator of the subsequent string.

	 Newline ($0A) characters are allowed in all "SYLT" frames and should be used after every entry (name, event etc.) in a frame with the content type $03 - $04.

	 A few considerations regarding whitespace characters: Whitespace separating words should mark the beginning of a new word, thus occurring in front of the first syllable of a new word. This is also valid for new line characters. A syllable followed by a comma should not be broken apart with a sync (both the syllable and the comma should be before the sync).

	 An example: The "USLT" passage

	 "Strangers in the night" $0A "Exchanging glances"

	 would be "SYLT" encoded as:

	 "Strang" $00 xx xx "ers" $00 xx xx " in" $00 xx xx " the" $00
	 xx xx " night" $00 xx xx 0A "Ex" $00 xx xx "chang" $00 xx xx
	 "ing" $00 xx xx "glan" $00 xx xx "ces" $00 xx xx

	 There may be more than one "SYLT" frame in each tag, but only one with the same language and content descriptor.

	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const language = removeZeroString(reader.readString(3, ascii)).trim();
		const timestampFormat = reader.readByte();
		const contentType = reader.readByte();
		const id = reader.readStringTerminated(enc);
		const events: Array<IID3V2.FrameValue.SynchronisedLyricsEvent> = [];
		while (reader.hasData()) {
			const text = reader.readStringTerminated(enc);
			if (reader.unread() >= 4) {
				const timestamp = reader.readUInt4Byte();
				events.push({timestamp, text});
			}
		}
		const value: IID3V2.FrameValue.SynchronisedLyrics = {language, timestampFormat, contentType, id, events};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.SynchronisedLyrics>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeAsciiString(value.language, 3);
		stream.writeByte(value.timestampFormat);
		stream.writeByte(value.contentType);
		stream.writeStringTerminated(value.id, enc);
		value.events.forEach(event => {
			stream.writeStringTerminated(event.text, enc);
			stream.writeUInt4Byte(event.timestamp);
		});
	},
	simplify: (value: IID3V2.FrameValue.SynchronisedLyrics) => {
		return null; // TODO IID3V2.FrameValue.SynchronisedLyrics IID3V2.FrameValue.Link
	}
};

export const FrameGEOB: IFrameImpl = {
	/**
	 In this frame any type of file can be encapsulated. After the header, 'Frame size' and 'Encoding' follows 'MIME type' represented as as a terminated string encoded with ISO-8859-1.
	 The filename is case sensitive and is encoded as 'Encoding'. Then follows a content description as terminated string, encoded as 'Encoding'.
	 The last thing in the frame is the actual object. The first two strings may be omitted, leaving only their terminations. There may be more than one "GEOB" frame
	 in each tag, but only one with the same content descriptor.
	 <Header for 'General encapsulated object', ID: "GEOB">
	 Text encoding           $xx
	 MIME type               <text string> $00
	 Filename                <text string according to encoding> $00 (00)
	 Content description     $00 (00)
	 Encapsulated object     <binary data>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const mimeType = reader.readStringTerminated(ascii);
		const filename = reader.readStringTerminated(enc);
		const contentDescription = reader.readStringTerminated(enc);
		const bin = reader.rest();
		const value: IID3V2.FrameValue.GEOB = {mimeType, filename, contentDescription, bin};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head) => {
		const value = <IID3V2.FrameValue.GEOB>frame.value;
		const enc = getWriteTextEncoding(frame, head);
		stream.writeEncoding(enc);
		stream.writeStringTerminated(value.mimeType, ascii);
		stream.writeStringTerminated(value.filename, enc);
		stream.writeStringTerminated(value.contentDescription, enc);
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.GEOB) => {
		return null; // TODO IID3V2.FrameValue.GEOB IID3V2.FrameValue.Link
	}
};

export const FrameRGAD: IFrameImpl = {
	/*
	 Specified at Hydrogen Audio

	 <Header for 'Replay Gain Adjustment', ID: "RGAD">
	 Peak Amplitude                          $xx $xx $xx $xx
	 Radio Replay Gain Adjustment            $xx $xx
	 Audiophile Replay Gain Adjustment       $xx $xx

	 In the RGAD frame, the flags state that the frame should be preserved if the ID3v2
	 tag is altered, but discarded if the audio data is altered.

	 This is not widely supported and I think it has been superseded by RVA2 in ID3v2.4 (and the XRVA tag for 2.3 compatibility).
	 */

	parse: async (reader) => {
		const peak = reader.readUInt4Byte();
		const radioAdjustment = reader.readSInt2Byte();
		const audiophileAdjustment = reader.readSInt2Byte();
		const value: IID3V2.FrameValue.ReplayGainAdjustment = {peak, radioAdjustment, audiophileAdjustment};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.ReplayGainAdjustment>frame.value;
		stream.writeUInt4Byte(value.peak);
		stream.writeSInt2Byte(value.radioAdjustment);
		stream.writeSInt2Byte(value.audiophileAdjustment);
	},
	simplify: (value: IID3V2.FrameValue.ReplayGainAdjustment) => {
		return null; // TODO IID3V2.FrameValue.ReplayGainAdjustment IID3V2.FrameValue.Link
	}
};

export const FrameUnknown: IFrameImpl = {
	parse: async (reader, frame) => {
		// debug('IFrameImpl', 'TODO: implement id3v2 tag frame ', frame.id);
		const value: IID3V2.FrameValue.Bin = {bin: frame.data};
		return {value, encoding: binary};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Bin>frame.value;
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.Bin) => {
		if (value && value.bin && value.bin.length > 0) {
			return '<bin ' + value.bin.length + 'bytes>';
		}
		return null;
	}
};
