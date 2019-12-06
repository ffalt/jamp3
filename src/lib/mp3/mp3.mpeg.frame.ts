import {
	mpeg_bitrates, mpeg_channel_count, mpeg_channel_mode_jointstereoIdx, mpeg_channel_mode_types,
	mpeg_channel_modes, mpeg_emphasis, mpeg_frame_samples, mpeg_layer_joint_extension,
	mpeg_layer_names_long, mpeg_slot_size, mpeg_srates, mpeg_version_names_long
} from './mp3.mpeg.consts';
import {IMP3} from './mp3.types';
import {isBit} from '../common/utils';
import {BufferReader} from '../common/buffer-reader';

export function collapseRawHeader(header: IMP3.FrameRawHeader): IMP3.FrameRawHeaderArray {
	return [
		header.offset,
		header.size,
		header.front,
		header.back
	];
}

export function rawHeaderOffSet(header: IMP3.FrameRawHeaderArray): number {
	return header[0];
}

export function rawHeaderSize(header: IMP3.FrameRawHeaderArray): number {
	return header[1];
}

export function rawHeaderVersionIdx(header: IMP3.FrameRawHeaderArray): number {
	return (header[2] >> 3) & 0x3;
}

export function rawHeaderLayerIdx(header: IMP3.FrameRawHeaderArray): number {
	return (header[2] >> 1) & 0x3;
}

export function expandMPEGFrameFlags(front: number, back: number, offset: number): IMP3.FrameRawHeader | null {
	// AAAAAAAA: frame sync must be 11111111
	// AAA: frame sync must be 111
	const hasSync = (front & 0xFFE0) === 0xFFE0;
	const validVer = (front & 0x18) !== 0x8;
	const validLayer = (front & 0x6) !== 0x0;
	const validBitRate = (back & 0xF000) !== 0xF000;
	const validSample = (back & 0xC00) !== 0xC00;
	if (!hasSync || !validVer || !validLayer || !validBitRate || !validSample) {
		return null;
	}
	// BB: MPEG Audio version ID
	const versionIdx = (front >> 3) & 0x3;
	// CC: Layer description
	const layerIdx = (front >> 1) & 0x3;
	// D: Protection bit / 0 - Protected by CRC (16bit crc follows header) /  1 - Not protected
	const protection = (front & 0x1) === 0;
	// EEEE: Bitrate index
	const bitrateIdx = back >> 12;
	// FF: Sampling rate frequency index
	const sampleIdx = (back >> 10) & 0x3;
	// G: Padding bit / 0 - frame is not padded / 1 - frame is padded with one extra slot
	const padded = ((back >> 9) & 0x1) === 1;
	// H: Private bit. It may be freely used for specific needs of an application, i.e. if it has to trigger some application specific events.
	const privatebit = ((back >> 8) & 0x1);
	// II: Channel mode
	const modeIdx = (back >> 6) & 0x3;
	// JJ: Mode extension (Only if Joint stereo)
	const modeExtIdx = (back >> 4) & 0x3;
	// K: Copyright / 0 - Audio is not copyrighted / 1 - Audio is copyrighted
	const copyright = ((back >> 3) & 0x1) === 1;
	// L Original / 0 - Copy of original media / 1 - Original media
	const original = ((back >> 2) & 0x1) === 1;
	// MM: Emphasis
	const emphasisIdx = back & 0x3;
	if (mpeg_bitrates[versionIdx] && mpeg_bitrates[versionIdx][layerIdx] && (mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] > 0) &&
		mpeg_srates[versionIdx] && (mpeg_srates[versionIdx][sampleIdx] > 0) &&
		mpeg_frame_samples[versionIdx] && (mpeg_frame_samples[versionIdx][layerIdx] > 0) &&
		(mpeg_slot_size[layerIdx] > 0)
	) {
		const bitrate = mpeg_bitrates[versionIdx][layerIdx][bitrateIdx] * 1000;
		const samprate = mpeg_srates[versionIdx][sampleIdx];
		const samples = mpeg_frame_samples[versionIdx][layerIdx];
		const slot_size = mpeg_slot_size[layerIdx];
		const bps = samples / 8.0;
		/**
		 Frame Size = ( (Samples Per Frame / 8 * Bitrate) / Sampling Rate) + Padding Size
		 Because of rounding errors, the official formula to calculate the frame size is a little bit different.
		 According to the ISO standards, you have to calculate the frame size in slots (see 2. MPEG Audio Format),
		 then truncate this number to an integer, and after that multiply it with the slot size.
		 */
		const size = Math.floor(((bps * bitrate) / samprate)) + ((padded) ? slot_size : 0);
		return {
			offset,
			front,
			back,
			size,
			versionIdx,
			layerIdx,
			sampleIdx,
			bitrateIdx,
			modeIdx,
			modeExtIdx,
			emphasisIdx,
			padded,
			protected: protection,
			copyright,
			original,
			privatebit
		};
	}
	return null;
}

export function expandRawHeaderArray(header: IMP3.FrameRawHeaderArray): IMP3.FrameRawHeader {
	const result = expandMPEGFrameFlags(header[2], header[3], header[0]);
	if (!result) {
		return {
			offset: 0,
			size: 0,
			versionIdx: 0,
			layerIdx: 0,
			front: 0,
			back: 0,
			sampleIdx: 0,
			bitrateIdx: 0,
			modeIdx: 0,
			modeExtIdx: 0,
			emphasisIdx: 0,
			padded: false,
			protected: false,
			copyright: false,
			original: false,
			privatebit: 0
		};
	}
	return result;
}

export function expandRawHeader(header: IMP3.FrameRawHeader): IMP3.FrameHeader {
	const samplingRate = mpeg_srates[header.versionIdx][header.sampleIdx];
	const samples = mpeg_frame_samples[header.versionIdx][header.layerIdx];
	/**
	 Frame Size = ( (Samples Per Frame / 8 * Bitrate) / Sampling Rate) + Padding Size

	 Because of rounding errors, the official formula to calculate the frame size is a little bit different.
	 According to the ISO standards, you have to calculate the frame size in slots (see 2. MPEG Audio Format),
	 then truncate this number to an integer, and after that multiply it with the slot size.
	 */
	const time = samplingRate > 0 ? (samples / samplingRate) * 1000 : 0;

	return {
		...header,
		time,
		version: mpeg_version_names_long[header.versionIdx], // BB: MPEG Audio version ID
		layer: mpeg_layer_names_long[header.layerIdx], // CC: Layer description
		channelMode: mpeg_channel_modes[header.modeIdx], // II: Channel mode
		channelType: mpeg_channel_mode_types[header.modeIdx], // II: Channel mode
		channelCount: mpeg_channel_count[header.modeIdx], // II: Channel mode
		extension: header.modeIdx === mpeg_channel_mode_jointstereoIdx ? mpeg_layer_joint_extension[header.layerIdx][header.modeExtIdx] : undefined, // JJ: Mode extension (Only if Joint stereo)
		emphasis: mpeg_emphasis[header.emphasisIdx], // MM: Emphasis
		samplingRate,
		bitRate: mpeg_bitrates[header.versionIdx][header.layerIdx][header.bitrateIdx] * 1000,
		samples
	};
}

export class MPEGFrameReader {

	public readMPEGFrameHeader(buffer: Buffer, offset: number): IMP3.FrameRawHeader | null {
		// at least 4 bytes
		if (buffer.length - offset < 4) {
			return null;
		}
		// AAAAAAAA AAABBCCD
		const front = buffer.readUInt16BE(offset);
		// EEEEFFGH IIJJKLMM
		const back = buffer.readUInt16BE(offset + 2);
		return expandMPEGFrameFlags(front, back, offset);
	}

	private verfiyCRC() {
		/**
		 http://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header#CRC
		 var verifyCRC = function(){
		 2.2. Verifying CRC

		 If the protection bit in the header is not set, the frame contains a 16 bit CRC (Cyclic Redundancy Checksum). This checksum directly follows the frame header and is a big-endian WORD.
		  To verify this checksum you have to calculate it for the frame and compare the calculated CRC with the stored CRC. If they aren't equal probably a transfer error has appeared.
		   It is also helpful to check the CRC to verify that you really found the beginning of a frame, because the sync bits do in same cases also occur within the data section of a frame.

		 The CRC is calculated by applying the CRC-16 algorithm (with the generator polynom 0x8005) to a part of the frame. The following data is considered for the CRC: the last two bytes of
		 the header and a number of bits from the audio data which follows the checksum after the header. The checksum itself must be skipped for CRC calculation. Unfortunately there is no
		  easy way to compute the number of frames which are necessary for the checksum calculation in Layer II. Therefore I left it out in the code. You would need other information apart
		  from the header to calculate the necessary bits. However it is possible to compute the number of protected bits in Layer I and Layer III only with the information from the header.

		 For Layer III, you consider the complete side information for the CRC calculation. The side information follows the header or the CRC in Layer III files. It contains information
		 about the general decoding of the frame, but doesn't contain the actual encoded audio samples. The following table shows the size of the side information for all Layer III files.
		 2.2.1 Layer III side information size (in bytes) 	MPEG 1 	MPEG 2/2.5 (LSF)
		 Stereo, Joint Stereo, Dual Channel 	32 	17
		 Mono 	17 	9

		 For Layer I files, you must consider the mode extension (see table 2.1.6) from the header. Then you can calculate the number of bits which are necessary for CRC calculation
		 by applying the following formula:

		 4 * (number of channels * bound of intensity stereo +
		 (32 - bound of intensity stereo));

		 This can be read as two times the number of stereo subbands plus the number of mono subbands and the result multiplied with 4. For simple mono frames, this equals 128,
		 because the number of channels is one and the bound of intensity stereo is 32, meaning that there is no intensity stereo. For stereo frames this is 256.
		 For more information have a look at the CRC code in the class CMPAFrame.
		 }
		 */
	}

	private readLame() {
		/*
		 LAME header
		 -----------

		 120 bytes	Xing header
		 9 bytes		lame version string (for example, "LAME3.12 (beta 6)")
		 1 byte		revision and vbr method:
		 4 bits		revision
		 4 bits		vbr method
		 1 byte		lowpass filter frequency
		 4 bytes		peak signal amplitude
		 2 bytes		radio replay gain
		 2 bytes		audiohpile replay gain
		 1 byte 		flags 1:
		 4 bits		auth type
		 1 bit			Naoki's psycho acoustic model was used
		 1 bit			safe joint
		 1 bit			no gap more
		 1 bit			no gap previous
		 1 byte		abr bitrate (0xFF means invalid)
		 12 bits		encoding delay
		 12 bits		encoding padding
		 1 byte		flags 2:
		 2 bits		noise shaping
		 3 bits		stereo mode
		 1 bit			non optimal
		 2 bits		source frequency
		 1 byte		unused
		 2 bytes		preset value
		 4 bytes		music length
		 2 bytes		music crc
		 2 bytes		crc

		 Values of vbr method:
		 0: ? (-vbr 5)
		 1: ? (-vbr 0)
		 2: ? (-vbr 3)
		 3: ? (-vbr 2 and -vbr 6)
		 4: ? (-vbr 4)
		 5: ? (-vbr 1)
		 >5: unused

		 Values of source frequency:
		 0: < 32000 kHz
		 1:   44100 kHz
		 2:   48000 kHz
		 3: > 48000 kHz

		 Values of stereo mode:
		 0: mono
		 1: stereo
		 2: dual channel
		 3: joint stereo
		 4: joint stereo with forced mid-side stereo
		 5: auto mid-side stereo
		 6: unused/reserved
		 7: default fallback (unknown)

		 Note: the Xing header tag may be the string "Info" in case of non-VBR stream.

		 */
	}

	private readVbri(data: Buffer, frame: IMP3.RawFrame, offset: number): number {
		/** http://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header#VBRIHeader
		 2.3.2 VBRI Header
		 This header is only used by MPEG audio files encoded with the Fraunhofer Encoder as far as I know. It is different from the XING header. You find it exactly 32 bytes after the end of the first MPEG audio header in the file. (Note that the position is zero-based; position, length and example are each in byte-format.)
		 Position    Length    Meaning    Example
		 0            4        VBR header ID in 4 ASCII chars, always 'VBRI', not NULL-terminated    'VBRI'
		 4            2        Version ID as Big-Endian WORD    1
		 6            2        Delay as Big-Endian float    7344
		 8            2        Quality indicator    75
		 10        4        Number of Bytes as Big-Endian DWORD    45000
		 14        4        Number of Frames as Big-Endian DWORD    7344
		 18        2        Number of entries within TOC table as Big-Endian WORD    100
		 20        2        Scale factor of TOC table entries as Big-Endian DWORD    1
		 22        2        Size per table entry in bytes (max 4) as Big-Endian WORD    2
		 24        2        Frames per table entry as Big-Endian WORD    845
		 26        TOC entries for seeking as Big-Endian integral. From size per table entry and number of entries, you can calculate the length of this field.
		 */
		const reader = new BufferReader(data);
		reader.position = offset;
		frame.mode = reader.readFixedAsciiString(4);
		const version = reader.readSInt(2);
		const delay = reader.readSInt(2);
		const quality = reader.readSInt(2);
		const bytes = reader.readSInt(4);
		const frames = reader.readSInt(4);
		const toc_entries = reader.readSInt(2);
		const toc_scale = reader.readSInt(2);
		const toc_entry_size = reader.readSInt(2);
		const toc_frames = reader.readSInt(2);
		const toc_size = toc_entries * toc_entry_size;
		const toc = reader.readBuffer(toc_size);
		frame.vbri = {
			version, delay, quality, bytes, frames,
			toc_entries, toc_scale, toc_entry_size, toc_frames, toc
		};
		return reader.position;
	}

	private readXing(data: Buffer, frame: IMP3.RawFrame, offset: number): number {
		/**
		 http://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header#XINGHeader
		 This header is often (but unfortunately not always) added to files which are encoded with variable bitrate mode.
		 This header stands after the first MPEG audio header at a specific position.
		 The whole first frame which contains the XING header is a valid but empty audio frame, so even decoders which don't consider this header can decode the file.
		 The XING header stands after the side information in Layer III files. So you can calculate the beginning of a XING header relative to the
		 beginning of the frame by adding 4 bytes (for the MPEG audio header) to the values from the table 2.2.1. The offset calculation doesn't consider
		 the 16 bit CRC following the header and is equal for all Layers, although only Layer III has a side information.
		 For reading out this header, you have to find the first MPEG audio header and then go to this specific position within the frame.
		 The XING header itself has the following format. (Note that the position is zero-based; position, length and example are each in byte-format.)

		 Position     Length     Meaning    Example
		 0             4         VBR header ID in 4 ASCII chars, either 'Xing' or 'Info', not NULL-terminated    'Xing'
		 4             4         Flags which indicate what fields are present, flags are combined with a logical OR. Field is mandatory.
		 0x0001 - Frames field is present
		 0x0002 - Bytes field is present
		 0x0004 - TOC field is present
		 0x0008 - Quality indicator field is present
		 example: 0x0007 (means Frames, Bytes & TOC valid)

		 8             4         Number of Frames as Big-Endian DWORD (optional)    7344

		 8 or 12     4         Number of Bytes in file as Big-Endian DWORD (optional)    45000

		 8,12 or 16  100     100 TOC entries for seeking as integral BYTE (optional)
		 Every TOC entry contains the size of the n-th frame. Calculating the position
		 of the 3rd frame should look as following: header_size + toc[0] + toc[1] + toc[2]


		 8, 12, 16, 108, 112 or 116    4    Quality indicator as Big-Endian DWORD from 0 - best quality to 100 - worst quality (optional)    0

		 According to this format, a XING header must only contain the ID and the flags. All other fields are optional and depend on the flags which are set.
		 Sometimes this header is also added to CBR files. It then often has the ID 'Info' instead of 'Xing'.

		 There exists the LAME extension to this header, which is used by the common LAME Encoder, http://gabriel.mp3-tech.org/mp3infotag.html#versionstring
		 */
		const reader = new BufferReader(data);
		reader.position = offset;
		frame.mode = reader.readFixedAsciiString(4);
		const field = reader.readSInt(4);
		frame.xing = {
			fields: {
				frames: isBit(field, 1),
				bytes: isBit(field, 2),
				toc: isBit(field, 4),
				quality: isBit(field, 8)
			}
		};
		if (frame.xing.fields.frames) {
			frame.xing.frames = reader.readSInt(4);
		}
		if (frame.xing.fields.bytes) {
			frame.xing.bytes = reader.readSInt(4);
		}
		if (frame.xing.fields.toc) {
			frame.xing.toc = reader.readBuffer(100);
		}
		if (frame.xing.fields.quality) {
			frame.xing.quality = reader.readSInt(4);
		}
		return reader.position;
	}

	public readFrame(chunk: Buffer, offset: number, header: IMP3.FrameRawHeader): { offset: number, frame: IMP3.RawFrame } {
		const frame: IMP3.RawFrame = {header: collapseRawHeader(header)};
		let off = 0;
		const length = offset + Math.min(40, chunk.length - 4 - offset);
		for (let i = offset; i < length; i++) {
			const c = chunk[i];
			const c2 = chunk[i + 1];
			const c3 = chunk[i + 2];
			const c4 = chunk[i + 3];
			if (
				(c === 88 && c2 === 105 && c3 === 110 && c4 === 103) || // Xing
				(c === 73 && c2 === 110 && c3 === 102 && c4 === 111)  // Info
			) {
				off = this.readXing(chunk, frame, i);
			} else if (c === 86 && c2 === 66 && c3 === 82 && c4 === 73) { // VBRI
				off = this.readVbri(chunk, frame, i);
			}
			if (off > 0) {
				break;
			}
		}
		return {offset: off, frame};
	}

}
