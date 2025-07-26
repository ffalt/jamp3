import { IID3V1 } from '../id3v1/id3v1.types';
import { IID3V2 } from '../id3v2/id3v2.types';

/**
 * Interfaces for class MP3Analyzer
 */
export namespace IMP3Analyzer {

	export interface Warning {
		/** msg of warning */
		msg: string;
		/** expected value */
		expected: number | string | boolean;
		/** found value */
		actual: number | string | boolean;
	}

	export interface Options {
		/** test for mpeg warnings */
		mpeg: boolean;
		/** test for id3v2 warnings */
		id3v2: boolean;
		/** test for id3v1 warnings */
		id3v1: boolean;
		/** test for frame head xing warnings */
		xing: boolean;
		/** ignore most common error in off-by-one XING header declaration */
		ignoreXingOffOne?: boolean;
	}

	export interface Report {
		/** analyzed filename */
		filename: string;
		/** name of format e.g. "MPEG 1 (ISO/IEC 11172-3) MPEG audio layer 3" */
		format: string;
		/** bitrate mode e.g. CBR (constant), VBR (variable) */
		mode: string;
		/** duration in milliseconds */
		durationMS: number;
		/** bitrate (average if bitrate mode is variable) */
		bitRate: number;
		/** number of audio frames */
		frames: number;
		/** type of head audio frame e.g. "Info" or "XING" */
		header?: string;
		/** channel mode e.g. stereo, mono, single */
		channelMode?: string;
		/** number of channels */
		channels: number;
		/** has id3v2 */
		id3v2: boolean;
		/** has id3v1 */
		id3v1: boolean;
		/** array of warnings */
		warnings: Array<Warning>;
		/** tags data */
		tags: {
			/** the id3v2 tag data */
			id3v2?: IID3V2.Tag;
			/** the id3v1 tag data */
			id3v1?: IID3V1.Tag;
		};
	}
}
