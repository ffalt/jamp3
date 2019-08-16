import {DataReader, MemoryWriterStream, WriterStream} from '../common/streams';
import {BufferUtils} from '../common/buffer';
import {ID3v2_FRAME_HEADER_LENGTHS} from './id3v2_consts';
import {ID3v2Reader} from './id3v2_reader';
import {buildID3v2} from './id3v2';
import * as zlib from 'zlib';
import {Id3v2RawWriter} from './id3v2_writer';
import {
	FrameAENC, FrameAsciiValue, FrameCHAP, FrameCTOC, FrameETCO, FrameGEOB, FrameIdAscii, FrameIdBin, FrameIdText,
	FrameLangDescText, FrameLangText, FrameLINK, FrameMusicCDId, FramePartOfCompilation, FramePCST,
	FramePic, FramePlayCounter, FramePopularimeter, FrameRelativeVolumeAdjustment, FrameRelativeVolumeAdjustment2, FrameRGAD, FrameSYLT, FrameText, FrameTextConcatList, FrameTextList, FrameUnknown, IFrameImpl
} from './id3v2_frame';
import {IID3V2} from './id3v2__types';
import {IEncoding} from '../common/encodings';
import {ITagID} from '../..';

interface IFrameDef {
	title: string;
	impl: IFrameImpl;
	versions: Array<number>;
	upgrade?: string;
	upgradeValue?: (value: any) => IID3V2.FrameValue.Base | undefined;
}

interface IFrameMatch {
	match: (id: string) => boolean;
	matchBin: (id: Buffer) => boolean;
	value: IFrameDef;
}

function validCharKeyCode(c: number): boolean {
	// /0-9 A-Z/
	return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}

const Matcher: Array<IFrameMatch> = [
	{
		/*
		 The text information frames are the most important frames, containing information like artist, album and more.
		 There may only be one text information frame of its kind in an tag. If the textstring is followed by a termination ($00 (00))
		 all the following information should be ignored and not be displayed. All text frame identifiers begin with "T".
		 Only text frame identifiers begin with "T", with the exception of the "TXXX" frame. All the text information frames have the following format:
		 <Header for 'Text information frame', ID: "T000" - "TZZZ", excluding "TXXX" described in 4.2.2.>
		 Text encoding    $xx
		 Information    <text string according to encoding>
		 */
		match: (id: string): boolean => {
			return id[0] === 'T' && id !== 'TXX' && id !== 'TXXX';
		},
		matchBin: (id: Buffer): boolean => {
			if (id[0] !== 84) {
				return false;
			}
			let allX = true;
			for (let i = 1; i < id.length; i++) {
				if (!validCharKeyCode(id[i])) {
					return false;
				}
				allX = allX && (id[i] === 88);
			}
			return !allX;
		},
		value: {
			title: 'Unknown Text Field',
			versions: [3, 4],
			impl:
			FrameText
		}
	},
	{
		/*
		 <Header for 'URL link frame', ID: "W000" - "WZZZ", excluding "WXXX" described in 4.3.2.>
		 URL <text string>
		 */
		match: (id: string): boolean => {
			return (id[0] === 'W' && id !== 'WXX' && id !== 'WXXX');
		}
		,
		matchBin: (id: Buffer): boolean => {
			if (id[0] !== 87) {
				return false;
			}
			let allX = true;
			for (let i = 1; i < id.length; i++) {
				if (!validCharKeyCode(id[i])) {
					return false;
				}
				allX = allX && (id[i] === 88);
			}
			return !allX;
		},
		value: {
			title: 'Unknown URL Field',
			versions: [3, 4],
			impl:
			FrameAsciiValue,
		}
	}
];

export const FrameDefs: { [id: string]: IFrameDef } = {
	// Other 2
	'UFI': {
		title: 'Unique file identifier',
		versions: [2],
		impl: FrameIdAscii,
		upgrade: 'UFID'
	},
	'TOT': {
		/**
		 Original album/Movie/Show title
		 */
		title: 'Original album/Movie/Show title',
		versions: [2],
		impl: FrameText,
		upgrade: 'TOAL'
	},
	'CDM': {
		/**
		 ID3v2.2.1 Compressed Data Metaframe
		 */
		title: 'Compressed Data Metaframe',
		versions: [2],
		impl: FrameUnknown
	},
	'CRM': {
		/**
		 4.20.   Encrypted meta frame

		 This frame contains one or more encrypted frames. This enables
		 protection of copyrighted information such as pictures and text, that
		 people might want to pay extra for. Since standardisation of such an
		 encryption scheme is beyond this document, all "CRM" frames begin with
		 a terminated string with a URL [URL] containing an email address, or a
		 link to a location where an email adress can be found, that belongs to
		 the organisation responsible for this specific encrypted meta frame.

		 Questions regarding the encrypted frame should be sent to the
		 indicated email address. If a $00 is found directly after the 'Frame
		 size', the whole frame should be ignored, and preferably be removed.
		 The 'Owner identifier' is then followed by a short content description
		 and explanation as to why it's encrypted. After the
		 'content/explanation' description, the actual encrypted block follows.

		 When an ID3v2 decoder encounters a "CRM" frame, it should send the
		 datablock to the 'plugin' with the corresponding 'owner identifier'
		 and expect to receive either a datablock with one or several ID3v2
		 frames after each other or an error. There may be more than one "CRM"
		 frames in a tag, but only one with the same 'owner identifier'.

		 Encrypted meta frame  "CRM"
		 Frame size            $xx xx xx
		 Owner identifier      <textstring> $00 (00)
		 Content/explanation   <textstring> $00 (00)
		 Encrypted datablock   <binary data>
		 */
		title: 'Encrypted meta',
		versions: [2],
		impl: FrameUnknown
	},
	'TT1': {
		title: 'Content group description',
		versions: [2],
		impl: FrameText,
		upgrade: 'TIT1'
	},
	'TT2': {
		title: 'Title',
		versions: [2],
		impl: FrameText,
		upgrade: 'TIT2'
	},
	'TT3': {
		title: 'Subtitle',
		versions: [2],
		impl: FrameText,
		upgrade: 'TIT3'
	},
	'TP1': {
		title: 'Artist',
		versions: [2],
		impl: FrameTextConcatList,
		upgrade: 'TPE1'
	},
	'TP2': {
		title: 'Band',
		versions: [2],
		impl: FrameText,
		upgrade: 'TPE2'
	},
	'TP3': {
		title: 'Conductor',
		versions: [2],
		impl: FrameText,
		upgrade: 'TPE3'
	},
	'TP4': {
		title: 'Interpreted, remixed, or otherwise modified by',
		versions: [2],
		impl: FrameText,
		upgrade: 'TPE4'
	},
	'TCM': {
		title: 'Composer',
		versions: [2],
		impl: FrameText,
		upgrade: 'TCOM'
	},
	'TXT': {
		title: 'Lyricist',
		versions: [2],
		impl: FrameText,
		upgrade: 'TEXT'
	},
	'TLA': {
		title: 'Languages',
		versions: [2],
		impl: FrameText,
		upgrade: 'TLAN'
	},
	'TCO': {
		title: 'Genre',
		versions: [2],
		impl: FrameTextConcatList,
		upgrade: 'TCON'
	},
	'TAL': {
		title: 'Album',
		versions: [2],
		impl: FrameText,
		upgrade: 'TALB'
	},
	'TPA': {
		title: 'Part of a set',
		versions: [2],
		impl: FrameText,
		upgrade: 'TPOS'
	},
	'TRK': {
		title: 'Track number',
		versions: [2],
		impl: FrameText,
		upgrade: 'TRCK'
	},
	'TRC': {
		title: 'ISRC (international standard recording code)',
		versions: [2],
		impl: FrameText,
		upgrade: 'TSRC'
	},
	'TYE': {
		title: 'Year',
		versions: [2],
		impl: FrameText,
		upgrade: 'TYER'
	},
	'TDA': {
		title: 'Date',
		versions: [2],
		impl: FrameText,
		upgrade: 'TDAT'
	},
	'TIM': {
		title: 'Time',
		versions: [2],
		impl: FrameText,
		upgrade: 'TIME'
	},
	'TRD': {
		title: 'Recording dates',
		versions: [2],
		impl: FrameText,
		upgrade: 'TRDA'
	},
	'TMT': {
		title: 'Media type',
		versions: [2],
		impl: FrameText,
		upgrade: 'TMED'
	},
	'TBP': {
		title: 'BPM',
		versions: [2],
		impl: FrameText,
		upgrade: 'TBPM'
	},
	'TCR': {
		title: 'Copyright message',
		versions: [2],
		impl: FrameText,
		upgrade: 'TCOP'
	},
	'TPB': {
		title: 'Publisher',
		versions: [2],
		impl: FrameText,
		upgrade: 'TPUB'
	},
	'TEN': {
		title: 'Encoded by',
		versions: [2],
		impl: FrameText,
		upgrade: 'TENC'
	},
	'TSS': {
		title: 'Encoding Software/Hardware',
		versions: [2],
		impl: FrameText,
		upgrade: 'TSSE'
	},
	'TOF': {
		title: 'Original filename',
		versions: [2],
		impl: FrameText,
		upgrade: 'TOFN'
	},
	'TLE': {
		title: 'Length',
		versions: [2],
		impl: FrameText,
		upgrade: 'TLEN'
	},
	'TSI': {
		title: 'Size',
		versions: [2],
		impl: FrameText,
		upgrade: 'TSIZ'
	},
	'TDY': {
		title: 'Playlist delay',
		versions: [2],
		impl: FrameText,
		upgrade: 'TDLY'
	},
	'TKE': {
		title: 'Initial key',
		versions: [2],
		impl: FrameText,
		upgrade: 'TKEY'
	},
	'TOL': {
		title: 'Original lyricist',
		versions: [2],
		impl: FrameText,
		upgrade: 'TOLY'
	},
	'TOA': {
		title: 'Original artist',
		versions: [2],
		impl: FrameText,
		upgrade: 'TOPE'
	},
	'TOR': {
		title: 'Original release year',
		versions: [2],
		impl: FrameText,
		upgrade: 'TORY'
	},
	'TXX': {
		title: 'User defined text',
		versions: [2],
		impl: FrameIdText,
		upgrade: 'TXXX'
	},
	'WAF': {
		title: 'Official audio file webpage',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WOAF'
	},
	'WAR': {
		title: 'Official artist/performer webpage',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WOAR'
	},
	'WAS': {
		title: 'Official audio source webpage',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WOAS'
	},
	'WCM': {
		title: 'Commercial information',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WCOM'
	},
	'WCP': {
		title: 'Copyright/Legal information',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WCOP'
	},
	'WPB': {
		title: 'Publishers official webpage',
		versions: [2],
		impl: FrameAsciiValue,
		upgrade: 'WPUB'
	},
	'WXX': {
		title: 'User defined URL link frame',
		versions: [2],
		impl: FrameIdText,
		upgrade: 'WXXX'
	},
	'IPL': {
		title: 'Involved people list',
		versions: [2],
		impl: FrameTextList,
		upgrade: 'IPLS'
	},
	'ETC': {
		title: 'Event timing codes',
		versions: [2],
		impl: FrameETCO,
		upgrade: 'ETCO'
	},
	'MLL': {
		title: 'MPEG location lookup table',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'MLLT'
	},
	'STC': {
		title: 'Synchronised tempo codes',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'SYTC'
	},
	'ULT': {
		title: 'Unsychronized lyric/text transcription',
		versions: [2],
		impl: FrameLangDescText,
		upgrade: 'USLT'
	},
	'SLT': {
		title: 'Synchronised lyrics/text',
		versions: [2],
		impl: FrameSYLT,
		upgrade: 'SYLT'
	},
	'COM': {
		title: 'Comments',
		versions: [2],
		impl: FrameLangDescText,
		upgrade: 'COMM'
	},
	'RVA': {
		title: 'Relative volume adjustment',
		versions: [2],
		impl: FrameRelativeVolumeAdjustment,
		upgrade: 'RVAD'
	},
	'EQU': {
		title: 'Equalisation',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'EQUA'
	},
	'REV': {
		title: 'Reverb',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'RVRB'
	},
	'PIC': {
		title: 'Attached picture',
		versions: [2],
		impl: FramePic,
		upgrade: 'APIC'
	},
	'GEO': {
		title: 'General encapsulated object',
		versions: [2],
		impl: FrameGEOB,
		upgrade: 'GEOB'
	},
	'CNT': {
		title: 'Play counter',
		versions: [2],
		impl: FramePlayCounter,
		upgrade: 'PCNT'
	},
	'POP': {
		title: 'Popularimeter',
		versions: [2],
		impl: FramePopularimeter,
		upgrade: 'POPM'
	},
	'BUF': {
		title: 'Recommended buffer size',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'RBUF'
	},
	'CRA': {
		title: 'Audio encryption',
		versions: [2],
		impl: FrameAENC,
		upgrade: 'AENC'
	},
	'LNK': {
		title: 'Linked information',
		versions: [2],
		impl: FrameLINK,
		upgrade: 'LINK'
	},
	'NCO': {
		title: 'MusicMatch Binary',
		versions: [2],
		impl: FrameUnknown,
		upgrade: 'NCON'
	},
	'PRI': {
		title: 'Private frame',
		versions: [2],
		impl: FrameIdBin,
		upgrade: 'PRIV'
	},
	'TCP': {
		title: 'iTunes Compilation Flag',
		versions: [2],
		impl: FramePartOfCompilation,
		upgrade: 'TCMP'
	},
	'TST': {
		title: 'Title sort order',
		versions: [2],
		impl: FrameText,
		upgrade: 'XSOT'
	},
	'TSP': {
		title: 'Performer sort order',
		versions: [2],
		impl: FrameText,
		upgrade: 'XSOP'
	},
	'TSA': {
		title: 'Album sort order',
		versions: [2],
		impl: FrameText,
		upgrade: 'XSOA'
	},
	'TS2': {
		title: 'Album Artist sort order',
		versions: [2],
		impl: FrameText,
		upgrade: 'TSO2'
	},
	'TSC': {
		title: 'Composer sort order',
		versions: [2],
		impl: FrameText,
		upgrade: 'TSOC'
	},
	'TDR': {
		title: 'Release time',
		versions: [2],
		impl: FrameText,
		upgrade: 'TDRL'
	},
	'TDS': {
		title: 'iTunes podcast description',
		versions: [2],
		impl: FrameText,
		upgrade: 'TDES'
	},
	'TID': {
		title: 'Podcast URL',
		versions: [2],
		impl: FrameText,
		upgrade: 'TGID'
	},
	'WFD': {
		title: 'Podcast feed URL',
		versions: [2],
		impl: FrameText,
		upgrade: 'WFED'
	},
	'PCS': {
		title: 'iTunes podcast marker',
		versions: [2],
		impl: FramePCST,
		upgrade: 'PCST'
	},

	// Other 3

	'XSOA': {
		title: 'Album sort order',
		versions: [3],
		impl: FrameText,
		upgrade: 'TSOA'
	},
	'XSOP': {
		title: 'Performer sort order',
		versions: [3],
		impl: FrameText,
		upgrade: 'TSOP'
	},
	'XSOT': {
		title: 'Title sort order',
		versions: [3],
		impl: FrameText,
		upgrade: 'TSOT'
	},
	'XDOR': {
		title: 'Original release time',
		versions: [3],
		impl: FrameText,
		upgrade: 'TDOR'
	},

	// Text based 3 & 4
	/*
	 */
	// -Identification frames
	'TIT1': {
		/*
		 The 'Content group description' frame is used if the sound belongs to a larger category of sounds/music. For example, classical music is often sorted in different musical sections (e.g. "Piano Concerto", "Weather - Hurricane").
		 */
		title: 'Content group description',
		versions: [3, 4],
		impl: FrameText
	},
	'TIT2': {
		/*
		 The 'Title/Songname/Content description' frame is the actual name of
		 the piece (e.g. "Adagio", "Hurricane Donna").
		 */
		title: 'Title',
		versions: [3, 4],
		impl: FrameText
	},
	'TIT3': {
		/*
		 The 'Subtitle/Description refinement' frame is used for information directly related to the contents title (e.g. "Op. 16" or "Performed live at Wembley").
		 */
		title: 'Subtitle',
		versions: [3, 4],
		impl: FrameText
	},
	'TALB': {
		/*
		 The 'Album/Movie/Show title' frame is intended for the title of the
		 recording (or source of sound) from which the audio in the file is
		 taken.
		 */
		title: 'Album',
		versions: [3, 4],
		impl: FrameText
	},
	'TOAL': {
		/*
		 The 'Original album/movie/show title' frame is intended for the title of the original recording (or source of sound), if for example the music in the file should be a cover of a previously released song.
		 */
		title: 'Original album',
		versions: [3, 4],
		impl: FrameText
	},
	'TRCK': {
		/*
		 The 'Track number/Position in set' frame is a numeric string
		 containing the order number of the audio-file on its original
		 recording. This MAY be extended with a "/" character and a numeric
		 string containing the total number of tracks/elements on the original
		 recording. E.g. "4/9".
		 */
		title: 'Track number',
		versions: [3, 4],
		impl: FrameText
	},
	'TPOS': {
		/*
		 The 'Part of a set' frame is a numeric string that describes which
		 part of a set the audio came from. This frame is used if the source
		 described in the "TALB" frame is divided into several mediums, e.g. a
		 double CD. The value MAY be extended with a "/" character and a
		 numeric string containing the total number of parts in the set. E.g.
		 "1/2".
		 */
		title: 'Part of a set',
		versions: [3, 4],
		impl: FrameText
	},
	'TSRC': {
		/*
		 The 'ISRC' frame should contain the International Standard Recording Code (ISRC) (12 characters).
		 */
		title: 'ISRC (international standard recording code)',
		versions: [3, 4],
		impl: FrameText
	},
	'TSST': {
		/*
		  The 'Set subtitle' frame is intended for the subtitle of the part of a set this track belongs to.
        */
		title: 'Set subtitle',
		versions: [3, 4],
		impl: FrameText
	},
	// -Involved persons frames
	'TPE1': {
		/*
		 The 'Lead artist/Lead performer/Soloist/Performing group' is
		 used for the main artist.
		 */
		title: 'Artist',
		versions: [3, 4],
		impl: FrameTextConcatList
	},
	'TPE2': {
		/*
		 The 'Band/Orchestra/Accompaniment' frame is used for additional information about the performers in the recording.
		 */
		title: 'Band',
		versions: [3, 4],
		impl: FrameText
	},
	'TPE3': {
		/*
		 The 'Conductor' frame is used for the name of the conductor.
		 */
		title: 'Conductor',
		versions: [3, 4],
		impl: FrameText
	},
	'TPE4': {
		/*
		 The 'Interpreted, remixed, or otherwise modified by' frame contains more information about the people behind a remix and similar interpretations of another existing piece.
		 */
		title: 'Interpreted, remixed, or otherwise modified by',
		versions: [3, 4],
		impl: FrameText
	},
	'TOPE': {
		/*
		 The 'Original artist(s)/performer(s)' frame is intended for the performer(s) of the original recording, if for example the music in the file should be a cover of a previously released song. The performers are seperated with the "/" character.
		 */
		title: 'Original artist',
		versions: [3, 4],
		impl: FrameText
	},
	'TEXT': {
		/*
		 The 'Lyricist(s)/Text writer(s)' frame is intended for the writer(s) of the text or lyrics in the recording. They are seperated with the "/" character.
		 */
		title: 'Lyricist',
		versions: [3, 4],
		impl: FrameText
	},
	'TOLY': {
		/*
		 The 'Original lyricist(s)/text writer(s)' frame is intended for the text writer(s) of the original recording, if for example the music in the file should be a cover of a previously released song. The text writers are seperated with the "/" character.
		 */
		title: 'Original lyricist',
		versions: [3, 4],
		impl: FrameText
	},
	'TCOM': {
		/*
		 The 'Composer(s)' frame is intended for the name of the composer(s). They are seperated with the "/" character.
		 */
		title: 'Composer',
		versions: [3, 4],
		impl: FrameText
	},
	'TENC': {
		/*
		 The 'Encoded by' frame contains the name of the person or organisation that encoded the audio file. This field may contain a copyright message, if the audio file also is copyrighted by the encoder.
		 */
		title: 'Encoded by',
		versions: [3, 4],
		impl: FrameText
	},
	// -Derived and subjective properties frames
	'TBPM': {
		/*
		 The 'BPM' frame contains the number of beats per minute in the mainpart of the audio. The BPM is an integer and represented as a numerical string.
		 */
		title: 'BPM',
		versions: [3, 4],
		impl: FrameText
	},
	'TLEN': {
		/*
		 The 'Length' frame contains the length of the audiofile in milliseconds, represented as a numeric string.
		 */
		title: 'Length',
		versions: [3, 4],
		impl: FrameText
	},
	'TKEY': {
		/*
		 The 'Initial key' frame contains the musical key in which the sound starts. It is represented as a string with a maximum length of three characters. The ground keys are represented with "A","B","C","D","E", "F" and "G" and halfkeys represented with "b" and "#". Minor is represented as "m". Example "Cbm". Off key is represented with an "o" only.
		 */
		title: 'Initial key',
		versions: [3, 4],
		impl: FrameText
	},
	'TLAN': {
		/*
		 The 'Language(s)' frame should contain the languages of the text or lyrics spoken or sung in the audio. The language is represented with three characters according to ISO-639-2. If more than one language is used in the text their language codes should follow according to their usage.
		 */
		title: 'Languages',
		versions: [3, 4],
		impl: FrameText
	},
	'TCON': {
		/*
		 The 'Content type', which ID3v1 was stored as a one byte numeric
		 value only, is now a string. You may use one or several of the ID3v1
		 types as numerical strings, or, since the category list would be
		 impossible to maintain with accurate and up to date categories,
		 define your own. Example: "21" $00 "Eurodisco" $00

		 You may also use any of the following keywords:

		 RX  Remix
		 CR  Cover
		 */
		title: 'Genre',
		versions: [3, 4],
		impl: FrameTextConcatList
	},
	'TFLT': {
		/*
		 The 'File type' frame indicates which type of audio this tag defines. The following type and refinements are defined:
		 MPG       MPEG Audio
		 /1        MPEG 1/2 layer I
		 /2        MPEG 1/2 layer II
		 /3        MPEG 1/2 layer III
		 /2.5      MPEG 2.5
		 /AAC     Advanced audio compression
		 VQF       Transform-domain Weighted Interleave Vector Quantization
		 PCM       Pulse Code Modulated audio
		 */
		title: 'File type',
		versions: [3, 4],
		impl: FrameText
	},
	'TMED': {
		/*
		 The 'Media type' frame describes from which media the sound originated. This may be a text string or a reference to the predefined media types found in the list below.
		 References are made within "(" and ")" and are optionally followed by a text refinement, e.g. "(MC) with four channels". If a text refinement should begin with a "(" character
		  it should be replaced with "((" in the same way as in the "TCO" frame. Predefined refinements is appended after the media type, e.g. "(CD/A)" or "(VID/PAL/VHS)".
		 DIG     Other digital media
		 /A  Analog transfer from media

		 ANA     Other analog media
		 /WAC Wax cylinder
		 /8CA 8-track tape cassette

		 CD      CD
		 /A Analog transfer from media
		 /DD DDD
		 /AD ADD
		 /AA AAD

		 LD      Laserdisc
		 /A Analog transfer from media

		 TT      Turntable records
		 /33 33.33 rpm
		 /45 45 rpm
		 /71 71.29 rpm
		 /76 76.59 rpm
		 /78 78.26 rpm
		 /80 80 rpm

		 MD      MiniDisc
		 /A Analog transfer from media

		 DAT     DAT
		 /A Analog transfer from media
		 /1 standard, 48 kHz/16 bits, linear
		 /2 mode 2, 32 kHz/16 bits, linear
		 /3 mode 3, 32 kHz/12 bits, nonlinear, low speed
		 /4 mode 4, 32 kHz/12 bits, 4 channels
		 /5 mode 5, 44.1 kHz/16 bits, linear
		 /6 mode 6, 44.1 kHz/16 bits, 'wide track' play

		 DCC     DCC
		 /A Analog transfer from media

		 DVD     DVD
		 /A Analog transfer from media

		 TV      Television
		 /PAL PAL
		 /NTSC NTSC
		 /SECAM SECAM

		 VID     Video
		 /PAL PAL
		 /NTSC NTSC
		 /SECAM SECAM
		 /VHS VHS
		 /SVHS S-VHS
		 /BETA BETAMAX

		 RAD     Radio
		 /FM FM
		 /AM AM
		 /LW LW
		 /MW MW

		 TEL     Telephone
		 /I ISDN

		 MC      MC (normal cassette)
		 /4 4.75 cm/s (normal speed for a two sided cassette)
		 /9 9.5 cm/s
		 /I Type I cassette (ferric/normal)
		 /II Type II cassette (chrome)
		 /III Type III cassette (ferric chrome)
		 /IV Type IV cassette (metal)

		 REE     Reel
		 /9 9.5 cm/s
		 /19 19 cm/s
		 /38 38 cm/s
		 /76 76 cm/s
		 /I Type I cassette (ferric/normal)
		 /II Type II cassette (chrome)
		 /III Type III cassette (ferric chrome)
		 /IV Type IV cassette (metal)
		 */
		title: 'Media type',
		versions: [3, 4],
		impl: FrameText
	},
	// -Rights and license frames
	'TCOP': {
		/*
		 The 'Copyright message' frame, which must begin with a year and a space character (making five characters), is intended for the copyright holder of the original sound,
		  not the audio file itself. The absence of this frame means only that the copyright information is unavailable or has been removed, and must not be interpreted to mean that the sound is public domain.
		  Every time this field is displayed the field must be preceded with "Copyright © ".
		 */
		title: 'Copyright message',
		versions: [3, 4],
		impl: FrameText
	},
	'TPUB': {
		/*
		 The 'Lead artist/Lead performer/Soloist/Performing group' is
		 used for the main artist.
		 */
		title: 'Publisher',
		versions: [3, 4],
		impl: FrameText
	},
	'TOWN': {
		/*
		 The 'File owner/licensee' frame contains the name of the owner or licensee of the file and it's contents.
		 */
		title: 'File owner',
		versions: [3, 4],
		impl: FrameText
	},
	'TRSN': {
		/*
		 The 'Internet radio station name' frame contains the name of the internet radio station from which the audio is streamed.
		 */
		title: 'Internet radio station name',
		versions: [3, 4],
		impl: FrameText
	},
	'TRSO': {
		/*
		 The 'Internet radio station owner' frame contains the name of the owner of the internet radio station from which the audio is streamed.
		 */
		title: 'Internet radio station owner',
		versions: [3, 4],
		impl: FrameText
	},
	// -Other text frames
	'TOFN': {
		/*
		 The 'Original filename' frame contains the preferred filename for the file, since some media doesn't allow the desired length of the filename. The filename is case sensitive and includes its suffix.
		 */
		title: 'Original filename',
		versions: [3, 4],
		impl: FrameText
	},
	'TDLY': {
		/*
		 The 'Playlist delay' defines the numbers of milliseconds of silence between every song in a playlist. The player should use the "ETC" frame, if present, to skip initial silence and silence at the end of the audio to match the 'Playlist delay' time. The time is represented as a numeric string.
		 */
		title: 'Playlist delay',
		versions: [3, 4],
		impl: FrameText
	},
	'TDEN': {
		/*
		  The 'Encoding time' frame contains a timestamp describing when the audio was encoded.
		*/
		title: 'Encoding Time',
		versions: [3, 4],
		impl: FrameText
	},
	'TSSE': {
		/*
		 The 'Software/Hardware and settings used for encoding' frame includes the used audio encoder and its settings when the file was encoded. Hardware refers to hardware encoders, not the computer on which a program was run.
		 */
		versions: [3, 4],
		title: 'Encoding Software/Hardware',
		impl: FrameText
	},

	// Text based 3
	/*

	 */
	'TDAT': {
		/*
		 The 'Date' frame is a numeric string in the DDMM format containing the date for the recording. This field is always four characters long.
		 */
		title: 'Date',
		versions: [3],
		impl: FrameText
	},
	'TIME': {
		/*
		 The 'Time' frame is a numeric string in the HHMM format containing the time for the recording. This field is always four characters long.
		 */
		title: 'Time',
		versions: [3],
		impl: FrameText
	},
	'TORY': {
		/*
		 The 'Original release year' frame is intended for the year when the original recording, if for example the music in the file should be a cover of a previously released song, was released. The field is formatted as in the "TYER" frame.
		 */
		title: 'Original release year',
		versions: [3],
		impl: FrameText
	},
	'TRDA': {
		/*
		 The 'Recording dates' frame is a intended to be used as complement to the "TYER", "TDAT" and "TIME" frames. E.g. "4th-7th June, 12th June" in combination with the "TYER" frame.
		 */
		title: 'Recording dates',
		versions: [3],
		impl: FrameText
	},
	'TSIZ': {
		/*
		 The 'Size' frame contains the size of the audiofile in bytes, excluding the ID3v2 tag, represented as a numeric string.
		 */
		title: 'Size',
		versions: [3],
		impl: FrameText
	},
	'TYER': {
		/*
		 The 'Recording time' frame contains a timestamp describing when the
		 audio was recorded. Timestamp format is described in the ID3v2
		 structure document [ID3v2-strct].
		 */
		title: 'Year',
		versions: [3],
		impl: FrameText
	},

	// Text based 4
	/*

	 */
	// - Involved persons frames
	'TMCL': {
		/*
		 The 'Musician credits list' is intended as a mapping between instruments and the musician that played it. Every odd field is an instrument and every even is an artist or a comma delimited list of artists.
		 */
		versions: [4],
		title: 'Musician credits list',
		impl: FrameTextList
	},
	'TIPL': {
		/*
		 The 'Involved people list' is very similar to the musician credits list, but maps between functions, like producer, and names.
		 */
		versions: [4],
		title: 'Involved people list',
		impl: FrameTextList
	},
	// -Derived and subjective properties frames
	'TMOO': {
		/*
		 The 'Mood' frame is intended to reflect the mood of the audio with a few keywords, e.g. "Romantic" or "Sad".
		 */
		title: 'Mood',
		versions: [4],
		impl: FrameText
	},
	// -Rights and license frames
	'TPRO': {
		/*
		 The 'Produced notice' frame, in which the string must begin with a year and a space character (making five characters),
		 is intended for the production copyright holder of the original sound, not the audio file itself. The absence of this frame means only that the production copyright information is
		  unavailable or has been removed, and must not be interpreted to mean that the audio is public domain. Every time this field is displayed the field must be preceded with "Produced " (P) " ",
		   where (P) is one character showing a P in a circle.
		 */
		title: 'Produced notice',
		versions: [4],
		impl: FrameText
	},
	// -Other text frames
	'TDOR': {
		/*
		 The 'Original release time' frame contains a timestamp describing when the original recording of the audio was released. Timestamp format is described in the ID3v2 structure document [ID3v2-strct].
		 */
		title: 'Original release time',
		versions: [4],
		impl: FrameText
	},
	'TDRC': {
		/*
		 The 'Recording time' frame contains a timestamp describing when the
		 audio was recorded. Timestamp format is described in the ID3v2
		 structure document [ID3v2-strct].
		 */
		versions: [4],
		title: 'Recording time',
		impl: FrameText
	},
	'TDRL': {
		/*
		 The 'Release time' frame contains a timestamp describing when the audio was first released. Timestamp format is described in the ID3v2 structure document [ID3v2-strct].
		 */
		versions: [3, 4],
		title: 'Release time',
		impl: FrameText
	},
	'TDTG': {
		/*
		 The 'Tagging time' frame contains a timestamp describing then the audio was tagged. Timestamp format is described in the ID3v2  structure document [ID3v2-strct].
		 */
		versions: [4],
		title: 'Tagging time',
		impl: FrameText
	},
	'TSOA': {
		/*
		 The 'Album sort order' frame defines a string which should be used instead of the album name (TALB) for sorting purposes. E.g. an album named "A Soundtrack" might preferably be sorted as "Soundtrack".
		 */
		versions: [4],
		title: 'Album sort order',
		impl: FrameText
	},
	'TSOP': {
		/*
		 The 'Performer sort order' frame defines a string which should be used instead of the performer (TPE2) for sorting purposes.
		 */
		versions: [4],
		title: 'Performer sort order',
		impl: FrameText
	},
	'TSOT': {
		/*
		 The 'Title sort order' frame defines a string which should be used instead of the title (TIT2) for sorting purposes.
		 */
		versions: [4],
		title: 'Title sort order',
		impl: FrameText
	},

	// URL based 3 & 4
	/*
	 With these frames dynamic data such as webpages with touring information, price information or plain ordinary news can be added to the tag.
	 There may only be one URL link frame of its kind in an tag, except when stated otherwise in the frame description. If the textstring is followed by a termination ($00 (00))
	 all the following information should be ignored and not be displayed. All URL link frame identifiers begins with "W". Only URL link frame identifiers begins with "W". All URL link
	 frames have the following format:
	 <Header for 'URL link frame', ID: "W000" - "WZZZ", excluding "WXXX" described in 4.3.2.>
	 URL <text string>
	 */
	'WCOM': {
		/*
		 */
		title: 'Commercial information',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WCOP': {
		/*
		 The 'Copyright/Legal information' frame is a URL pointing at a webpage where the terms of use and ownership of the file is described.
		 */
		title: 'Copyright/Legal information',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WOAF': {
		/*
		 The 'Official audio file webpage' frame is a URL pointing at a file specific webpage.
		 */
		title: 'Official audio file webpage',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WOAR': {
		/*
		 The 'Official artist/performer webpage' frame is a URL pointing at the artists official webpage. There may be more than one "WOAR" frame in a tag if the audio contains more than one performer, but not with the same content.
		 */
		title: 'Official artist/performer webpage',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WOAS': {
		/*
		 The 'Official audio source webpage' frame is a URL pointing at the official webpage for the source of the audio file, e.g. a movie.
		 */
		title: 'Official audio source webpage',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WORS': {
		/*
		 The 'Official internet radio station homepage' contains a URL pointing at the homepage of the internet radio station.
		 */
		title: 'Official internet radio station homepage',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WPAY': {
		/*
		 The 'Payment' frame is a URL pointing at a webpage that will handle the process of paying for this file.
		 */
		title: 'Payment URL',
		versions: [3, 4],
		impl: FrameAsciiValue
	},
	'WPUB': {
		/*
		 The 'Publishers official webpage' frame is a URL pointing at the official wepage for the publisher.
		 */
		title: 'Publishers official webpage',
		versions: [3, 4],
		impl: FrameAsciiValue
	},

	// Other 3 & 4
	/*
	 */
	'TXXX': {
		/*
		 <Header for 'User defined text information frame', ID: "TXXX">
		 Text encoding    $xx
		 Description    <text string according to encoding> $00 (00)
		 Value    <text string according to encoding>
		 */
		title: 'User defined text',
		versions: [3, 4],
		impl: FrameIdText
	},
	'WXXX': {
		/*
		 <Header for 'User defined URL link frame', ID: "WXXX">
		 Text encoding     $xx
		 Description       <text string according to encoding> $00 (00)
		 URL               <text string>
		 */
		title: 'User defined URL link frame',
		versions: [3, 4],
		impl: FrameIdText
	},
	'UFID': {
		/*
		 <Header for 'Unique file identifier', ID: "UFID">
		 Owner identifier    <text string> $00
		 Identifier    <up to 64 bytes binary data>
		 */
		title: 'Unique file identifier',
		versions: [3, 4],
		impl: FrameIdAscii
	},
	'MCDI': {
		/*
		 This frame is intended for music that comes from a CD, so that the CD can be identified in databases such as the CDDB. The frame consists of a binary dump of the Table Of Contents,
		 TOC, from the CD, which is a header of 4 bytes and then 8 bytes/track on the CD plus 8 bytes for the 'lead out' making a maximum of 804 bytes. The offset to the
		 beginning of every track on the CD should be described with a four bytes absolute CD-frame address per track, and not with absolute time. This frame requires a present and
		 valid "TRCK" frame, even if the CD's only got one track. There may only be one "MCDI" frame in each tag.

		 <Header for 'Music CD identifier', ID: "MCDI">
		 CD TOC <binary data>
		 */
		title: 'Music CD identifier',
		versions: [3, 4],
		impl: FrameMusicCDId
	},
	'ETCO': {
		title: 'Event timing codes',
		versions: [3, 4],
		impl: FrameETCO
	},
	'MLLT': {
		/*
		 To increase performance and accuracy of jumps within a MPEG audio file, frames with timecodes in different locations in the file might be useful.
		 The ID3v2 frame includes references that the software can use to calculate positions in the file. After the frame header is a descriptor of how much the 'frame counter'
		 should increase for every reference. If this value is two then the first reference points out the second frame, the 2nd reference the 4th frame, the 3rd reference
		 the 6th frame etc. In a similar way the 'bytes between reference' and 'milliseconds between reference' points out bytes and milliseconds respectively.

		 Each reference consists of two parts; a certain number of bits, as defined in 'bits for bytes deviation', that describes the difference between what is said
		  in 'bytes between reference' and the reality and a certain number of bits, as defined in 'bits for milliseconds deviation', that describes the difference
		   between what is said in 'milliseconds between reference' and the reality. The number of bits in every reference, i.e. 'bits for bytes deviation'+'bits
		   for milliseconds deviation', must be a multiple of four. There may only be one "MLLT" frame in each tag.

		 <Header for 'Location lookup table', ID: "MLLT">
		 MPEG frames between reference   $xx xx
		 Bytes between reference         $xx xx xx
		 Milliseconds between reference  $xx xx xx
		 Bits for bytes deviation        $xx
		 Bits for milliseconds dev.      $xx

		 Then for every reference the following data is included;

		 Deviation in bytes         %xxx....
		 Deviation in milliseconds  %xxx....

		 */
		title: 'MPEG location lookup table',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'SYTC': {
		/*
		 For a more accurate description of the tempo of a musical piece this frame might be used. After the header follows one byte describing which time stamp format should be used.
		 Then follows one or more tempo codes. Each tempo code consists of one tempo part and one time part. The tempo is in BPM described with one or two bytes.
		  If the first byte has the value $FF, one more byte follows, which is added to the first giving a range from 2 - 510 BPM, since $00 and $01 is reserved.
		  $00 is used to describe a beat-free time period, which is not the same as a music-free time period. $01 is used to indicate one single beat-stroke followed by a beat-free period.

		 The tempo descriptor is followed by a time stamp. Every time the tempo in the music changes, a tempo descriptor may indicate this for the player.
		 All tempo descriptors should be sorted in chronological order. The first beat-stroke in a time-period is at the same time as the beat description occurs.
		  There may only be one "SYTC" frame in each tag.

		 <Header for 'Synchronised tempo codes', ID: "SYTC">
		 Time stamp format    $xx
		 Tempo data           <binary data>

		 Where time stamp format is:

		 $01 Absolute time, 32 bit sized, using MPEG frames as unit
		 $02 Absolute time, 32 bit sized, using milliseconds as unit

		 Abolute time means that every stamp contains the time from the beginning of the file.
		 */
		title: 'Synchronised tempo codes',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'USLT': {
		/*
		 <Header for 'Unsynchronised lyrics/text transcription', ID: "USLT">
		 Text encoding       $xx
		 Language            $xx xx xx
		 Content descriptor  <text string according to encoding> $00 (00)
		 Lyrics/text         <full text string according to encoding>
		 */
		title: 'Unsychronized lyric/text transcription',
		versions: [3, 4],
		impl: FrameLangDescText
	},
	'SYLT': {
		title: 'Synchronised lyrics',
		versions: [3, 4],
		impl: FrameSYLT
	},
	'COMM': {
		/*
		 <Header for 'Comment', ID: "COMM">
		 Text encoding          $xx
		 Language               $xx xx xx
		 Short content descrip. <text string according to encoding> $00 (00)
		 The actual text        <full text string according to encoding>
		 */
		title: 'Comments',
		versions: [3, 4],
		impl: FrameLangDescText
	},
	'RVAD': {
		title: 'Relative volume adjustment',
		versions: [3, 4],
		impl: FrameRelativeVolumeAdjustment
	},
	'RVA2': {
		title: 'Relative volume adjustment 2',
		versions: [4],
		impl: FrameRelativeVolumeAdjustment2
	},
	'EQUA': {
		/*
		 This is another subjective, alignment frame. It allows the user to predefine an equalisation curve within the audio file. There may only be one "EQUA" frame in each tag.

		 <Header of 'Equalisation', ID: "EQUA">
		 Adjustment bits $xx

		 The 'adjustment bits' field defines the number of bits used for representation of the adjustment. This is normally $10 (16 bits) for MPEG 2 layer I, II and III and MPEG 2.5. This value may not be $00.

		 This is followed by 2 bytes + ('adjustment bits' rounded up to the nearest byte) for every equalisation band in the following format, giving a frequency range of 0 - 32767Hz:

		 Increment/decrement     %x (MSB of the Frequency)
		 Frequency               (lower 15 bits)
		 Adjustment              $xx (xx ...)

		 The increment/decrement bit is 1 for increment and 0 for decrement. The equalisation bands should be ordered increasingly with reference to frequency. All frequencies don't have to be declared.
		 The equalisation curve in the reading software should be interpolated between the values in this frame. Three equal adjustments for three subsequent frequencies.
		 A frequency should only be described once in the frame.
		 */
		title: 'Equalisation',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'RVRB': {
		/*
		 Yet another subjective one. You may here adjust echoes of different kinds. Reverb left/right is the delay between every bounce in ms.
		 Reverb bounces left/right is the number of bounces that should be made. $FF equals an infinite number of bounces. Feedback is the amount of volume that should be
		 returned to the next echo bounce. $00 is 0%, $FF is 100%. If this value were $7F, there would be 50% volume reduction on the first bounce, 50% of that on the second
		  and so on. Left to left means the sound from the left bounce to be played in the left speaker, while left to right means sound from the left bounce to be played in the right speaker.

		 'Premix left to right' is the amount of left sound to be mixed in the right before any reverb is applied, where $00 id 0% and $FF is 100%. 'Premix right to left'
		  does the same thing, but right to left. Setting both premix to $FF would result in a mono output (if the reverb is applied symmetric). There may only be one "RVRB" frame in each tag.

		 <Header for 'Reverb', ID: "RVRB">
		 Reverb left (ms)                $xx xx
		 Reverb right (ms)               $xx xx
		 Reverb bounces, left            $xx
		 Reverb bounces, right           $xx
		 Reverb feedback, left to left   $xx
		 Reverb feedback, left to right  $xx
		 Reverb feedback, right to right $xx
		 Reverb feedback, right to left  $xx
		 Premix left to right            $xx
		 Premix right to left            $xx
		 */
		title: 'Reverb',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'APIC': {
		/*
		 This frame contains a picture directly related to the audio file. Image format is the MIME type and subtype for the image. In the event that the MIME media type name is omitted,
		  "image/" will be implied. The "image/png" or "image/jpeg" picture format should be used when interoperability is wanted. Description is a short description of the picture,
		   represented as a terminated textstring. The description has a maximum length of 64 characters, but may be empty. There may be several pictures attached to one file,
		   each in their individual "APIC" frame, but only one with the same content descriptor. There may only be one picture with the picture type declared as picture type $01
		   and $02 respectively. There is the possibility to put only a link to the image file by using the 'MIME type' "-->" and having a complete URL instead of picture data.
		    The use of linked files should however be used sparingly since there is the risk of separation of files.
		 <Header for 'Attached picture', ID: "APIC">
		 Text encoding   $xx
		 MIME type       <text string> $00
		 Picture type    $xx
		 Description     <text string according to encoding> $00 (00)
		 Picture data    <binary data>
		 */
		title: 'Attached picture',
		versions: [3, 4],
		impl: FramePic
	},
	'GEOB': {
		title: 'General encapsulated object',
		versions: [3, 4],
		impl: FrameGEOB
	},
	'PCNT': {
		/*
		 This is simply a counter of the number of times a file has been played. The value is increased by one every time the file begins to play. There may only be one "PCNT" frame in each tag.
		  When the counter reaches all one's, one byte is inserted in front of the counter thus making the counter eight bits bigger. The counter must be at least 32-bits long to begin with.

		 <Header for 'Play counter', ID: "PCNT">
		 Counter         $xx xx xx xx (xx ...)
		 */
		title: 'Play counter',
		versions: [3, 4],
		impl: FramePlayCounter
	},
	'POPM': {
		/*
		 The purpose of this frame is to specify how good an audio file is.
		 Many interesting applications could be found to this frame such as a playlist
		 that features better audiofiles more often than others or it could be used to
		 profile a person's taste and find other 'good' files by comparing people's profiles.
		 The frame is very simple. It contains the email address to the user, one rating byte and a four byte play counter,
		 intended to be increased with one for every time the file is played. The email is a terminated string.
		 The rating is 1-255 where 1 is worst and 255 is best. 0 is unknown. If no personal counter is wanted it
		 may be omitted. When the counter reaches all one's, one byte is inserted in front of the counter thus making
		 the counter eight bits bigger in the same away as the play counter ("PCNT").
		 There may be more than one "POPM" frame in each tag, but only one with the same email address.

		 <Header for 'Popularimeter', ID: "POPM">
		 Email to user   <text string> $00
		 Rating          $xx
		 Counter         $xx xx xx xx (xx ...)
		 */
		title: 'Popularimeter',
		versions: [3, 4],
		impl: FramePopularimeter
	},
	'RBUF': {
		/*
		 Sometimes the server from which a audio file is streamed is aware of transmission or coding problems resulting in interruptions in the audio stream.
		 In these cases, the size of the buffer can be recommended by the server using this frame. If the 'embedded info flag' is true (1) then this indicates that an ID3 tag with
		  the maximum size described in 'Buffer size' may occur in the audiostream. In such case the tag should reside between two MPEG frames, if the audio is MPEG encoded.
		  If the position of the next tag is known, 'offset to next tag' may be used. The offset is calculated from the end of tag in which this frame resides to the first byte of the header
		   in the next. This field may be omitted. Embedded frames are generally not recommended since this could render unpredictable behaviour from present software/hardware.

		 For applications like streaming audio it might be an idea to embed frames into the audio stream though. If the clients connects to individual connections like HTTP and there is a possibility
		  to begin every transmission with a tag, then this tag should include a 'recommended buffer size' frame. If the client is connected to a arbitrary point in the stream, such as radio or multicast,
		   then the 'recommended buffer size' frame should be included in every tag. Every tag that is picked up after the initial/first tag is to be considered as an update of the previous one. E.g.
		   if there is a "TIT2" frame in the first received tag and one in the second tag, then the first should be 'replaced' with the second.

		 The 'Buffer size' should be kept to a minimum. There may only be one "RBUF" frame in each tag.

		 <Header for 'Recommended buffer size', ID: "RBUF">
		 Buffer size             $xx xx xx
		 Embedded info flag      %0000000x
		 Offset to next tag      $xx xx xx xx
		 */
		title: 'Recommended buffer size',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'AENC': {
		title: 'Audio encryption',
		versions: [3, 4],
		impl: FrameAENC
	},
	'LINK': {
		title: 'Linked information',
		versions: [3, 4],
		impl: FrameLINK
	},
	'POSS': {
		/*
		 This frame delivers information to the listener of how far into the audio stream he picked up; in effect, it states the time offset of the first frame in the stream. The frame layout is:

		 <Head for 'Position synchronisation', ID: "POSS">
		 Time stamp format   $xx
		 Position            $xx (xx ...)

		 Where time stamp format is:

		 $01 Absolute time, 32 bit sized, using MPEG frames as unit
		 $02 Absolute time, 32 bit sized, using milliseconds as unit

		 and position is where in the audio the listener starts to receive, i.e. the beginning of the next frame. If this frame is used in the beginning of a file the value is always 0.
		 There may only be one "POSS" frame in each tag.
		 */
		title: 'Position synchronisation',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'USER': {
		/*
		 This frame contains a brief description of the terms of use and ownership of the file. More detailed information concerning the legal terms might be available through the "WCOP" frame.
		 Newlines are allowed in the text. There may only be one "USER" frame in a tag.

		 <Header for 'Terms of use frame', ID: "USER">
		 Text encoding   $xx
		 Language        $xx xx xx
		 The actual text <text string according to encoding>
		 */
		title: 'Terms of use',
		versions: [3, 4],
		impl: FrameLangText
	},
	'OWNE': {
		/*
		 The ownership frame might be used as a reminder of a made transaction or, if signed, as proof. Note that the "USER" and "TOWN" frames are good to use in conjunction with this one.
		 The frame begins, after the frame ID, size and encoding fields, with a 'price payed' field. The first three characters of this field contains the currency used for the transaction,
		 encoded according to ISO-4217 alphabetic currency code. Concatenated to this is the actual price payed, as a numerical string using "." as the decimal separator. Next is an 8 character
		  date string (YYYYMMDD) followed by a string with the name of the seller as the last field in the frame. There may only be one "OWNE" frame in a tag.

		 <Header for 'Ownership frame', ID: "OWNE">
		 Text encoding   $xx
		 Price payed     <text string> $00
		 Date of purch.  <text string>
		 Seller          <text string according to encoding>
		 */
		title: 'Ownership',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'COMR': {
		/*
		 This frame enables several competing offers in the same tag by bundling all needed information. That makes this frame rather complex but it's an easier solution than if one tries
		  to achieve the same result with several frames. The frame begins, after the frame ID, size and encoding fields, with a price string field. A price is constructed by one three
		  character currency code, encoded according to ISO-4217 alphabetic currency code, followed by a numerical value where "." is used as decimal seperator. In the price string several
		  prices may be concatenated, seperated by a "/" character, but there may only be one currency of each type.

		 The price string is followed by an 8 character date string in the format YYYYMMDD, describing for how long the price is valid. After that is a contact URL, with which the user can
		 contact the seller, followed by a one byte 'received as' field. It describes how the audio is delivered when bought according to the following list:

		 $00     Other
		 $01     Standard CD album with other songs
		 $02     Compressed audio on CD
		 $03     File over the Internet
		 $04     Stream over the Internet
		 $05     As note sheets
		 $06     As note sheets in a book with other sheets
		 $07     Music on other media
		 $08     Non-musical merchandise

		 Next follows a terminated string with the name of the seller followed by a terminated string with a short description of the product. The last thing is the ability to include a company logotype.
		  The first of them is the 'Picture MIME type' field containing information about which picture format is used. In the event that the MIME media type name is omitted, "image/" will be implied.
		   Currently only "image/png" and "image/jpeg" are allowed. This format string is followed by the binary picture data. This two last fields may be omitted if no picture is to attach.

		 <Header for 'Commercial frame', ID: "COMR">
		 Text encoding     $xx
		 Price string      <text string> $00
		 Valid until       <text string>
		 Contact URL       <text string> $00
		 Received as       $xx
		 Name of seller    <text string according to encoding> $00 (00)
		 Description       <text string according to encoding> $00 (00)
		 Picture MIME type <string> $00
		 Seller logo       <binary data>
		 */
		title: 'Commercial',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'ENCR': {
		/*
		 To identify with which method a frame has been encrypted the encryption method must be registered in the tag with this frame.
		 The 'Owner identifier' is a null-terminated string with a URL containing an email address, or a link to a location where an email address can be found,
		 that belongs to the organisation responsible for this specific encryption method. Questions regarding the encryption method should be sent to the indicated email address.
		  The 'Method symbol' contains a value that is associated with this method throughout the whole tag. Values below $80 are reserved. The 'Method symbol' may optionally be
		  followed by encryption specific data. There may be several "ENCR" frames in a tag but only one containing the same symbol and only one containing the same owner identifier.
		  The method must be used somewhere in the tag. See section 3.3.1, flag j for more information.

		 <Header for 'Encryption method registration', ID: "ENCR">
		 Owner identifier    <text string> $00
		 Method symbol       $xx
		 Encryption data     <binary data>
		 */
		title: 'Encryption method registration',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'GRID': {
		/*
		 This frame enables grouping of otherwise unrelated frames. This can be used when some frames are to be signed. To identify which frames belongs to a set of frames a group identifier
		  must be registered in the tag with this frame. The 'Owner identifier' is a null-terminated string with a URL containing an email address, or a link to a location where an email address
		   can be found, that belongs to the organisation responsible for this grouping. Questions regarding the grouping should be sent to the indicated email address. The 'Group symbol'
		   contains a value that associates the frame with this group throughout the whole tag. Values below $80 are reserved. The 'Group symbol' may optionally be followed by some group specific
		    data, e.g. a digital signature. There may be several "GRID" frames in a tag but only one containing the same symbol and only one containing the same owner identifier.
		    The group symbol must be used somewhere in the tag. See section 3.3.1, flag j for more information.

		 <Header for 'Group ID registration', ID: "GRID">
		 Owner identifier     <text string> $00
		 Group symbol         $xx
		 Group dependent data <binary data>
		 */
		title: 'Group ID registration',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'PRIV': {
		/*
		 <Header for 'Private frame', ID: "PRIV">
		 Owner identifier        <text string> $00
		 The private data        <binary data>

		 //TODO: implement known PRIV Tags
		 AverageLevel 	N
		 PeakValue 	N
		 WM_MediaClassPrimaryID 	N
		 WM_MediaClassSecondaryID 	N
		 WM_Provider 	N
		 WM_CollectionGroupID 	N
		 WM_CollectionID 	N
		 WM_ContentID 	N
		 XMP 	- 	--> http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/XMP.html

		 */
		title: 'Private frame',
		versions: [3, 4],
		impl: FrameIdBin
	},

	// Others 3
	/* */
	'IPLS': {
		/*
		 Since there might be a lot of people contributing to an audio file in various ways, such as musicians and technicians, the 'Text information frames' are often insufficient
		 to list everyone involved in a project. The 'Involved people list' is a frame containing the names of those involved, and how they were involved. The body simply contains
		 a terminated string with the involvement directly followed by a terminated string with the involvee followed by a new involvement and so on. There may only be one "IPLS" frame in each tag.

		 <Header for 'Involved people list', ID: "IPLS">
		 Text encoding    $xx
		 People list strings    <text strings according to encoding>
		 */
		title: 'Involved people list',
		versions: [3],
		impl: FrameTextList,
		upgrade: 'TIPL'
	},

	// Others 4
	/* */
	'SIGN': {
		/*
		 This frame enables a group of frames, grouped with the 'Group identification registration', to be signed. Although signatures can reside inside the registration frame,
		 it might be desired to store the signature elsewhere, e.g. in watermarks. There may be more than one 'signature frame' in a tag, but no two may be identical.

		 <Header for 'Signature frame', ID: "SIGN">
		 Group symbol      $xx
		 Signature         <binary data>
		 */
		title: 'Signature',
		versions: [4],
		impl: FrameUnknown
	},
	'SEEK': {
		/*
		 This frame indicates where other frames in a file/stream can be found.
		 The 'minimum offset to next tag' is calculated from the end of this
		 tag to the beginning of the next. There may only be one 'seek frame'
		 in a tag.

		 <Header for 'Seek frame', ID: "SEEK">
		 Minimum offset to next tag       $xx xx xx xx

		 */
		title: 'Seek',
		versions: [4],
		impl: FrameUnknown
	},
	'ASPI': {
		/*
		 Audio files with variable bit rates are intrinsically difficult to deal with in the case of seeking within the file. The ASPI frame makes seeking easier by providing
		 a list a seek points within the audio file. The seek points are a fractional offset within the audio data, providing a starting point from which to find an appropriate
		 point to start decoding. The presence of an ASPI frame requires the existence of a TLEN frame, indicating the duration of the file in milliseconds. There may only be one
		 'audio seek point index' frame in a tag.

		 <Header for 'Seek Point Index', ID: "ASPI">
		 Indexed data start (S)         $xx xx xx xx
		 Indexed data length (L)        $xx xx xx xx
		 Number of index points (N)     $xx xx
		 Bits per index point (b)       $xx

		 Then for every index point the following data is included;
		 Fraction at index (Fi)          $xx (xx)
		 'Indexed data start' is a byte offset from the beginning of the file. 'Indexed data length' is the byte length of the audio data being indexed. 'Number of index points' is
		 the number of index points, as the name implies. The recommended number is 100. 'Bits per index point' is 8 or 16, depending on the chosen precision. 8 bits works well
		 for short files (less than 5 minutes of audio), while 16 bits is advantageous for long files. 'Fraction at index' is the numerator of the fraction representing a relative
		 position in the data. The denominator is 2 to the power of b.

		 Here are the algorithms to be used in the calculation. The known data must be the offset of the start of the indexed data (S), the offset of the end of the indexed data (E),
		 the number of index points (N), the offset at index i (Oi). We calculate the fraction at index i (Fi).

		 Oi is the offset of the frame whose start is soonest after the point for which the time offset is (i/N * duration).

		 The frame data should be calculated as follows:
		 Fi = Oi/L * 2^b    (rounded down to the nearest integer)
		 Offset calculation should be calculated as follows from data in the frame:
		 Oi = (Fi/2^b)*L    (rounded up to the nearest integer)
		 */
		title: 'Audio seek point index',
		versions: [4],
		impl: FrameUnknown
	},

	// Unofficial Frames Seen in the Wild
	/* */
	'RGAD': {
		title: 'Replay Gain Adjustment',
		versions: [3, 4],
		impl: FrameRGAD
	},
	'TCMP': {
		/*
		 This is a simple text frame that iTunes uses to indicate if the file is part of a compilation.

		 Information
		 1 if part of a compilation
		 0 or not present if not part of a compilation

		 This is written to a v2.2 tag as TCP.
		 */
		title: 'iTunes Compilation Flag',
		versions: [3, 4],
		impl: FramePartOfCompilation
	},
	'TSO2': {
		/*
		 iTunes/Musicbrainz uses this for Album Artist sort order
		 */
		title: 'Album Artist sort order',
		versions: [3, 4],
		impl: FrameText
	},
	'TSOC': {
		/*
		 iTunes uses this for Composer sort order
		 */
		title: 'Composer sort order',
		versions: [3, 4],
		impl: FrameText
	},
	'MVNM': {
		/*
		 Movement
		 */
		title: 'Movement',
		versions: [3, 4],
		impl: FrameText
	},
	'MVIN': {
		/*
		 Movement Nr
		 */
		title: 'Movement Number/Total',
		versions: [3, 4],
		impl: FrameText
	},
	'PCST': {
		/*
		 Itunes - Indicates a podcast.
		 */
		title: 'Podcast Marker',
		versions: [3, 4],
		impl: FramePCST
	},
	'TDES': {
		title: 'Podcast Description',
		versions: [3, 4],
		impl: FrameText
	},
	'TKWD': {
		title: 'Podcast Keywords',
		versions: [3, 4],
		impl: FrameText
	},
	'TGID': {
		title: 'Podcast URL',
		versions: [3, 4],
		impl: FrameText
	},
	'WFED': {
		title: 'Podcast feed URL',
		versions: [3, 4],
		impl: FrameText
	},
	'GRP1': {
		title: 'Work',
		versions: [3, 4],
		impl: FrameText
	},
	'NCON': {
		/*
		 Non-standard NCON frame (MusicMatch)
		 */
		title: 'MusicMatch Binary',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'CTOC': {
		title: 'Chapter TOC',
		versions: [4],
		impl: FrameCTOC
	},
	'CHAP': {
		title: 'Chapter',
		versions: [4],
		impl: FrameCHAP
	},
	'XHD3': {
		title: 'mp3hd',
		versions: [3, 4],
		impl: FrameUnknown
	},
	'CM1': {
		title: 'User defined text',
		versions: [2],
		impl: FrameText,
		upgrade: 'TXXX',
		upgradeValue: (value: IID3V2.FrameValue.Text): IID3V2.FrameValue.IdText => {
			return {
				id: '',
				text: value.text
			};
		}
	}
};

interface IDBinTree {
	[num: number]: IDBinTree;

	frameDef?: IFrameDef;
}

let tree: IDBinTree;

function fillTree() {
	tree = {};
	Object.keys(FrameDefs).forEach(key => {
		let node = tree;
		for (let i = 0; i < key.length - 1; i++) {
			const c = key.charCodeAt(i);
			node[c] = node[c] || {};
			node = node[c];
		}
		const last = key.charCodeAt(key.length - 1);
		node[last] = node[last] || {frameDef: FrameDefs[key]};
	});
}

function findId3v2FrameDefBuffer(id: Buffer): IFrameDef | undefined {
	const last = id[id.length - 1];
	if (last === 32 || last === 0) {
		id = id.slice(0, id.length - 1);
	}
	if (!tree) {
		fillTree();
	}
	let node = tree;
	for (let i = 0; i < id.length; i++) {
		const c = id[i];
		if (!node[c]) {
			node = tree;
			break;
		}
		node = node[c];
	}
	if (node.frameDef) {
		return node.frameDef;
	}
	for (let i = 0; i < Matcher.length; i++) {
		if (Matcher[i].matchBin(id)) {
			return Matcher[i].value;
		}
	}
}

export function findId3v2FrameDef(id: string): IFrameDef | null {
	const f = FrameDefs[id];
	if (f) {
		return f;
	}
	for (let i = 0; i < Matcher.length; i++) {
		if (Matcher[i].match(id)) {
			return Matcher[i].value;
		}
	}
	return null;
}

export function matchFrame(id: string): IFrameDef {
	return findId3v2FrameDef(id) || {title: 'Unknown Frame', impl: FrameUnknown, versions: [2, 3, 4]};
}

export function removeUnsync(data: Buffer): Buffer {
	const result = BufferUtils.zeroBuffer(data.length);
	result[0] = data[0];
	let pos = 1;
	for (let i = 1; i < data.length; i++) {
		if (data[i] === 0 && data[i - 1] === 0xFF) {
			// nope
		} else {
			result[pos] = data[i];
			pos++;
		}
	}
	return result.slice(0, pos);
}

async function processRawFrame(frame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<void> {
	if ((frame.formatFlags) && (frame.formatFlags.encrypted)) {
		// debug('processRawFrame', 'encrypted frame');
		return Promise.reject(Error('Frame Encryption currently not supported'));
	}
	if ((frame.formatFlags) && (frame.formatFlags.unsynchronised)) {
		// debug('processRawFrame', 'unsync frame', frame.id);
		frame.data = removeUnsync(frame.data);
	}
	if ((frame.formatFlags) && (frame.formatFlags.compressed)) {
		let data = frame.data;
		if (frame.formatFlags.compressed) {
			const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
			data = data.slice(sizebytes);
		}
		return new Promise<void>((resolve, reject) => {
			zlib.inflate(data, (err, result) => {
				if (!err && result) {
					frame.data = result;
					resolve();
				}
				zlib.gunzip(data, (err2, result2) => {
					if (!err2 && result2) {
						frame.data = result;
						resolve();
					}
					reject('Uncompressing frame failed');
				});
			});
		});
	} else if ((frame.formatFlags) && (frame.formatFlags.data_length_indicator)) {
		/*
		 p - Data length indicator
			 The data length indicator is the value one would write
			 as the 'Frame length' if all of the frame format flags were
			 zeroed, represented as a 32 bit synchsafe integer.
		 */
		frame.data = frame.data.slice(4);
	}
}

async function writeToRawFrame(frame: IID3V2.Frame, head: IID3V2.TagHeader): Promise<IID3V2.RawFrame> {
	const frameHead: IID3V2.FrameHeader = frame.head || {
		size: 0,
		statusFlags: {},
		formatFlags: {}
	};
	let id = frame.id;
	let data: Buffer;
	if (frame.invalid) {
		const val = <IID3V2.FrameValue.Bin>frame.value;
		if (!val.bin) {
			return Promise.reject(Error('Invalid frame definition (trying to write a frame with parser error)'));
		}
		data = val.bin;
	} else {
		const stream = new MemoryWriterStream();
		const orgDef = matchFrame(frame.id);
		if (orgDef.versions.indexOf(head.ver) < 0) {
			const toWriteFrameID = ensureID3v2FrameVersionDef(frame.id, head.ver);
			if (!toWriteFrameID) {
				await orgDef.impl.write(frame, stream, head);
			} else {
				id = toWriteFrameID;
				const toWriteFrameDef = matchFrame(toWriteFrameID);
				await toWriteFrameDef.impl.write(frame, stream, head);
			}
		} else {
			await orgDef.impl.write(frame, stream, head);
		}
		data = stream.toBuffer();
		if ((frameHead.formatFlags) && (frameHead.formatFlags.compressed)) {
			const sizebytes = ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
			const uncompressedStream = new MemoryWriterStream();
			if (sizebytes === 4) {
				uncompressedStream.writeUInt4Byte(data.length);
			} else {
				uncompressedStream.writeUInt3Byte(data.length);
			}
			data = BufferUtils.concatBuffer(uncompressedStream.toBuffer(), zlib.deflateSync(data));
		} else if ((frameHead.formatFlags) && (frameHead.formatFlags.data_length_indicator)) {
			const dataLengthStream = new MemoryWriterStream();
			dataLengthStream.writeSyncSafeInt(data.length);
			data = BufferUtils.concatBuffer(dataLengthStream.toBuffer(), data);
		}
	}

	if (frameHead.formatFlags.grouping) {
		if (frame.groupId === undefined) {
			return Promise.reject(Error('Missing frame groupId but flag is set'));
		}
		const buf = BufferUtils.zeroBuffer(1);
		buf[0] = frame.groupId;
		data = BufferUtils.concatBuffer(buf, data);
	}

	return {id: id, start: 0, end: 0, size: data.length, data: data, statusFlags: frameHead.statusFlags, formatFlags: frameHead.formatFlags};
}

export function isKnownFrameId(id: string): boolean {
	return !!findId3v2FrameDef(id);
}

export function isValidFrameBinId(id: Buffer): boolean {
	return !!findId3v2FrameDefBuffer(id);
}

export function isValidFrameId(id: string): boolean {
	if ((id.length < 3) || (!/[A-Z]/.exec(id[0]))) {
		return false;
	}
	for (let i = 1; i < id.length; i++) {
		if (!/[A-Z0-9]/.exec(id[i])) {
			return false;
		}
	}
	return id.length > 0;
}

export async function writeSubFrames(frames: Array<IID3V2.Frame>, stream: WriterStream, head: IID3V2.TagHeader): Promise<void> {
	const writer = new Id3v2RawWriter(stream, head, {paddingSize: 0});
	const rawframes = await writeToRawFrames(frames, head);
	for (const frame of rawframes) {
		await writer.writeFrame(frame);
	}
}

export async function readSubFrames(bin: Buffer, head: IID3V2.TagHeader): Promise<Array<IID3V2.Frame>> {
	const subtag: IID3V2.RawTag = {id: ITagID.ID3v2, head, frames: [], start: 0, end: 0};
	const reader = new ID3v2Reader();
	const buffer = await reader.readFrames(bin, subtag); // TODO: re-add rest buffer to parse
	const t = await buildID3v2(subtag);
	return t.frames;
}

export async function writeToRawFrames(frames: Array<IID3V2.Frame>, head: IID3V2.TagHeader): Promise<Array<IID3V2.RawFrame>> {
	const result: Array<IID3V2.RawFrame> = [];
	for (const frame of frames) {
		const raw = await writeToRawFrame(frame, head);
		result.push(raw);
	}
	return result;
}

export function upgrade23DateFramesTov24Date(dateFrames: Array<IID3V2.Frame>): IID3V2.Frame | undefined {
	const year = dateFrames.find(f => ['TYER', 'TYE'].indexOf(f.id) >= 0);
	const date = dateFrames.find(f => ['TDAT', 'TDA'].indexOf(f.id) >= 0);
	const time = dateFrames.find(f => ['TIME', 'TIM'].indexOf(f.id) >= 0);
	if (!year && !date && !time) {
		return;
	}
	const result: Array<string> = [];
	if (year && year.value && year.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>year.value).text);
	}
	if (date && date.value && date.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>date.value).text);
	}
	if (time && time.value && time.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>time.value).text);
	}
	const frame: IID3V2.Frame = {
		id: 'TDRC',
		title: 'Recording time',
		value: {text: result.join('-')}
	};
	return frame;
}

export function ensureID3v2FrameVersionDef(id: string, dest: number): string | null {
	const def = FrameDefs[id];
	if (!def) {
		// TODO: matcher
		return null;
	}
	if (def.versions.indexOf(dest) >= 0) {
		return id;
	}
	if (def.versions[0] > dest) {
		const downgradeKey = Object.keys(FrameDefs).find(key => {
			return FrameDefs[key].upgrade === id;
		});
		if (!downgradeKey) {
			// debug('ensureID3v2FrameVersionDef', 'Missing v2.' + def.versions + ' -> v2.' + dest + ' mapping', id);
			return null;
		}
		const f2 = FrameDefs[downgradeKey];
		if (f2.versions.indexOf(dest) < 0) {
			if (f2.versions[0] > dest) {
				return ensureID3v2FrameVersionDef(downgradeKey, dest);
			} else {
				return null;
			}
		} else {
			return downgradeKey;
		}
	} else {
		if (!def.upgrade) {
			// debug('ensureID3v2FrameVersionDef', 'Missing v2.' + def.versions + ' -> v2.' + dest + ' mapping', id);
			return null;
		}
		const upgradeKey = def.upgrade;
		const f2 = FrameDefs[upgradeKey];
		if (f2.versions.indexOf(dest) < 0) {
			if (f2.versions[0] < dest) {
				return ensureID3v2FrameVersionDef(upgradeKey, dest);
			} else {
				return null;
			}
		} else {
			return upgradeKey;
		}
	}
}

export async function readID3v2Frame(rawFrame: IID3V2.RawFrame, head: IID3V2.TagHeader): Promise<IID3V2.Frame> {
	const f = matchFrame(rawFrame.id);
	let groupId: number | undefined;
	if (rawFrame.formatFlags && rawFrame.formatFlags.grouping) {
		groupId = rawFrame.data[0];
		rawFrame.data = rawFrame.data.slice(1);
	}
	const frame: IID3V2.Frame = {
		id: rawFrame.id,
		head: {
			encoding: undefined,
			statusFlags: rawFrame.statusFlags,
			formatFlags: rawFrame.formatFlags,
			size: rawFrame.size
		},
		value: {}
	};
	let result: { value: IID3V2.FrameValue.Base, encoding?: IEncoding, subframes?: Array<IID3V2.Frame> } | undefined;
	try {
		await processRawFrame(rawFrame, head);
		const reader = new DataReader(rawFrame.data);
		result = await f.impl.parse(reader, rawFrame, head);
		if (frame.head) {
			frame.head.encoding = result.encoding ? result.encoding.name : undefined;
		}
		frame.value = result.value || {bin: rawFrame.data};
		if (result.subframes) {
			frame.subframes = result.subframes;
		}
	} catch (e) {
		frame.invalid = e.toString();
		frame.value = {bin: rawFrame.data};
	}
	if (groupId) {
		frame.groupId = groupId;
	}
	frame.title = f.title;
	return frame;
}

