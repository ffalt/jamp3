import {IFrameImpl} from '../id3v2.frame';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';

export const FrameLINK: IFrameImpl = {
	/**
	 v2.3:
	 To keep space waste as low as possible this frame may be used to link information from another ID3v2 tag that might reside in another audio file or alone in a binary file.
	 It is recommended that this method is only used when the files are stored on a CD-ROM or other circumstances when the risk of file seperation is low. The frame contains a
	 frame identifier, which is the frame that should be linked into this tag, a URL field, where a reference to the file where the frame is given, and additional ID data,
	 if needed. Data should be retrieved from the first tag found in the file to which this link points. There may be more than one "LINK" frame in a tag, but only one with
	 the same contents. A linked frame is to be considered as part of the tag and has the same restrictions as if it was a physical part of the tag (i.e. only one "RVRB" frame allowed,
	 whether it's linked or not).

	 <Header for 'Linked information', ID: "LINK">
	 URL                     <text string> $00
	 ID and additional data  <text string(s)>

	 Frames that may be linked and need no additional data are "IPLS", "MCID", "ETCO", "MLLT", "SYTC", "RVAD", "EQUA", "RVRB", "RBUF", the text information frames and the URL link frames.
	 The "TXXX", "APIC", "GEOB" and "AENC" frames may be linked with the content descriptor as additional ID data.
	 The "COMM", "SYLT" and "USLT" frames may be linked with three bytes of language descriptor directly followed by a content descriptor as additional ID data.

	 v2.4
	 To keep information duplication as low as possible this frame may be used to link information from another ID3v2 tag that might reside in
	 another audio file or alone in a binary file. It is RECOMMENDED that this method is only used when the files are stored on a CD-ROM or
	 other circumstances when the risk of file separation is low. The frame contains a frame identifier, which is the frame that should be
	 linked into this tag, a URL [URL] field, where a reference to the file where the frame is given, and additional ID data, if needed.
	 Data should be retrieved from the first tag found in the file to which this link points. There may be more than one "LINK" frame in a
	 tag, but only one with the same contents. A linked frame is to be considered as part of the tag and has the same restrictions as if it
	 was a physical part of the tag (i.e. only one "RVRB" frame allowed, whether it's linked or not).

	 <Header for 'Linked information', ID: "LINK">
	 URL                     <text string> $00
	 ID and additional data  <text string(s)>

	 Frames that may be linked and need no additional data are "ASPI","ETCO", "EQU2", "MCID", "MLLT", "OWNE", "RVA2", "RVRB", "SYTC", the text information frames and the URL link frames.
	 The "AENC", "APIC", "GEOB" and "TXXX" frames may be linked with
	 the content descriptor as additional ID data.
	 The "USER" frame may be linked with the language field as additional ID data.
	 The "PRIV" frame may be linked with the owner identifier as additional ID data.
	 The "COMM", "SYLT" and "USLT" frames may be linked with three bytes of language descriptor directly followed by a content descriptor as additional ID data.
	 */

	parse: async (reader) => {
		const url = reader.readStringTerminated(ascii);
		const id = reader.readStringTerminated(ascii);
		const value: IID3V2.FrameValue.LinkedInfo = {url, id, additional: []};
		while (reader.hasData()) {
			const additional = reader.readStringTerminated(ascii);
			if (additional.length > 0) {
				value.additional.push(additional);
			}
		}
		return {value, encoding: ascii};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.LinkedInfo>frame.value;
		stream.writeStringTerminated(value.url, ascii);
		stream.writeStringTerminated(value.id, ascii);
		value.additional.forEach(additional => {
			stream.writeStringTerminated(additional, ascii);
		});
	},
	simplify: (value: IID3V2.FrameValue.LinkedInfo) => {
		return null; // TODO simplify IID3V2.FrameValue.Link
	}
};
