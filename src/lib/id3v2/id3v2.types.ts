import {ITag} from '../common/types';

export namespace IID3V2 {

	/** ID3v2 Frame Value Types */
	export namespace FrameValue {

		export interface Base {
		}

		export interface IdAscii extends Base {
			id: string;
			text: string;
		}

		export interface LangDescText extends Base {
			/** language code */
			language: string;
			/** description */
			id: string;
			/** the text */
			text: string;
		}

		export interface LangText extends Base {
			language: string;
			text: string;
		}

		export interface Pic extends Base {
			description: string;
			pictureType: number;
			url?: string;
			bin?: Buffer;
			mimeType?: string;
		}

		export interface Bin {
			bin: Buffer;
		}

		export interface Number extends Base {
			num: number;
		}

		export interface RVA extends Base {
			right: number;
			left: number;
			peakRight?: number;
			peakLeft?: number;
			rightBack?: number;
			leftBack?: number;
			peakRightBack?: number;
			peakLeftBack?: number;
			center?: number;
			peakCenter?: number;
			bass?: number;
			peakBass?: number;
		}

		export interface RVA2Channel extends Base {
			type: number;
			adjustment: number;
			peak?: number;
		}

		export interface RVA2 extends Base {
			id: string;
			channels: Array<RVA2Channel>;
		}

		export interface Popularimeter extends Base {
			rating: number;
			count: number;
			email: string;
		}

		export interface Bool extends Base {
			bool: boolean;
		}

		export interface AudioEncryption extends Base {
			id: string;
			previewStart: number;
			previewLength: number;
			bin: Buffer;
		}

		export interface LinkedInfo extends Base {
			url: string;
			id: string;
			additional: Array<string>;
		}

		export interface EventTimingCodes extends Base {
			format: number;
			events: Array<EventTimingCodesEvent>;
		}

		export interface EventTimingCodesEvent {
			type: number;
			timestamp: number;
		}

		export interface SynchronisedLyrics extends Base {
			id: string;
			language: string;
			timestampFormat: number;
			contentType: number;
			events: Array<SynchronisedLyricsEvent>;
		}

		export interface SynchronisedLyricsEvent {
			timestamp: number;
			text: string;
		}

		export interface GEOB extends Base {
			filename: string;
			mimeType: string;
			contentDescription: string;
			bin: Buffer;
		}

		export interface ReplayGainAdjustment extends Base {
			peak: number;
			radioAdjustment: number;
			audiophileAdjustment: number;
		}

		export interface ChapterToc extends Base {
			id: string;
			ordered: boolean;
			topLevel: boolean;
			children: Array<string>;
		}

		export interface Chapter extends Base {
			id: string;
			start: number;
			end: number;
			offset: number;
			offsetEnd: number;
		}

		export interface IdBin extends Base {
			id: string;
			bin: Buffer;
		}

		export interface IdText extends Base {
			id: string;
			text: string;
		}

		export interface Ascii extends Base {
			text: string;
		}

		export interface Text extends Base {
			text: string;
		}

		export interface TextList extends Base {
			list: Array<string>;
		}

	}

	/** ID3v2 Frame Header Format Flags */
	export interface FrameHeaderFormatFlags {
		[name: string]: boolean | undefined;

		dataLengthIndicator?: boolean;
		unsynchronised?: boolean;
		compressed?: boolean;
		encrypted?: boolean;
		grouping?: boolean;
		reserved?: boolean;
		reserved2?: boolean;
		reserved3?: boolean;
	}

	/** ID3v2 Frame Header Status Flags */
	export interface FrameHeaderStatusFlags {
		[name: string]: boolean | undefined;

		unsynchronisation?: boolean;
		extendedheader?: boolean;
		experimental?: boolean;
		footer?: boolean;
	}

	/** ID3v2 Frame Header */
	export interface FrameHeader {
		/** frame string encoding */
		encoding?: string;
		/** frame status flags */
		statusFlags?: FrameHeaderStatusFlags;
		/** frame format flags */
		formatFlags?: FrameHeaderFormatFlags;
		/** frame size */
		size?: number;
	}

	/** ID3v2 Frame */
	export interface Frame {
		/** frame id */
		id: string;
		/** frame title */
		title?: string;
		/** frame header */
		head?: FrameHeader;
		/** frame value */
		value: FrameValue.Base;
		/** frame sub-frames */
		subframes?: Array<Frame>;
		/** invalid frame marker */
		invalid?: string;
		/** frame group id */
		groupId?: number;
	}

	/** ID3v2 Frame Types */
	export namespace Frames {
		export interface Map {
			[key: string]: Array<Frame>;
		}

		export interface TextFrame extends Frame {
			value: FrameValue.Text;
		}

		export interface NumberFrame extends Frame {
			value: FrameValue.Number;
		}

		export interface IdTextFrame extends Frame {
			value: FrameValue.IdText;
		}

		export interface TextListFrame extends Frame {
			value: FrameValue.TextList;
		}

		export interface BoolFrame extends Frame {
			value: FrameValue.Bool;
		}

		export interface LangDescTextFrame extends Frame {
			value: FrameValue.LangDescText;
		}

		export interface PicFrame extends Frame {
			value: FrameValue.Pic;
		}

		export interface IdBinFrame extends Frame {
			value: FrameValue.IdBin;
		}

		export interface ChapterFrame extends Frame {
			value: FrameValue.Chapter;
		}

		export interface EventTimingCodesFrame extends Frame {
			value: FrameValue.EventTimingCodes;
		}

		export interface SynchronisedLyricsFrame extends Frame {
			value: FrameValue.SynchronisedLyrics;
		}

		export interface RelativeAudioAdjustmentsFrame extends Frame {
			value: FrameValue.RVA;
		}

		export interface RelativeAudioAdjustments2Frame extends Frame {
			value: FrameValue.RVA2;
		}

		export interface UnknownFrame extends Frame {
			value: FrameValue.Bin;
		}

		export interface GEOBFrame extends Frame {
			value: FrameValue.GEOB;
		}

		export interface PopularimeterFrame extends Frame {
			value: FrameValue.Popularimeter;
		}

		export interface AudioEncryptionFrame extends Frame {
			value: FrameValue.AudioEncryption;
		}

		export interface LinkedInfoFrame extends Frame {
			value: FrameValue.LinkedInfo;
		}

		export interface LangTextFrame extends Frame {
			value: FrameValue.LangText;
		}

		export interface ReplayGainAdjustmentFrame extends Frame {
			value: FrameValue.ReplayGainAdjustment;
		}

		export interface ChapterTOCFrame extends Frame {
			value: FrameValue.ChapterToc;
		}
	}

	/** ID3v2 Tag Builder Interface */
	export interface Builder {
		buildFrames(): Array<Frame>;

		version(): number;

		rev(): number;
	}

	/** ID3v2 Tag Header */
	export interface TagHeader {
		ver: number;
		rev: number;
		size: number;
		valid: boolean;
		v2?: TagHeaderV2;
		v3?: TagHeaderV3;
		v4?: TagHeaderV4;
		flagBits?: Array<number>;
	}

	/** ID3v2.2 Tag Header */
	export interface TagHeaderV2 {
		sizeAsSyncSafe?: number; // just in case if size is written in wrong v2.2 format
		flags: TagHeaderFlagsV2;
	}

	/** ID3v2.2 Tag Header Flags */
	export interface TagHeaderFlagsV2 {
		unsynchronisation?: boolean;
		compression?: boolean;
	}

	/** ID3v2.3 Tag Header */
	export interface TagHeaderV3 {
		flags: TagHeaderFlagsV3;
		extended?: TagHeaderExtendedVer3;
	}

	/** ID3v2.3 Tag Header Flags */
	export interface TagHeaderFlagsV3 {
		unsynchronisation?: boolean;
		extendedheader?: boolean;
		experimental?: boolean;
	}

	/** ID3v2.3 Tag Extended Header */
	export interface TagHeaderExtendedVer3 {
		size: number;
		flags1: FrameHeaderStatusFlags;
		flags2: FrameHeaderStatusFlags;
		crcData?: number;
		sizeOfPadding: number;
	}

	/** ID3v2.4 Tag Header */
	export interface TagHeaderV4 {
		flags: TagHeaderFlagsV4;
		extended?: TagHeaderExtendedVer4;
	}

	/** ID3v2.4 Tag Header Flags */
	export interface TagHeaderFlagsV4 {
		unsynchronisation?: boolean;
		extendedheader?: boolean;
		experimental?: boolean;
		footer?: boolean;
	}

	/** ID3v2.4 Tag Extended Header */
	export interface TagHeaderExtendedVer4 {
		size: number;
		flags: FrameHeaderStatusFlags;
		restrictions?: {
			tagSize: string;
			textEncoding: string;
			textSize: string;
			imageEncoding: string;
			imageSize: string;
		};
		crc32?: number;
	}

	/** ID3v2 Tag (Parsed) */
	export interface Tag extends ITag {
		/** ID3v2 Tag Header */
		head?: TagHeader;
		/** ID3v2 Tag Frames */
		frames: Array<Frame>;
	}

	/** ID3v2 Tag */
	export interface ID3v2Tag {
		/** ID3v2 Tag Header */
		head?: TagHeader;
		/** ID3v2 Tag Frames (Parsed) */
		frames: Array<Frame>;
	}

	/** ID3v2 Tag (Raw) */
	export interface RawTag extends ITag {
		/** ID3v2 Tag Header */
		head: TagHeader;
		/** ID3v2 Tag Frames (Raw) */
		frames: Array<RawFrame>;
	}

	/** ID3v2 Frame (Raw) */
	export interface RawFrame {
		/** frame id */
		id: string;
		/** start of frame */
		start: number;
		/** end of frame */
		end: number;
		/** size of frame */
		size: number;
		/** data of frame */
		data: Buffer;
		/** frame status flags */
		statusFlags: FrameHeaderStatusFlags;
		/** frame format flags */
		formatFlags: FrameHeaderFormatFlags;
	}

	/** ID3v2 Result (Simplified) */
	export interface TagSimplified {
		[name: string]: string | undefined;

		ACOUSTID_FINGERPRINT?: string;
		ACOUSTID_ID?: string;
		ALBUM?: string;
		ALBUMARTIST?: string;
		ALBUMARTISTSORT?: string;
		ALBUMSORT?: string;
		ARRANGER?: string;
		ARTIST?: string;
		ARTISTS?: string;
		ARTISTSORT?: string;
		ASIN?: string;
		AUDIOENCRYPTION?: string;
		AUDIOSEEKPOINTINDEX?: string;
		AUDIOSOURCEWWEBPAGEURL?: string;
		AUDIOSTREAMSIZE?: string;
		BARCODE?: string;
		BPM?: string;
		CATALOGNUMBER?: string;
		CHAPTER?: string;
		CHAPTERTOC?: string;
		COMMENT?: string;
		COMMERCIAL?: string;
		COMMERCIALINFORMATIONURL?: string;
		COMPILATION?: string;
		COMPOSER?: string;
		COMPOSERSORT?: string;
		COMPRESSEDMETA?: string;
		CONDUCTOR?: string;
		COPYRIGHT?: string;
		DATE?: string;
		DISCNUMBER?: string;
		DISCSUBTITLE?: string;
		DISCTOTAL?: string;
		DJMIXER?: string;
		ENCODEDBY?: string;
		ENCODERSETTINGS?: string;
		ENCODINGTIME?: string;
		ENCRYPTEDMET?: string;
		ENCRYPTIONMETHODREGISTRATION?: string;
		ENGINEER?: string;
		EQUALISATION?: string;
		EVENTTIMINGCODE?: string;
		FILEOWNER?: string;
		FILETYPE?: string;
		FILEWEBPAGEURL?: string;
		GENERALENCAPSULATEDOBJECT?: string;
		GENRE?: string;
		GROUPIDREGISTRATION?: string;
		GROUPING?: string;
		ISRC?: string;
		KEY?: string;
		LABEL?: string;
		LANGUAGE?: string;
		LICENSE?: string;
		LYRICIST?: string;
		LYRICS?: string;
		MEDIA?: string;
		MIXER?: string;
		MOOD?: string;
		MOVEMENT?: string;
		MOVEMENTNAME?: string;
		MOVEMENTTOTAL?: string;
		MP3HD?: string;
		MPEGLOCATIONLOOKUPTABLE?: string;
		MUSICBRAINZ_ALBUMARTISTID?: string;
		MUSICBRAINZ_ALBUMID?: string;
		MUSICBRAINZ_ARTISTID?: string;
		MUSICBRAINZ_DISCID?: string;
		MUSICBRAINZ_ORIGINALALBUMID?: string;
		MUSICBRAINZ_ORIGINALARTISTID?: string;
		MUSICBRAINZ_RELEASEGROUPID?: string;
		MUSICBRAINZ_RELEASETRACKID?: string;
		MUSICBRAINZ_TRACKID?: string;
		MUSICBRAINZ_TRMID?: string;
		MUSICBRAINZ_WORKID?: string;
		MUSICCDID?: string;
		MUSICIP_PUID?: string;
		MUSICMATCH?: string;
		ORGANIZATION?: string;
		ORIGINALALBUM?: string;
		ORIGINALARTIST?: string;
		ORIGINALDATE?: string;
		ORIGINALFILENAME?: string;
		ORIGINALLYICIST?: string;
		ORIGINALYEAR?: string;
		OWNERSHIP?: string;
		PARTNUMBE?: string;
		PAYMENTURL?: string;
		PERFORME?: string;
		PICTURE?: string;
		PLAYCOUNTER?: string;
		PLAYLISTDELAY?: string;
		PODCAST?: string;
		PODCAST_DESCRIPTION?: string;
		PODCAST_KEYWORDS?: string;
		PODCASTFEEDURL?: string;
		PODCASTID?: string;
		POSITIONSYNCHRONISATION?: string;
		PRODUCEDNOTICE?: string;
		PRODUCER?: string;
		PUBLISHERURL?: string;
		RADIOSTATIONNAME?: string;
		RADIOSTATIONOWNER?: string;
		RADIOSTATIONWEBPAGEURL?: string;
		RATING?: string;
		RECOMMENDEDBUFFERSIZE?: string;
		RECORDINGDATES?: string;
		RELATIVEVOLUMEADJUSTMENT?: string;
		RELEASECOUNTRY?: string;
		RELEASESTATUS?: string;
		RELEASETIME?: string;
		RELEASETYPE?: string;
		REMIXER?: string;
		REPLAYGAIN_ALBUM_GAIN?: string;
		REPLAYGAIN_ALBUM_PEAK?: string;
		REPLAYGAIN_TRACK_GAIN?: string;
		REPLAYGAIN_TRACK_PEAK?: string;
		REPLAYGAINADJUSTMENT?: string;
		REVERB?: string;
		SCRIPT?: string;
		SEEK?: string;
		SHOWMOVEMENT?: string;
		SIGNATURE?: string;
		SUBTITLE?: string;
		SYNCHRONISEDLYRICS?: string;
		SYNCHRONISEDTEMPOCODES?: string;
		TAGGINGTIME?: string;
		TERMSOFUSE?: string;
		TITLE?: string;
		TITLESORT?: string;
		TRACKLENGTH?: string;
		TRACKNUMBER?: string;
		TRACKTOTAL?: string;
		WEBSITE?: string;
		WORK?: string;
		WRITER?: string;
	}

	/** ID3v2 Format Warnings */
	export interface Warning {
		/** msg of warning */
		msg: string;
		/** expected value */
		expected: number | string | boolean;
		/** found value */
		actual: number | string | boolean;
	}

	/** ID3v2 Remove Options */
	export interface RemoveOptions {
		/** keep a filename.mp3.bak copy of the original file */
		keepBackup?: boolean;
	}

	/** ID3v2 Write Options */
	export interface WriteOptions {
		/** encoding used if not specified in frame header */
		defaultEncoding?: string;
		/** padding zeros between id3v2 and the audio (in bytes) */
		paddingSize?: number;
		/** keep a filename.mp3.bak copy of the original file */
		keepBackup?: boolean;
	}
}

