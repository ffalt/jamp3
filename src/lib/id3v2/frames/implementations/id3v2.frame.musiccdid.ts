import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';
import {binary} from '../../../common/encodings';

export const FrameMusicCDId: IFrameImpl = {
	/**
	 This frame is intended for music that comes from a CD, so that the CD can be
	 identified in databases such as the CDDB. The frame consists of a binary dump of the
	 Table Of Contents, TOC, from the CD, which is a header of 4 bytes and then 8 bytes/track
	 on the CD plus 8 bytes for the 'lead out' making a maximum of 804 bytes. The offset to the beginning
	 of every track on the CD should be described with a four bytes absolute CD-frame address per track,
	 and not with absolute time. This frame requires a present and valid "TRCK" frame, even if the CD's only
	 got one track. There may only be one "MCDI" frame in each tag.

	 <Header for 'Music CD identifier', ID: "MCDI">
	 CD TOC <binary data>
	 */
	parse: async (reader, frame) => {
		const value: IID3V2.FrameValue.Bin = {bin: frame.data};
		return {value, encoding: binary};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Bin>frame.value;
		stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.Bin) => {
		if (value && value.bin && value.bin.length > 0) {
			return '<bin ' + value.bin.length + 'bytes>';
		}
		return null;
	}
};
