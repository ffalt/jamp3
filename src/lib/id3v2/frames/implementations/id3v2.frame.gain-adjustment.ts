import {IFrameImpl} from '../id3v2.frame';
import {IID3V2} from '../../id3v2.types';

export const FrameRGAD: IFrameImpl = {
	/*
	 Specified at Hydrogen Audio

	 <Header for 'Replay Gain Adjustment', ID: "RGAD">
	 Peak Amplitude                          $xx $xx $xx $xx
	 Radio Replay Gain Adjustment            $xx $xx
	 Audiophile Replay Gain Adjustment       $xx $xx

	 In the RGAD frame, the flags state that the frame should be preserved if the ID3v2
	 tag is altered, but discarded if the audio data is altered.

	 This is not widely supported and I think it has been superseded by RVA2 in ID3v2.4 (and the XRVA tag for 2.3 compatibility).
	 */

	parse: async (reader) => {
		const peak = reader.readUInt4Byte();
		const radioAdjustment = reader.readSInt2Byte();
		const audiophileAdjustment = reader.readSInt2Byte();
		const value: IID3V2.FrameValue.ReplayGainAdjustment = {peak, radioAdjustment, audiophileAdjustment};
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.ReplayGainAdjustment>frame.value;
		await stream.writeUInt4Byte(value.peak);
		await stream.writeSInt2Byte(value.radioAdjustment);
		await stream.writeSInt2Byte(value.audiophileAdjustment);
	},
	simplify: (value: IID3V2.FrameValue.ReplayGainAdjustment) => {
		return null; // TODO IID3V2.FrameValue.ReplayGainAdjustment IID3V2.FrameValue.Link
	}
};
