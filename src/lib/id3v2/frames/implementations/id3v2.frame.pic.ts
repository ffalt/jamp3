import { IFrameImpl } from '../id3v2.frame';
import { ascii } from '../../../common/encodings';
import { IID3V2 } from '../../id3v2.types';
import { ID3V2ValueTypes } from '../../id3v2.consts';
import { getWriteTextEncoding } from '../id3v2.frame.write';

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
		const mimeType = head.ver <= 2 ? reader.readString(3, ascii) : reader.readStringTerminated(ascii);
		const pictureType = reader.readByte();
		const description = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.Pic = { mimeType, pictureType: pictureType, description };
		if (mimeType === '-->') {
			value.url = reader.readStringTerminated(enc);
		} else {
			value.bin = reader.rest();
		}
		return { value, encoding: enc };
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = frame.value as IID3V2.FrameValue.Pic;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		if (head.ver <= 2) {
			await (value.url ? stream.writeString('-->', ascii) : stream.writeAsciiString(value.mimeType || '', 3));
		} else {
			await stream.writeStringTerminated(value.url ?? (value.mimeType || ''), ascii);
		}
		await stream.writeByte(value.pictureType);
		await stream.writeStringTerminated(value.description, enc);
		if (value.url) {
			await stream.writeString(value.url, enc);
		} else if (value.bin) {
			await stream.writeBuffer(value.bin);
		}
	},
	simplify: (value: IID3V2.FrameValue.Pic) => {
		if (value) {
			return `<pic ${ID3V2ValueTypes.pictureType[value.pictureType] || 'unknown'};${value.mimeType};${value.bin ? `${value.bin.length}bytes` : value.url}>`;
		}
		return null;
	}
};
