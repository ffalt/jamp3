import { IFrameImpl } from '../id3v2.frame';
import { IID3V2 } from '../../id3v2.types';
import { getWriteTextEncoding } from '../id3v2.frame.write';

export const FrameBooleanString: IFrameImpl = {
	/**
	 TCMP
	 This is a simple text frame that iTunes uses to indicate if the file is part of a compilation.

	 Information
	 1 if part of a compilation
	 0 or not present if not part of a compilation

	 This is written to a v2.2 tag as TCP.
	 */
	parse: async reader => {
		const enc = reader.readEncoding();
		const intAsString = reader.readStringTerminated(enc);
		const i = Number.parseInt(intAsString, 10).toString();
		const value: IID3V2.FrameValue.Bool = { bool: i === '1' };
		return { value, encoding: enc };
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = frame.value as IID3V2.FrameValue.Bool;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		await stream.writeStringTerminated(value.bool ? '1' : '0', enc);
	},
	simplify: (value: IID3V2.FrameValue.Bool) => {
		if (value) {
			return value.bool ? 'true' : 'false';
		}
		return null;
	}
};
