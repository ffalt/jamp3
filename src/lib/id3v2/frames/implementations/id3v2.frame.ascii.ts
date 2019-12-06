import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';

export const FrameAscii: IFrameImpl = {
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
