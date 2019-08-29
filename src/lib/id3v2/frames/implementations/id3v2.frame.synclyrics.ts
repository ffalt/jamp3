import {IFrameImpl} from '../id3v2.frame';
import {removeZeroString} from '../../../common/utils';
import {ascii} from '../../../common/encodings';
import {IID3V2} from '../../id3v2.types';
import {getWriteTextEncoding} from '../id3v2.frame.write';

export const FrameSYLT: IFrameImpl = {
	/**
	 This is another way of incorporating the words, said or sung lyrics, in the audio file as text, this time, however,
	 in sync with the audio. It might also be used to describing events e.g. occurring on a stage or on the screen in sync with the audio.
	 The header includes a content descriptor, represented with as terminated textstring. If no descriptor is entered, 'Content descriptor' is $00 (00) only.

	 <Header for 'Synchronised lyrics/text', ID: "SYLT">
	 Text encoding       $xx
	 Language            $xx xx xx
	 Time stamp format   $xx
	 Content type        $xx
	 Content descriptor  <text string according to encoding> $00 (00)

	 Encoding:

	 $00     ISO-8859-1 character set is used => $00 is sync identifier.
	 $01     Unicode character set is used => $00 00 is sync identifier.

	 Content type:

	 $00     is other
	 $01     is lyrics
	 $02     is text transcription
	 $03     is movement/part name (e.g. "Adagio")
	 $04     is events (e.g. "Don Quijote enters the stage")
	 $05     is chord (e.g. "Bb F Fsus")
	 $06     is trivia/'pop up' information

	 Time stamp format is:

	 $01 Absolute time, 32 bit sized, using MPEG frames as unit
	 $02 Absolute time, 32 bit sized, using milliseconds as unit

	 Abolute time means that every stamp contains the time from the beginning of the file.

	 The text that follows the frame header differs from that of the unsynchronised lyrics/text transcription in one major way. E
	 ach syllable (or whatever size of text is considered to be convenient by the encoder) is a null terminated string followed by a time stamp denoting where in the sound fileit belongs. Each sync thus has the following structure:

	 Terminated text to be synced (typically a syllable)
	 Sync identifier (terminator to above string)    $00 (00)
	 Time stamp      $xx (xx ...)

	 The 'time stamp' is set to zero or the whole sync is omitted if located directly at the beginning of the sound. All time stamps should be sorted in chronological order. The sync can be considered as a validator of the subsequent string.

	 Newline ($0A) characters are allowed in all "SYLT" frames and should be used after every entry (name, event etc.) in a frame with the content type $03 - $04.

	 A few considerations regarding whitespace characters: Whitespace separating words should mark the beginning of a new word, thus occurring in front of the first syllable of a new word. This is also valid for new line characters. A syllable followed by a comma should not be broken apart with a sync (both the syllable and the comma should be before the sync).

	 An example: The "USLT" passage

	 "Strangers in the night" $0A "Exchanging glances"

	 would be "SYLT" encoded as:

	 "Strang" $00 xx xx "ers" $00 xx xx " in" $00 xx xx " the" $00
	 xx xx " night" $00 xx xx 0A "Ex" $00 xx xx "chang" $00 xx xx
	 "ing" $00 xx xx "glan" $00 xx xx "ces" $00 xx xx

	 There may be more than one "SYLT" frame in each tag, but only one with the same language and content descriptor.

	 */
	parse: async (reader) => {
		const enc = reader.readEncoding();
		const language = removeZeroString(reader.readString(3, ascii)).trim();
		const timestampFormat = reader.readByte();
		const contentType = reader.readByte();
		const id = reader.readStringTerminated(enc);
		const events: Array<IID3V2.FrameValue.SynchronisedLyricsEvent> = [];
		while (reader.hasData()) {
			const text = reader.readStringTerminated(enc);
			if (reader.unread() >= 4) {
				const timestamp = reader.readUInt4Byte();
				events.push({timestamp, text});
			}
		}
		const value: IID3V2.FrameValue.SynchronisedLyrics = {language, timestampFormat, contentType, id, events};
		return {value, encoding: enc};
	},
	write: async (frame, stream, head, defaultEncoding) => {
		const value = <IID3V2.FrameValue.SynchronisedLyrics>frame.value;
		const enc = getWriteTextEncoding(frame, head, defaultEncoding);
		stream.writeEncoding(enc);
		stream.writeAsciiString(value.language, 3);
		stream.writeByte(value.timestampFormat);
		stream.writeByte(value.contentType);
		stream.writeStringTerminated(value.id, enc);
		value.events.forEach(event => {
			stream.writeStringTerminated(event.text, enc);
			stream.writeUInt4Byte(event.timestamp);
		});
	},
	simplify: (value: IID3V2.FrameValue.SynchronisedLyrics) => {
		return null; // TODO IID3V2.FrameValue.SynchronisedLyrics IID3V2.FrameValue.Link
	}
};
