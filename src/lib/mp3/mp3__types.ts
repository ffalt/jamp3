import {IID3V2} from '../id3v2/id3v2__types';
import {IID3V1} from '../id3v1/id3v1__types';
import {ITag} from '../common/types';

export namespace IMP3 {

	export interface RemoveTagsOptions {
		id3v2: boolean; // remove id3v2 tag
		id3v1: boolean; // remove id3v1 tag
		keepBackup?: boolean; // keep backup file created while removing tags
	}

	export interface ReadOptions {
		// read mpeg informations
		mpeg?: boolean;
		// estimate mpeg informations based on mpeg header (XING|Info)
		mpegQuick?: boolean;
		// read ID3 v2 tag
		id3v2?: boolean;
		// read ID3 v1 tag
		id3v1?: boolean;
		// read ID3 v1 tag only if no ID3 v2 tag is found
		id3v1IfNotid3v2?: boolean;
		// do not stop looking for id3v2, even if one is already found
		detectDuplicateID3v2?: boolean;
		// do not parse frames & return binary blobs
		raw?: boolean;
	}

	export interface MPEG {
		durationEstimate: number;
		durationRead: number;
		channels: number;
		bitRate: number;
		sampleRate: number;
		sampleCount: number;
		frameCount: number;
		frameCountDeclared: number;
		audioBytes: number;
		audioBytesDeclared: number;
		encoded: string; // VBR || CBR || ''
		mode: string; // 'joint', 'dual', 'single'
		version: string;
		layer: string;
		// starttime?: number;
	}

	export interface Result {
		size: number;
		mpeg?: MPEG;
		id3v2?: IID3V2.Tag;
		id3v1?: IID3V1.Tag;
		frames?: {
			headers: Array<IMP3.Frame>;
			audio: Array<IMP3.FrameRawHeaderArray>;
		};
		raw?: RawLayout;
	}

	export interface FrameRawHeader {
		offset: number; // pos in stream
		front: number; // first header flags
		back: number; // second header flags
		size: number;  // calculated size
		versionIdx: number; // BB: MPEG Audio version ID
		layerIdx: number; // CC: Layer description
		sampleIdx: number; // FF: Sampling rate frequency index
		bitrateIdx: number; // EEEE: Bitrate index
		modeIdx: number; // II: Channel mode
		modeExtIdx: number; // JJ: Mode extension (Only if Joint stereo)
		emphasisIdx: number; // MM: Emphasis
		padded: boolean; // G: Padding bit / 0 - frame is not padded / 1 - frame is padded with one extra slot
		protected: boolean;  // D: Protection bit
		copyright: boolean; // K: Copyright
		original: boolean;  // L Original
		privatebit: number;  // H: Private bit
	}

	export interface FrameHeader extends FrameRawHeader {
		version: string; // BB: MPEG Audio version ID
		layer: string; // CC: Layer description
		channelMode: string; // II: Channel mode (mono|stereo)
		channelType: string; // II: Channel mode (Dual|Joint)
		channelCount: number; // channel count
		extension?: IMP3.FrameHeaderJointExtension; // JJ: Mode extension (Only if Joint stereo)
		emphasis: string; // MM: Emphasis

		time: number; // calculated frame duration in ms
		samplingRate: number; // samplingRate
		bitRate: number; // bitRate;
		samples: number; // number of samples according layer definition
	}

	export interface FrameHeaderJointExtension {
		bands_min?: number;
		bands_max?: number;
		intensity?: number;
		ms?: number;
	}

	export interface VBRI {
		version: number;
		delay: number;
		quality: number;
		bytes: number;
		frames: number;
		toc_entries: number;
		toc_scale: number;
		toc_entry_size: number;
		toc_frames: number;
		toc: Buffer;
	}

	export interface Xing {
		frames?: number;
		bytes?: number;
		quality?: number;
		toc?: Buffer;
		fields: {
			frames: boolean;
			bytes: boolean;
			toc: boolean;
			quality: boolean;
		};
	}

	export type FrameRawHeaderArray = Array<number>; // 0: offset, 1:size, 2:front flags, 3:back flags

	export interface RawFrame {
		header: FrameRawHeaderArray;
		mode?: string;
		xing?: Xing;
		vbri?: VBRI;
	}

	export interface Frame {
		header: FrameHeader;
		mode?: string;
		xing?: Xing;
		vbri?: VBRI;
	}

	export interface RawLayout {
		frameheaders: Array<FrameRawHeaderArray>;
		headframes: Array<RawFrame>;
		tags: Array<ITag>;
		size: number;
	}

}
