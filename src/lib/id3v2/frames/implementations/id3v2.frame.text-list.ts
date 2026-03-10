import { IFrameImpl } from '../id3v2.frame';
import { IID3V2 } from '../../id3v2.types';
import { getWriteTextEncoding } from '../id3v2.frame.write';

export const FrameTextList: IFrameImpl = {
	/**
	 Text encoding    $xx
	 Information    <text string according to encoding>
	 */
	parse: async reader => {
		const enc = reader.readEncoding();
		const list: Array<string> = [];
		while (reader.hasData()) {
			const text = reader.readStringTerminated(enc);
			if (text.length > 0) {
				list.push(text);
			}
		}
		const value: IID3V2.FrameValue.TextList = { list };
		return { value, encoding: enc };
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = frame.value as IID3V2.FrameValue.TextList;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		for (let index = 0; index < value.list.length; index++) {
			await stream.writeString(value.list[index], enc);
			if (index !== value.list.length - 1) {
				await stream.writeTerminator(enc);
			}
		}
	},
	simplify: (value: IID3V2.FrameValue.TextList) => {
		if (value && value.list && value.list.length > 0) {
			return value.list.join(' / ');
		}
		return null;
	}
};
