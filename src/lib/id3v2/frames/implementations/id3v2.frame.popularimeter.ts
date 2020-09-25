import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {neededStoreBytes} from '../../../common/utils';

export const FramePopularimeter: IFrameImpl = {
	/**
	 The purpose of this frame is to specify how good an audio file is.
	 Many interesting applications could be found to this frame such as a playlist
	 that features better audiofiles more often than others or it could be used to
	 profile a person's taste and find other 'good' files by comparing people's profiles.
	 The frame is very simple. It contains the email address to the user, one rating byte and a four byte play counter,
	 intended to be increased with one for every time the file is played. The email is a terminated string.
	 The rating is 1-255 where 1 is worst and 255 is best. 0 is unknown. If no personal counter is wanted it
	 may be omitted. When the counter reaches all one's, one byte is inserted in front of the counter thus making
	 the counter eight bits bigger in the same away as the play counter ("PCNT").
	 There may be more than one "POPM" frame in each tag, but only one with the same email address.

	 <Header for 'Popularimeter', ID: "POPM">
	 Email to user   <text string> $00
	 Rating          $xx
	 Counter         $xx xx xx xx (xx ...)


	 Popularimeter   "POP"
	 Email to user   <textstring> $00
	 Rating          $xx
	 Counter         $xx xx xx xx (xx ...)
	 */
	parse: async (reader) => {
		const email = reader.readStringTerminated(ascii);
		const rating = reader.readByte();
		let count = 0;
		if (reader.hasData()) {
			try {
				count = reader.readUInt(reader.unread());
			} catch (e) {
				count = 0;
			}
		}
		const value: IID3V2.FrameValue.Popularimeter = {count, rating, email};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.Popularimeter>frame.value;
		stream.writeStringTerminated(value.email, ascii);
		stream.writeByte(value.rating);
		if (value.count > 0) {
			const byteLength = neededStoreBytes(value.count, 4);
			stream.writeUInt(value.count, byteLength);
		}
	},
	simplify: (value: IID3V2.FrameValue.Popularimeter) => {
		if (value && value.email !== undefined) {
			return value.email + (value.count !== undefined ? ';count=' + value.count : '') + (value.rating !== undefined ? ';rating=' + value.rating : '');
		}
		return null;
	}
};
