import {IFrameImpl} from '../id3v2.frame';
import {removeZeroString} from '../../../common/utils';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {getWriteTextEncoding} from '../id3v2.frame.write';

export const FrameLangText: IFrameImpl = {
	/**
	 Text encoding          $xx
	 Language               $xx xx xx
	 The actual text        <full text string according to encoding>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const language = removeZeroString(reader.readString(3, ascii)).trim();
		const text = reader.readStringTerminated(enc);
		const value: IID3V2.FrameValue.LangText = {language, text};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.LangText>frame.value;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		await stream.writeAsciiString(value.language || '', 3);
		await stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.LangText) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};
