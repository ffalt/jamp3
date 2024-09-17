import {IFrameImpl} from '../id3v2.frame';
import {isBitSetAt, neededStoreBytes} from '../../../common/utils';
import {IID3V2} from '../../id3v2.types';

export const FrameRelativeVolumeAdjustment: IFrameImpl = {
	/**
	 It allows the user to say how much he wants to increase/decrease the volume on each channel while the file is played.
	 The purpose is to be able to align all files to a reference volume, so that you don't have to change the volume constantly. This frame may also be used to balance adjust the audio.
	 If the volume peak levels are known then this could be described with the 'Peak volume right' and 'Peak volume left' field. If Peakvolume is not known these fields could be left zeroed or,
	 if no other data follows, be completely omitted. There may only be one "RVAD" frame in each tag.

	 <Header for 'Relative volume adjustment', ID: "RVAD">
	 Increment/decrement             %00xxxxxx
	 Bits used for volume descr.     $xx
	 Relative volume change, right   $xx xx (xx ...)
	 Relative volume change, left    $xx xx (xx ...)
	 Peak volume right               $xx xx (xx ...)
	 Peak volume left                $xx xx (xx ...)

	 In the increment/decrement field bit 0 is used to indicate the right channel and bit 1 is used to indicate the left channel. 1 is increment and 0 is decrement.

	 The 'bits used for volume description' field is normally $10 (16 bits) for MPEG 2 layer I, II and III and MPEG 2.5. This value may not be $00. The volume is always represented with whole bytes, padded in the beginning (highest bits) when 'bits used for volume description' is not a multiple of eight.

	 This datablock is then optionally followed by a volume definition for the left and right back channels. If this information is appended to the frame the first two channels will be treated as front channels. In the increment/decrement field bit 2 is used to indicate the right back channel and bit 3 for the left back channel.

	 Relative volume change, right back      $xx xx (xx ...)
	 Relative volume change, left back       $xx xx (xx ...)
	 Peak volume right back                  $xx xx (xx ...)
	 Peak volume left back                   $xx xx (xx ...)

	 If the center channel adjustment is present the following is appended to the existing frame, after the left and right back channels. The center channel is represented by bit 4 in the increase/decrease field.

	 Relative volume change, center  $xx xx (xx ...)
	 Peak volume center              $xx xx (xx ...)

	 If the bass channel adjustment is present the following is appended to the existing frame, after the center channel. The bass channel is represented by bit 5 in the increase/decrease field.

	 Relative volume change, bass    $xx xx (xx ...)
	 Peak volume bass                $xx xx (xx ...)
	 */

	parse: async (reader, frame) => {
		if (frame.data.length === 0) {
			return {value: {}};
		}
		const flags = reader.readBitsByte();
		const bitLength = reader.readBitsByte();
		const byteLength = bitLength / 8;
		if (byteLength <= 1 || byteLength > 4) {
			return Promise.reject(Error('Unsupported description bit size of: ' + bitLength));
		}
		let val = reader.readUInt(byteLength);
		const right = (isBitSetAt(flags, 0) || (val === 0) ? 1 : -1) * val;
		val = reader.readUInt(byteLength);
		const left = (isBitSetAt(flags, 1) || (val === 0) ? 1 : -1) * val;
		const value: IID3V2.FrameValue.RVA = {
			right, left
		};
		if (reader.unread() >= byteLength * 2) {
			value.peakRight = reader.readUInt(byteLength);
			value.peakLeft = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.peakRight = reader.readUInt(byteLength);
			value.peakLeft = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.rightBack = (isBitSetAt(flags, 4) ? 1 : -1) * reader.readUInt(byteLength);
			value.leftBack = (isBitSetAt(flags, 8) ? 1 : -1) * reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.peakRightBack = reader.readUInt(byteLength);
			value.peakLeftBack = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.center = (isBitSetAt(flags, 10) ? 1 : -1) * reader.readUInt(byteLength);
			value.peakCenter = reader.readUInt(byteLength);
		}
		if (reader.unread() >= byteLength * 2) {
			value.bass = (isBitSetAt(flags, 20) ? 1 : -1) * reader.readUInt(byteLength);
			value.peakBass = reader.readUInt(byteLength);
		}
		return {value};
	},
	write: async (frame, stream) => {
		const value = <IID3V2.FrameValue.RVA>frame.value;
		const flags = [
			0,
			0,
			value.bass !== undefined ? (value.bass >= 0 ? 0 : 1) : 0,
			value.center !== undefined ? (value.center >= 0 ? 0 : 1) : 0,
			value.leftBack !== undefined ? (value.leftBack >= 0 ? 0 : 1) : 0,
			value.rightBack !== undefined ? (value.rightBack >= 0 ? 0 : 1) : 0,
			value.left < 0 ? 0 : 1,
			value.right < 0 ? 0 : 1
		];
		await stream.writeBitsByte(flags);
		let byteLength = 2;
		Object.keys(value).forEach(key => {
			const num = <number>(<any>value)[key];
			if (!isNaN(num)) {
				byteLength = Math.max(neededStoreBytes(Math.abs(num), 2), byteLength);
			}
		});
		await stream.writeByte(byteLength * 8);
		await stream.writeUInt(Math.abs(value.right), byteLength);
		await stream.writeUInt(Math.abs(value.left), byteLength);
		if (value.peakRight !== undefined && value.peakLeft !== undefined) {
			await stream.writeUInt(value.peakRight, byteLength);
			await stream.writeUInt(value.peakLeft, byteLength);
		} else {
			return;
		}
		if (value.rightBack !== undefined && value.leftBack !== undefined) {
			await stream.writeUInt(Math.abs(value.rightBack), byteLength);
			await stream.writeUInt(Math.abs(value.leftBack), byteLength);
		} else {
			return;
		}
		if (value.peakRightBack !== undefined && value.peakLeftBack !== undefined) {
			await stream.writeUInt(value.peakRightBack, byteLength);
			await stream.writeUInt(value.peakLeftBack, byteLength);
		} else {
			return;
		}
		if (value.center !== undefined && value.peakCenter !== undefined) {
			await stream.writeUInt(Math.abs(value.center), byteLength);
			await stream.writeUInt(value.peakLeftBack, byteLength);
		} else {
			return;
		}
		if (value.bass !== undefined && value.peakBass !== undefined) {
			await stream.writeUInt(Math.abs(value.center), byteLength);
			await stream.writeUInt(value.peakCenter, byteLength);
		}
	},
	simplify: (_value: IID3V2.FrameValue.RVA) => {
		return null; // TODO simplify IID3V2.FrameValue.RVA
	}
};
