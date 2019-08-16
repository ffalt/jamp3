import {ITag} from '../common/types';
import {Id3v2WriterOptions} from './id3v2_writer';

export namespace IID3V2 {

	export namespace FrameValue {

		export interface Base {
		}

		export interface IdAscii extends Base {
			id: string;
			text: string;
		}

		export interface LangDescText extends Base {
			language: string;
			id: string; // description
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

		export interface Link extends Base {
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

	export interface FormatFlags {
		[name: string]: boolean | undefined;

		data_length_indicator?: boolean;
		unsynchronised?: boolean;
		compressed?: boolean;
		encrypted?: boolean;
		grouping?: boolean;
		reserved?: boolean;
		reserved2?: boolean;
		reserved3?: boolean;
	}

	export interface Flags {
		[name: string]: boolean | undefined;

		unsynchronisation?: boolean;
		extendedheader?: boolean;
		experimental?: boolean;
		footer?: boolean;
	}

	export interface FrameHeader {
		encoding?: string;
		statusFlags: Flags;
		formatFlags: FormatFlags;
		size: number;
	}

	export interface Frame {
		id: string;
		title?: string;
		head?: FrameHeader;
		value: FrameValue.Base;
		subframes?: Array<Frame>;
		invalid?: string;
		groupId?: number;
	}

	export interface TagHeader {
		ver: number;
		rev: number;
		size: number;
		valid: boolean;
		v2?: {
			sizeAsSyncSafe?: number; // just in case if size is written in wrong v2.2 format
			flags: {
				unsynchronisation?: boolean;
				compression?: boolean;
			}
		};
		v3?: {
			flags: {
				unsynchronisation?: boolean;
				extendedheader?: boolean;
				experimental?: boolean;
			}
			extended?: TagHeaderExtendedVer3;
		};
		v4?: {
			flags: {
				unsynchronisation?: boolean;
				extendedheader?: boolean;
				experimental?: boolean;
				footer?: boolean;
			}
			extended?: TagHeaderExtendedVer4;
		};
		// flags?: Flags;
		flagBits?: Array<number>;
	}

	export interface TagHeaderExtendedVer3 {
		size: number;
		flags1: Flags;
		flags2: Flags;
		crcData?: number;
		sizeOfPadding: number;
	}

	export interface TagHeaderExtendedVer4 {
		size: number;
		flags: Flags;
		restrictions?: {
			tagSize: string;
			textEncoding: string;
			textSize: string;
			imageEncoding: string;
			imageSize: string;
		};
		crc32?: number;
	}

	export interface Tag extends ITag {
		head?: TagHeader;
		frames: Array<Frame>;
	}

	export interface ID3v2 {
		head?: TagHeader;
		frames: Array<Frame>;
	}

	export interface RawTag extends ITag {
		head: TagHeader;
		frames: Array<RawFrame>;
	}

	export interface RawFrame {
		id: string;
		start: number;
		end: number;
		size: number;
		data: Buffer;
		statusFlags: Flags;
		formatFlags: FormatFlags;
	}

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

	export interface RemoveOptions {
		keepBackup?: boolean;
	}

	export interface WriteOptions extends Id3v2WriterOptions {
		keepBackup?: boolean;
	}
}

export const ID3v2_ValuePicTypes: { [name: string]: string; } = {
	'0': 'Other',
	'1': '32x32 pixels \'file icon\' (PNG only)',
	'2': 'Other file icon',
	'3': 'Cover (front)',
	'4': 'Cover (back)',
	'5': 'Leaflet page',
	'6': 'Media (e.g. lable side of CD)',
	'7': 'Lead artist/lead performer/soloist',
	'8': 'Artist/performer',
	'9': 'Conductor',
	'10': 'Band/Orchestra',
	'11': 'Composer',
	'12': 'Lyricist/text writer',
	'13': 'Recording Location',
	'14': 'During recording',
	'15': 'During performance',
	'16': 'Movie/video screen capture',
	'17': 'A bright coloured fish',
	'18': 'Illustration',
	'19': 'Band/artist logotype',
	'20': 'Publisher/Studio logotype'
};

export const ID3v2_ValueRelativeVolumeAdjustment2ChannelTypes: { [name: string]: string; } = {
	'0': 'Other',
	'1': 'Master volume',
	'2': 'Front right',
	'3': 'Front left',
	'4': 'Back right',
	'5': 'Back left',
	'6': 'Front centre',
	'7': 'Back centre',
	'8': 'Subwoofer'
};

