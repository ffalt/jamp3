import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {ID3V2ValueTypes} from '../../id3v2.consts';
import {getWriteTextEncoding} from '../id3v2.frame.write';

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
		if (head.ver <= 2) {
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
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.Pic>frame.value;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		stream.writeEncoding(enc);
		if (head.ver <= 2) {
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
			return `<pic ${ID3V2ValueTypes.pictureType[value.pictureType] || 'unknown'};${value.mimeType};${value.bin ? value.bin.length + 'bytes' : value.url}>`;
		}
		return null;
	}
};
