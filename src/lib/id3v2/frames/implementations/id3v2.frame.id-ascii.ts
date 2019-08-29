import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';
import {ascii} from '../../../common/encodings';

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
