import { IFrameImpl } from '../id3v2.frame';
import { utf8 } from '../../../common/encodings';
import { IID3V2 } from '../../id3v2.types';
import { getWriteTextEncoding } from '../id3v2.frame.write';

export const FrameTextConcatList: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Information    <text string according to encoding>
	 */
	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return { value: { text: '' }, encoding: utf8 };
		}
		const enc = reader.readEncoding();
		let text = reader.readStringTerminated(enc);
		while (reader.hasData()) {
			const appendtext = reader.readStringTerminated(enc);
			if (appendtext.length > 0) {
				text += `/${appendtext}`;
			}
		}
		const value: IID3V2.FrameValue.Text = { text };
		return { value, encoding: enc };
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = frame.value as IID3V2.FrameValue.Text;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		const list = value.text.split('/');
		for (const s of list) {
			await stream.writeStringTerminated(s, enc);
		}
	},
	simplify: (value: IID3V2.FrameValue.Text) => {
		if (value && value.text && value.text.length > 0) {
			return value.text;
		}
		return null;
	}
};
