import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';

export const FramePCST: IFrameImpl = {
	/**
	 // PCST
	 Itunes - Indicates a podcast.

	 This is written to a v2.2 tag as PCS.
	 */
	parse: async (reader) => {
		const num = reader.readUInt4Byte();
		const value: IID3V2.FrameValue.Number = {num};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Number>frame.value;
		await stream.writeUInt4Byte(value.num);
	},
	simplify: (value: IID3V2.FrameValue.Number) => {
		return value.num.toString();
	}
};
