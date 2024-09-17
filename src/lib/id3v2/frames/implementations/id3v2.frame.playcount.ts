import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';
import {neededStoreBytes} from '../../../common/utils';

export const FramePlayCount: IFrameImpl = {
	/**
	 This is simply a counter of the number of times a file has been played. The value is increased by one every time the file begins to play.
	 There may only be one "PCNT" frame in each tag. When the counter reaches all one's, one byte is inserted in front of the
	 counter thus making the counter eight bits bigger.
	 The counter must be at least 32-bits long to begin with.
	 <Header for 'Play counter', ID: "PCNT">
	 Counter         $xx xx xx xx (xx ...)
	 */
	parse: async (reader, frame) => {
		let num: number;
		try {
			num = reader.readUInt(frame.data.length);
		} catch (_: any) {
			num = 0;
		}
		const value: IID3V2.FrameValue.Number = {num};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Number>frame.value;
		const byteLength = neededStoreBytes(value.num, 4);
		await stream.writeUInt(value.num, byteLength);
	},
	simplify: (value: IID3V2.FrameValue.Number) => {
		if (value && value.num !== undefined) {
			return value.num.toString();
		}
		return null;
	}
};
