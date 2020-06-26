import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';

export const FrameETCO: IFrameImpl = {
	/*
	 This frame allows synchronisation with key events in a song or sound. The header is:

	 <Header for 'Event timing codes', ID: "ETCO">
	 Time stamp format    $xx

	 Where time stamp format is:

	 $01 Absolute time, 32 bit sized, using MPEG frames as unit
	 $02 Absolute time, 32 bit sized, using milliseconds as unit

	 Abolute time means that every stamp contains the time from the beginning of the file.

	 Followed by a list of key events in the following format:

	 Type of event   $xx
	 Time stamp      $xx (xx ...)

	 The 'Time stamp' is set to zero if directly at the beginning of the sound or after the previous event. All events should be sorted in chronological order. The type of event is as follows:

	 $00     padding (has no meaning)
	 $01     end of initial silence
	 $02     intro start
	 $03     mainpart start
	 $04     outro start
	 $05     outro end
	 $06     verse start
	 $07     refrain start
	 $08     interlude start
	 $09     theme start
	 $0A     variation start
	 $0B     key change
	 $0C     time change
	 $0D     momentary unwanted noise (Snap, Crackle & Pop)
	 $0E     sustained noise
	 $0F     sustained noise end
	 $10     intro end
	 $11     mainpart end
	 $12     verse end
	 $13     refrain end
	 $14     theme end
	 $15-$DF reserved for future use
	 $E0-$EF not predefined sync 0-F
	 $F0-$FC reserved for future use
	 $FD     audio end (start of silence)
	 $FE     audio file ends
	 $FF     one more byte of events follows (all the following bytes with the value $FF have the same function)

	 Terminating the start events such as "intro start" is not required. The 'Not predefined sync's ($E0-EF) are for user events. You might want to synchronise your music to something, like setting of an explosion on-stage, turning on your screensaver etc.

	 There may only be one "ETCO" frame in each tag.
 */
	parse: async (reader) => {
		const format = reader.readBitsByte();
		const events: Array<{ type: number; timestamp: number }> = [];
		while (reader.unread() >= 5) {
			const type = reader.readBitsByte();
			const timestamp = reader.readUInt4Byte();
			events.push({type, timestamp});
		}
		const value: IID3V2.FrameValue.EventTimingCodes = {format, events};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.EventTimingCodes>frame.value;
		stream.writeByte(value.format);
		(value.events || []).forEach(event => {
			stream.writeByte(event.type);
			stream.writeUInt4Byte(event.timestamp);
		});
	},
	simplify: (value: IID3V2.FrameValue.EventTimingCodes) => {
		return null; // TODO simplify IID3V2.FrameValue.EventTimingCodes
	}
};
