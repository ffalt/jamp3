import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';

export const FrameAENC: IFrameImpl = {
	/**
	 This frame indicates if the actual audio stream is encrypted, and by whom. Since standardization of such encryption scheme is beyond this document, all "AENC" frames begin
	 with a terminated string with a URL containing an email address, or a link to a location where an email address can be found, that belongs to the organisation responsible
	 for this specific encrypted audio file. Questions regarding the encrypted audio should be sent to the email address specified. If a $00 is found directly after the 'Frame size'
	 and the audiofile indeed is encrypted, the whole file may be considered useless.

	 After the 'Owner identifier', a pointer to an unencrypted part of the audio can be specified. The 'Preview start' and 'Preview length' is described in frames.
	 If no part is unencrypted, these fields should be left zeroed. After the 'preview length' field follows optionally a datablock required for decryption of the audio.
	 There may be more than one "AENC" frames in a tag, but only one with the same 'Owner identifier'.

	 <Header for 'Audio encryption', ID: "AENC">
	 Owner identifier        <text string> $00
	 Preview start           $xx xx
	 Preview length          $xx xx
	 Encryption info         <binary data>
	 */
	parse: async (reader) => {
		const id = reader.readStringTerminated(ascii);
		if (reader.unread() < 2) {
			return Promise.reject(Error('Not enough data'));
		}
		const previewStart = reader.readUInt2Byte();
		if (reader.unread() < 2) {
			return Promise.reject(Error('Not enough data'));
		}
		const previewLength = reader.readUInt2Byte();
		const bin = reader.rest();
		const value: IID3V2.FrameValue.AudioEncryption = {id, previewStart, previewLength, bin};
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.AudioEncryption>frame.value;
		await stream.writeStringTerminated(value.id, ascii);
		await stream.writeUInt2Byte(value.previewStart);
		await stream.writeUInt2Byte(value.previewLength);
		await stream.writeBuffer(value.bin);
	},
	simplify: (value: IID3V2.FrameValue.AudioEncryption) => {
		return null; // TODO simplify IID3V2.FrameValue.AudioEncryption
	}
};
