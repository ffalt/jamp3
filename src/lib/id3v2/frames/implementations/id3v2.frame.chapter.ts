import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {writeRawSubFrames} from '../id3v2.frame.write';
import {readSubFrames} from '../id3v2.frame.read';

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
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.Chapter>frame.value;
		await stream.writeStringTerminated(value.id, ascii);
		await stream.writeUInt4Byte(value.start);
		await stream.writeUInt4Byte(value.end);
		await stream.writeUInt4Byte(value.offset);
		await stream.writeUInt4Byte(value.offsetEnd);
		if (frame.subframes) {
			await writeRawSubFrames(frame.subframes, stream, head, defaultEncoding);
		}
	},
	simplify: (value: IID3V2.FrameValue.Chapter) => {
		if (value && value.id && value.id.length > 0) {
			return '<chapter ' + value.id + '>';
		}
		return null;
	}
};
