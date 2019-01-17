import {ITag} from '../common/types';

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
		syncSaveSize?: number;
		flags?: Flags;
		flagBits?: Array<number>;
		extended?: TagHeaderExtended;
	}

	export interface TagHeaderExtended {
		size: number;
		ver3?: TagHeaderExtendedVer3;
		ver4?: TagHeaderExtendedVer4;
	}

	export interface TagHeaderExtendedVer3 {
		flags1: Flags;
		flags2: Flags;
		crcData?: number;
		sizeOfPadding: number;
	}

	export interface TagHeaderExtendedVer4 {
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
		album?: string; // TAL,TALB
		album_artist?: string; // TPE2
		album_artist_sort?: string; // TSO2
		album_artist_sort_order?: string; // TS2
		album_sort_order?: string; // TSA,TSOA,XSOA
		artist?: string; // TP1, TPE1
		artist_sort?: string; // TSOP
		attached_picture?: string; // APIC,PIC
		audio_encryption?: string; // AENC,CRA
		audio_seek_point_index?: string; // ASPI
		band?: string; // TP2
		bpm?: string; // TBP,BPM,TBPM
		chapter?: string; // CHAP
		chapter_toc?: string; // CTOC
		comment?: string; // COMM
		comments?: string; // COM
		commercial?: string; // COMR
		commercial_information?: string; // WCM,WCOM
		composer?: string; // TCM,TCOM
		composer_sort?: string; // TSOC
		composer_sort_order?: string; // TSC
		conductor?: string; // TP3,TPE3
		content_group?: string; // TIT1
		content_group_description?: string; // TT1
		copyright?: string; // WCP, WCOP
		copyright_message?: string; // TCR
		copyright_msg?: string; // TCOP
		date?: string; // TDA,TDAT,TDRC
		disc?: number; // TPOS
		encoded_by?: string; // TEN,TENC
		encoder?: string; // TSSE
		encoding_software?: string; // TSS
		encrypted_meta?: string; // CRM
		encryption_method_registration?: string; // ENCR
		equalisation?: string; // EQU,EQUA
		event_timing_codes?: string; // ETC,ETCO
		file_owner?: string; // TOWN
		file_type?: string; // TFLT
		general_encapsulated_object?: string; // GEO,GEOB
		genre?: string; // TCO, TCON
		group_id_registration?: string; // GRID
		initial_key?: string; // TKE,TKEY
		internet_radio_station_name?: string; // TRSN
		internet_radio_station_owner?: string; // TRSO
		interpreted_by?: string; // TP4, TPE4
		involved_people?: string; // TIPL
		involved_people_list?: string; // IPL,IPLS
		isrc?: string; // TRC,TSRC
		itunes_compilation_flag?: string; // TCMP,TCP
		itunes_podcast_description?: string; // TDES,TDS
		itunes_podcast_keywords?: string; // TKWD
		itunes_podcast_marker?: string; // PCS, PCST
		language?: string; // TLAN,LA
		length?: string; // TLE,TLEN
		linked_information?: string; // LINK,LNK
		lyricist?: string; // TXT,TEXT
		media?: string; // TMED
		media_type?: string; // TMT
		mood?: string; // TMOO
		mpeg_location_lookup_table?: string; // MLL,MLLT
		music_cd_identifier?: string; // MCDI
		musicians_credits?: string; // TMCL
		musicmatch_binary?: string; // NCO,NCON
		official_artist?: string; // WAR,WOAR
		official_audio_file_webpage?: string; // WAF, WOAF
		official_audio_source_webpage?: string; // WAS,WOAS
		official_internet_radio_station_homepage?: string; // WORS
		original_album?: string; // TOT,TOAL
		original_artist?: string; // TOA,TOPE
		original_filename?: string; // TOF,TOFN
		original_lyricist?: string; // TOL,TOLY
		original_release_time?: string; // XDOR
		original_release_year?: string; // TOR,ORY
		ownership?: string; // OWNE
		part_of_a_set?: string; // TPA
		payment?: string; // WPAY
		performer_sort_order?: string; // TSP, XSOP
		play_counter?: string; // CNT,PCNT
		playlist_delay?: string; // TDLY, TDY
		podcast_feed_url?: string; // WFD, WFED
		podcast_url?: string; // TGID, TID
		popularimeter?: string; // POP, POPM
		position_synchronisation?: string; // POSS
		produced_notice?: string; // TPRO
		publisher?: string; // TPB, TPUB
		publishers_official_webpage?: string; // WPB, WPUB
		recommended_buffer_size?: string; // BUF, RBUF
		recording_dates?: string; // TRD, TRDA
		relative_volume_adjustment?: string; // RVA, RVAD
		relative_volume_adjustment_2?: string; // RVA2
		release_date?: string; // TDOR
		release_time?: string; // TDR, TDRL
		release_year?: string; // TDLR
		replay_gain_adjustment?: string; // RGAD
		reverb?: string; // REV, RVRB
		seek?: string; // SEEK
		set_subtitle?: string; // TSST
		signature?: string; // SIGN
		size?: string; // TSI, TSIZ
		subtitle?: string; // TIT3, TT3
		synchronised_lyrics?: string; // SLT, SYLT
		synchronised_tempo_codes?: string; // STC, SYTC
		encoding_time?: string; // TDEN
		tagging_time?: string; // TDTG
		terms_of_use?: string; // USER
		time?: string; // TIME, TIM
		title?: string; // TT2, TIT2
		title_sort_order?: string; // TSOT, TST, XSOT
		track?: number; // TRCK, TRK
		unique_file_identifier?: string; // UFI, UFID
		unsychronized_lyric?: string; // ULT
		unsync_lyric?: string; // USLT
		year?: number; // TYE,TYER

		private_frame?: string; // PRI, PRIV
		user_defined_text?: string; // TXX, TXXX
		user_defined_url_link_frame?: string; // WXX, WXXX

		TRACKID?: string;

		asin?: string; // TXXX with id===ASIN
		catalognumber?: string; // TXXX with id===CATALOGNUMBER
		script?: string; // TXXX with id===SCRIPT
		barcode?: string; // TXXX with id===BARCODE
		originalyear?: string; // TXXX with id===originalyear
		replaygain_track_gain?: string; // TXXX with id===replaygain_track_gain
		replaygain_album_gain?: string; // TXXX with id===replaygain_album_gain
		replaygain_track_peak?: string; // TXXX with id===replaygain_track_peak
		replaygain_album_peak?: string; // TXXX with id===replaygain_album_peak
		artists?: string; // TXXX with id===Artists
		ACOUSTID?: string; // TXXX with id===Acoustid Id
		ALBUMTYPE?: string; // TXXX with id===MusicBrainz Album Type
		ALBUMARTISTID?: string; // TXXX with id===MusicBrainz Album Artist Id
		ARTISTID?: string; // TXXX with id===MusicBrainz Artist Id
		ALBUMID?: string; // TXXX with id===MusicBrainz Album Id
		RELEASETRACKID?: string; // TXXX with id===MusicBrainz Release Track Id
		RELEASEGROUPID?: string; // TXXX with id===MusicBrainz Release Group Id
		RECORDINGID?: string; // TXXX with id===MusicBrainz Recording Id
		ALBUMSTATUS?: string; // TXXX with id===MusicBrainz Album Status
		RELEASECOUNTRY?: string; // TXXX with id===MusicBrainz Album Release Country
		TRMID?: string; // TXXX with id===MusicBrainz TRM Id
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

