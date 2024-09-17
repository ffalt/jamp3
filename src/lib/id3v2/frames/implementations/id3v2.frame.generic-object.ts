import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {getWriteTextEncoding} from '../id3v2.frame.write';

export const FrameGEOB: IFrameImpl = {
	/**
	 In this frame any type of file can be encapsulated. After the header, 'Frame size' and 'Encoding' follows 'MIME type' represented as as a terminated string encoded with ISO-8859-1.
	 The filename is case sensitive and is encoded as 'Encoding'. Then follows a content description as terminated string, encoded as 'Encoding'.
	 The last thing in the frame is the actual object. The first two strings may be omitted, leaving only their terminations. There may be more than one "GEOB" frame
	 in each tag, but only one with the same content descriptor.
	 <Header for 'General encapsulated object', ID: "GEOB">
	 Text encoding           $xx
	 MIME type               <text string> $00
	 Filename                <text string according to encoding> $00 (00)
	 Content description     $00 (00)
	 Encapsulated object     <binary data>
	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const mimeType = reader.readStringTerminated(ascii);
		const filename = reader.readStringTerminated(enc);
		const contentDescription = reader.readStringTerminated(enc);
		const bin = reader.rest();
		const value: IID3V2.FrameValue.GEOB = {mimeType, filename, contentDescription, bin};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.GEOB>frame.value;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		await stream.writeEncoding(enc);
		await stream.writeStringTerminated(value.mimeType, ascii);
		await stream.writeStringTerminated(value.filename, enc);
		await stream.writeStringTerminated(value.contentDescription, enc);
		await stream.writeBuffer(value.bin);
	},
	simplify: (_value: IID3V2.FrameValue.GEOB) => {
		return null; // TODO IID3V2.FrameValue.GEOB
	}
};
