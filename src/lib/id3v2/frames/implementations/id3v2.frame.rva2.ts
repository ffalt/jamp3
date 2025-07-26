import { IFrameImpl } from '../id3v2.frame';
import { ascii } from '../../../common/encodings';
import { IID3V2 } from '../../id3v2.types';
import { neededStoreBytes } from '../../../common/utils';

export const FrameRelativeVolumeAdjustment2: IFrameImpl = {
	/**
	 4.11.   Relative volume adjustment (2)

	 This is a more subjective frame than the previous ones. It allows the
	 user to say how much he wants to increase/decrease the volume on each
	 channel when the file is played. The purpose is to be able to align
	 all files to a reference volume, so that you don't have to change the
	 volume constantly. This frame may also be used to balance adjust the
	 audio. The volume adjustment is encoded as a fixed point decibel
	 value, 16 bit signed integer representing (adjustment*512), giving
	 +/- 64 dB with a precision of 0.001953125 dB. E.g. +2 dB is stored as
	 $04 00 and -2 dB is $FC 00. There may be more than one "RVA2" frame
	 in each tag, but only one with the same identification string.

	 <Header for 'Relative volume adjustment (2)', ID: "RVA2">
	 Identification          <text string> $00

	 The 'identification' string is used to identify the situation and/or
	 device where this adjustment should apply. The following is then
	 repeated for every channel

	 Type of channel         $xx
	 Volume adjustment       $xx xx
	 Bits representing peak  $xx
	 Peak volume             $xx (xx ...)

	 Type of channel:  $00  Other
	 $01  Master volume
	 $02  Front right
	 $03  Front left
	 $04  Back right
	 $05  Back left
	 $06  Front centre
	 $07  Back centre
	 $08  Subwoofer

	 Bits representing peak can be any number between 0 and 255. 0 means
	 that there is no peak volume field. The peak volume field is always
	 padded to whole bytes, setting the most significant bits to zero.
	 */

	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return { value: {} };
		}
		/*
		const AdjustmentType: any = {
			0: 'Other',
			1: 'Master volume',
			2: 'Front right',
			3: 'Front left',
			4: 'Back right',
			5: 'Back left',
			6: 'Front centre',
			7: 'Back centre',
			8: 'Subwoofer'
		};
		*/
		const id = reader.readStringTerminated(ascii);
		const channels: Array<IID3V2.FrameValue.RVA2Channel> = [];
		while (reader.unread() >= 3) {
			const type = reader.readByte();
			const adjustment = reader.readSInt(2); // 16-bit signed
			const channel: IID3V2.FrameValue.RVA2Channel = { type, adjustment };
			while (reader.unread() >= 1) {
				const bitspeakvolume = reader.readByte();
				const bytesInPeak = bitspeakvolume > 0 ? Math.ceil(bitspeakvolume / 8) : 0;
				if (bytesInPeak > 0 && reader.unread() >= bytesInPeak) {
					channel.peak = reader.readUInt(bytesInPeak);
				}
			}
			channels.push(channel);
		}
		const value: IID3V2.FrameValue.RVA2 = { id, channels };
		return { value };
	},
	write: async (frame, stream) => {
		const value = frame.value as IID3V2.FrameValue.RVA2;
		await stream.writeStringTerminated(value.id, ascii);
		for (const channel of value.channels) {
			await stream.writeByte(channel.type);
			await stream.writeSInt(channel.adjustment, 2);
			const bytes = channel.peak === undefined ? 0 : neededStoreBytes(channel.peak, 2);
			await stream.writeUInt(bytes * 8, 2);
			if (channel.peak !== undefined && bytes > 0) {
				await stream.writeUInt(channel.peak, bytes);
			}
		}
	},
	simplify: (_value: IID3V2.FrameValue.RVA2) => null // TODO simplify IID3V2.FrameValue.RVA2
};
