import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';

export const FrameIdBin: IFrameImpl = {
	/**
	 Owner identifier        <text string> $00
	 The private data        <binary data>
	 */
	parse: async (reader) => {
		const id = reader.readStringTerminated(ascii);
		const bin = reader.rest();
		const value: IID3V2.FrameValue.IdBin = {id, bin};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.IdBin>frame.value;
		stream.writeStringTerminated(value.id, ascii);
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.IdBin) => {
		if (value && value.bin && value.bin.length > 0) {
			return '<bin ' + value.bin.length + 'bytes>';
		}
		return null;
	}
};
