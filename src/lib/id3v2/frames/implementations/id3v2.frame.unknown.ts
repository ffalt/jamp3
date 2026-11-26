import { IFrameImpl } from '../id3v2.frame.js';
import { IID3V2 } from '../../id3v2.types.js';
import { binary } from '../../../common/encodings.js';

export const FrameUnknown: IFrameImpl = {
	parse: async (reader, frame) => {
		const value: IID3V2.FrameValue.Bin = { bin: frame.data };
		return { value, encoding: binary };
	},
	write: async (frame, stream) => {
		const value = frame.value as IID3V2.FrameValue.Bin;
		await stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.Bin) => {
		if (value && value.bin && value.bin.length > 0) {
			return `<bin ${value.bin.length}bytes>`;
		}
		return null;
	}
};
