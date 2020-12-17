import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';
import {getWriteTextEncoding} from '../id3v2.frame.write';

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
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		await stream.writeStringTerminated(value.id, enc);
		await stream.writeString(value.text, enc);
	},
	simplify: (value: IID3V2.FrameValue.IdText) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};
