import { FrameIdAscii } from './implementations/id3v2.frame.id-ascii.js';
import { FrameText } from './implementations/id3v2.frame.text.js';
import { FrameUnknown } from './implementations/id3v2.frame.unknown.js';
import { FrameIdText } from './implementations/id3v2.frame.id-text.js';
import { FrameAscii } from './implementations/id3v2.frame.ascii.js';
import { FrameTextList } from './implementations/id3v2.frame.text-list.js';
import { FrameETCO } from './implementations/id3v2.frame.event-timing.js';
import { FrameLangDescText } from './implementations/id3v2.frame.lang-desc-text.js';
import { FrameSYLT } from './implementations/id3v2.frame.synclyrics.js';
import { FrameRelativeVolumeAdjustment } from './implementations/id3v2.frame.rva.js';
import { FramePic } from './implementations/id3v2.frame.pic.js';
import { FrameGEOB } from './implementations/id3v2.frame.generic-object.js';
import { FramePlayCount } from './implementations/id3v2.frame.playcount.js';
import { FramePopularimeter } from './implementations/id3v2.frame.popularimeter.js';
import { FrameAENC } from './implementations/id3v2.frame.aenc.js';
import { FrameLINK } from './implementations/id3v2.frame.linked-info.js';
import { FrameIdBin } from './implementations/id3v2.frame.id-bin.js';
import { FramePriv } from './implementations/id3v2.frame.priv.js';
import { FrameBooleanString } from './implementations/id3v2.frame.boolstring.js';
import { FramePCST } from './implementations/id3v2.frame.pcst.js';
import { FrameMusicCDId } from './implementations/id3v2.frame.musiccdid.js';
import { FrameRelativeVolumeAdjustment2 } from './implementations/id3v2.frame.rva2.js';
import { FrameLangText } from './implementations/id3v2.frame.lang-text.js';
import { FrameRGAD } from './implementations/id3v2.frame.gain-adjustment.js';
import { FrameCTOC } from './implementations/id3v2.frame.chapter-toc.js';
import { FrameCHAP } from './implementations/id3v2.frame.chapter.js';
export const FrameDefs = {
    'UFI': {
        title: 'Unique file identifier',
        versions: [2],
        impl: FrameIdAscii,
        upgrade: 'UFID'
    },
    'TOT': {
        title: 'Original album/Movie/Show title',
        versions: [2],
        impl: FrameText,
        upgrade: 'TOAL'
    },
    'CDM': {
        title: 'Compressed Data Metaframe',
        versions: [2],
        impl: FrameUnknown
    },
    'CRM': {
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
        impl: FrameText,
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
        impl: FrameText,
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
        impl: FrameAscii,
        upgrade: 'WOAF'
    },
    'WAR': {
        title: 'Official artist/performer webpage',
        versions: [2],
        impl: FrameAscii,
        upgrade: 'WOAR'
    },
    'WAS': {
        title: 'Official audio source webpage',
        versions: [2],
        impl: FrameAscii,
        upgrade: 'WOAS'
    },
    'WCM': {
        title: 'Commercial information',
        versions: [2],
        impl: FrameAscii,
        upgrade: 'WCOM'
    },
    'WCP': {
        title: 'Copyright/Legal information',
        versions: [2],
        impl: FrameAscii,
        upgrade: 'WCOP'
    },
    'WPB': {
        title: 'Publishers official webpage',
        versions: [2],
        impl: FrameAscii,
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
        impl: FramePlayCount,
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
        impl: FrameBooleanString,
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
    'TIT1': {
        title: 'Content group description',
        versions: [3, 4],
        impl: FrameText
    },
    'TIT2': {
        title: 'Title',
        versions: [3, 4],
        impl: FrameText
    },
    'TIT3': {
        title: 'Subtitle',
        versions: [3, 4],
        impl: FrameText
    },
    'TALB': {
        title: 'Album',
        versions: [3, 4],
        impl: FrameText
    },
    'TOAL': {
        title: 'Original album',
        versions: [3, 4],
        impl: FrameText
    },
    'TRCK': {
        title: 'Track number',
        versions: [3, 4],
        impl: FrameText
    },
    'TPOS': {
        title: 'Part of a set',
        versions: [3, 4],
        impl: FrameText
    },
    'TSRC': {
        title: 'ISRC (international standard recording code)',
        versions: [3, 4],
        impl: FrameText
    },
    'TSST': {
        title: 'Set subtitle',
        versions: [3, 4],
        impl: FrameText
    },
    'TPE1': {
        title: 'Artist',
        versions: [3, 4],
        impl: FrameText
    },
    'TPE2': {
        title: 'Band',
        versions: [3, 4],
        impl: FrameText
    },
    'TPE3': {
        title: 'Conductor',
        versions: [3, 4],
        impl: FrameText
    },
    'TPE4': {
        title: 'Interpreted, remixed, or otherwise modified by',
        versions: [3, 4],
        impl: FrameText
    },
    'TOPE': {
        title: 'Original artist',
        versions: [3, 4],
        impl: FrameText
    },
    'TEXT': {
        title: 'Lyricist',
        versions: [3, 4],
        impl: FrameText
    },
    'TOLY': {
        title: 'Original lyricist',
        versions: [3, 4],
        impl: FrameText
    },
    'TCOM': {
        title: 'Composer',
        versions: [3, 4],
        impl: FrameText
    },
    'TENC': {
        title: 'Encoded by',
        versions: [3, 4],
        impl: FrameText
    },
    'TBPM': {
        title: 'BPM',
        versions: [3, 4],
        impl: FrameText
    },
    'TLEN': {
        title: 'Length',
        versions: [3, 4],
        impl: FrameText
    },
    'TKEY': {
        title: 'Initial key',
        versions: [3, 4],
        impl: FrameText
    },
    'TLAN': {
        title: 'Languages',
        versions: [3, 4],
        impl: FrameText
    },
    'TCON': {
        title: 'Genre',
        versions: [3, 4],
        impl: FrameText
    },
    'TFLT': {
        title: 'File type',
        versions: [3, 4],
        impl: FrameText
    },
    'TMED': {
        title: 'Media type',
        versions: [3, 4],
        impl: FrameText
    },
    'TCOP': {
        title: 'Copyright message',
        versions: [3, 4],
        impl: FrameText
    },
    'TPUB': {
        title: 'Publisher',
        versions: [3, 4],
        impl: FrameText
    },
    'TOWN': {
        title: 'File owner',
        versions: [3, 4],
        impl: FrameText
    },
    'TRSN': {
        title: 'Internet radio station name',
        versions: [3, 4],
        impl: FrameText
    },
    'TRSO': {
        title: 'Internet radio station owner',
        versions: [3, 4],
        impl: FrameText
    },
    'TOFN': {
        title: 'Original filename',
        versions: [3, 4],
        impl: FrameText
    },
    'TDLY': {
        title: 'Playlist delay',
        versions: [3, 4],
        impl: FrameText
    },
    'TDEN': {
        title: 'Encoding Time',
        versions: [3, 4],
        impl: FrameText
    },
    'TSSE': {
        versions: [3, 4],
        title: 'Encoding Software/Hardware',
        impl: FrameText
    },
    'TDAT': {
        title: 'Date',
        versions: [3],
        impl: FrameText
    },
    'TIME': {
        title: 'Time',
        versions: [3],
        impl: FrameText
    },
    'TORY': {
        title: 'Original release year',
        versions: [3],
        impl: FrameText
    },
    'TRDA': {
        title: 'Recording dates',
        versions: [3],
        impl: FrameText
    },
    'TSIZ': {
        title: 'Size',
        versions: [3],
        impl: FrameText
    },
    'TYER': {
        title: 'Year',
        versions: [3],
        impl: FrameText
    },
    'TMCL': {
        versions: [4],
        title: 'Musician credits list',
        impl: FrameTextList
    },
    'TIPL': {
        versions: [4],
        title: 'Involved people list',
        impl: FrameTextList
    },
    'TMOO': {
        title: 'Mood',
        versions: [4],
        impl: FrameText
    },
    'TPRO': {
        title: 'Produced notice',
        versions: [4],
        impl: FrameText
    },
    'TDOR': {
        title: 'Original release time',
        versions: [4],
        impl: FrameText
    },
    'TDRC': {
        versions: [4],
        title: 'Recording time',
        impl: FrameText
    },
    'TDRL': {
        versions: [3, 4],
        title: 'Release time',
        impl: FrameText
    },
    'TDTG': {
        versions: [4],
        title: 'Tagging time',
        impl: FrameText
    },
    'TSOA': {
        versions: [4],
        title: 'Album sort order',
        impl: FrameText
    },
    'TSOP': {
        versions: [4],
        title: 'Performer sort order',
        impl: FrameText
    },
    'TSOT': {
        versions: [4],
        title: 'Title sort order',
        impl: FrameText
    },
    'WCOM': {
        title: 'Commercial information',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WCOP': {
        title: 'Copyright/Legal information',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WOAF': {
        title: 'Official audio file webpage',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WOAR': {
        title: 'Official artist/performer webpage',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WOAS': {
        title: 'Official audio source webpage',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WORS': {
        title: 'Official internet radio station homepage',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WPAY': {
        title: 'Payment URL',
        versions: [3, 4],
        impl: FrameAscii
    },
    'WPUB': {
        title: 'Publishers official webpage',
        versions: [3, 4],
        impl: FrameAscii
    },
    'TXXX': {
        title: 'User defined text',
        versions: [3, 4],
        impl: FrameIdText
    },
    'WXXX': {
        title: 'User defined URL link frame',
        versions: [3, 4],
        impl: FrameIdText
    },
    'UFID': {
        title: 'Unique file identifier',
        versions: [3, 4],
        impl: FrameIdAscii
    },
    'MCDI': {
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
        title: 'MPEG location lookup table',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'SYTC': {
        title: 'Synchronised tempo codes',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'USLT': {
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
        title: 'Equalisation',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'RVRB': {
        title: 'Reverb',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'APIC': {
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
        title: 'Play counter',
        versions: [3, 4],
        impl: FramePlayCount
    },
    'POPM': {
        title: 'Popularimeter',
        versions: [3, 4],
        impl: FramePopularimeter
    },
    'RBUF': {
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
        title: 'Position synchronisation',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'USER': {
        title: 'Terms of use',
        versions: [3, 4],
        impl: FrameLangText
    },
    'OWNE': {
        title: 'Ownership',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'COMR': {
        title: 'Commercial',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'ENCR': {
        title: 'Encryption method registration',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'GRID': {
        title: 'Group ID registration',
        versions: [3, 4],
        impl: FrameUnknown
    },
    'PRIV': {
        title: 'Private frame',
        versions: [3, 4],
        impl: FramePriv
    },
    'IPLS': {
        title: 'Involved people list',
        versions: [3],
        impl: FrameTextList,
        upgrade: 'TIPL'
    },
    'SIGN': {
        title: 'Signature',
        versions: [4],
        impl: FrameUnknown
    },
    'SEEK': {
        title: 'Seek',
        versions: [4],
        impl: FrameUnknown
    },
    'ASPI': {
        title: 'Audio seek point index',
        versions: [4],
        impl: FrameUnknown
    },
    'RGAD': {
        title: 'Replay Gain Adjustment',
        versions: [3, 4],
        impl: FrameRGAD
    },
    'TCMP': {
        title: 'iTunes Compilation Flag',
        versions: [3, 4],
        impl: FrameBooleanString
    },
    'TSO2': {
        title: 'Album Artist sort order',
        versions: [3, 4],
        impl: FrameText
    },
    'TSOC': {
        title: 'Composer sort order',
        versions: [3, 4],
        impl: FrameText
    },
    'MVNM': {
        title: 'Movement',
        versions: [3, 4],
        impl: FrameText
    },
    'MVIN': {
        title: 'Movement Number/Total',
        versions: [3, 4],
        impl: FrameText
    },
    'MVCN': {
        title: 'Movement Total',
        versions: [3, 4],
        impl: FrameText
    },
    'PCST': {
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
        upgradeValue: (value) => ({
            id: '',
            text: value.text
        })
    }
};
//# sourceMappingURL=id3v2.frame.defs.js.map