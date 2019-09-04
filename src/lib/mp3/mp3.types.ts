import {IID3V2} from '../id3v2/id3v2.types';
import {IID3V1} from '../id3v1/id3v1.types';
import {ITag} from '../common/types';

/**
 * Interfaces for class MP3
 */
export namespace IMP3 {

	/** Options of MP3 reading */
	export interface ReadOptions {
		/** read mpeg information */
		mpeg?: boolean;
		/** estimate mpeg information based on mpeg header (XING|Info) */
		mpegQuick?: boolean;
		/** read ID3 v2 tag */
		id3v2?: boolean;
		/** read ID3 v1 tag */
		id3v1?: boolean;
		/** read ID3 v1 tag only if no ID3 v2 tag is found */
		id3v1IfNotID3v2?: boolean;
		/** do not stop looking for id3v2, even if one is already found */
		detectDuplicateID3v2?: boolean;
		/** do not parse id3v2 frames & return binary blobs */
		raw?: boolean;
	}

	/** Result of MP3 file/stream reading */
	export interface Result {
		/** total size */
		size: number;
		/** ID3v2 tag */
		id3v2?: IID3V2.Tag;
		/** ID3v1 tag */
		id3v1?: IID3V1.Tag;
		/** mpeg information */
		mpeg?: MPEG;
		/** mpeg frames */
		frames?: MPEGFrames;
		/** raw read result */
		raw?: RawLayout;
	}

	/** Options of MP3 Tags removing */
	export interface RemoveTagsOptions {
		/** remove ID3v2 tag */
		id3v2: boolean;
		/** remove ID3v1 tag */
		id3v1: boolean;
		/** keep backup file (.bak) created while removing tags */
		keepBackup?: boolean;
	}

	/** Result of MP3 Tags removing */
	export interface RemoveResult {
		/** ID3v2 tag removed */
		id3v2: boolean;
		/** ID3v1 tag removed */
		id3v1: boolean;
	}

	/** MPEG Frame Information */
	export interface MPEGFrames {
		/** mpeg header frames (like XING, etc.) */
		headers: Array<IMP3.Frame>;
		/** Array of mpeg audio frames (raw) */
		audio: Array<IMP3.FrameRawHeaderArray>;
	}

	/** MPEG Information */
	export interface MPEG {
		/** the estimated duration based on audio mpeg header or by the first few audio frames */
		durationEstimate: number;
		/** the duration calculated by all audio frames */
		durationRead: number;
		/** # of channels */
		channels: number;
		/** bitRate of audio */
		bitRate: number;
		/** sampleRate of audio */
		sampleRate: number;
		/** # of samples per audio frame */
		sampleCount: number;
		/** # of audio frames */
		frameCount: number;
		/** # of audio frames declared in audio header */
		frameCountDeclared: number;
		/** # of bytes of audio*/
		audioBytes: number;
		/** # of bytes of audio declared in audio header */
		audioBytesDeclared: number;
		/** bitrate encoding:  VBR || CBR */
		encoded: string;
		/** channel mode:  joint || dual || single */
		mode: string;
		/** mpeg version */
		version: string;
		/** mpeg layer */
		layer: string;
	}

	/** MPEG Frame Header Object (Raw) */
	export interface FrameRawHeader {
		/** pos in stream */
		offset: number;
		/** first header flags */
		front: number;
		/**  second header flags */
		back: number;
		/** calculated size */
		size: number;
		/**  MPEG Audio version ID */
		versionIdx: number; // BB
		/** Layer description */
		layerIdx: number; // CC
		/** Sampling rate frequency index */
		sampleIdx: number; // FF
		/** Bitrate index */
		bitrateIdx: number; // EEEE
		/** Channel mode */
		modeIdx: number; // II
		/** Mode extension (Only if Joint stereo) */
		modeExtIdx: number; // JJ
		/** Emphasis */
		emphasisIdx: number; // MM
		/** Padding */
		padded: boolean; // G
		/** Protection */
		protected: boolean;  // D
		/** Copyright */
		copyright: boolean; // K
		/** Original */
		original: boolean;  // L
		/** Private bit */
		privatebit: number;  // H
	}

	/** MPEG Frame Header Object (Parsed) */
	export interface FrameHeader extends FrameRawHeader {
		/** MPEG Audio version ID */
		version: string; // BB
		/** Layer description */
		layer: string; // CC
		/** Channel mode (mono|stereo) */
		channelMode: string; // II
		/** Channel type (Dual|Joint) */
		channelType: string; // II
		/** */
		channelCount: number; // channel count
		/** Mode extension (Only if Joint stereo) */
		extension?: IMP3.FrameHeaderJointExtension; // JJ
		/** Emphasis */
		emphasis: string; // MM

		/** calculated frame duration in ms */
		time: number;
		/** samplingRate */
		samplingRate: number;
		/** bitRate */
		bitRate: number;
		/** number of samples according to layer definition */
		samples: number;
	}

	/** MPEG Frame Header Extension */
	export interface FrameHeaderJointExtension {
		bands_min?: number;
		bands_max?: number;
		intensity?: number;
		ms?: number;
	}

	/** MPEG Header VBRI */
	export interface VBRI {
		/** VBRI version*/
		version: number;
		/** delay */
		delay: number;
		/** quality indicator */
		quality: number;
		/** # of bytes */
		bytes: number;
		/** # of frames */
		frames: number;
		/** # of toc entries */
		toc_entries: number;
		/** scale factor of toc entries */
		toc_scale: number;
		/** size per table entry in bytes */
		toc_entry_size: number;
		/** frames per table entry */
		toc_frames: number;
		/** toc entries for seeking */
		toc: Buffer;
	}

	/** MPEG Header XING */
	export interface Xing {
		/** # of frames */
		frames?: number;
		/** # of bytes */
		bytes?: number;
		/** quality indicator */
		quality?: number;
		/** toc entries for seeking */
		toc?: Buffer;
		fields: {
			/** # of frames available */
			frames: boolean;
			/** # of bytes available */
			bytes: boolean;
			/** toc available */
			toc: boolean;
			/** quality indicator available */
			quality: boolean;
		};
	}

	/** MPEG Frame Object (Parsed) */
	export interface Frame {
		/** mpeg frame header */
		header: FrameHeader;
		/** mpeg header mode */
		mode?: string;
		/** mpeg xing header */
		xing?: Xing;
		/** mpeg vbri header */
		vbri?: VBRI;
	}

	/** Array of frame header values - 0: offset, 1:size, 2:front flags, 3:back flags */
	export type FrameRawHeaderArray = Array<number>;

	/** MPEG Frame Object (Raw) */
	export interface RawFrame {
		/** Array of frame header values - 0: offset, 1:size, 2:front flags, 3:back flags */
		header: FrameRawHeaderArray;
		/** mpeg header mode */
		mode?: string;
		/** mpeg xing header */
		xing?: Xing;
		/** mpeg vbri header */
		vbri?: VBRI;
	}

	/** MP3 File/Stream Layout (Raw) */
	export interface RawLayout {
		/** array of frame headers */
		frameheaders: Array<FrameRawHeaderArray>;
		/** array of mpeg headers */
		headframes: Array<RawFrame>;
		/** array of tags */
		tags: Array<ITag>;
		/** size of file/stream */
		size: number;
	}

}
