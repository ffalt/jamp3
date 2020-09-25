"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameDefs = void 0;
const id3v2_frame_id_ascii_1 = require("./implementations/id3v2.frame.id-ascii");
const id3v2_frame_text_1 = require("./implementations/id3v2.frame.text");
const id3v2_frame_unknown_1 = require("./implementations/id3v2.frame.unknown");
const id3v2_frame_text_concat_list_1 = require("./implementations/id3v2.frame.text-concat-list");
const id3v2_frame_id_text_1 = require("./implementations/id3v2.frame.id-text");
const id3v2_frame_ascii_1 = require("./implementations/id3v2.frame.ascii");
const id3v2_frame_text_list_1 = require("./implementations/id3v2.frame.text-list");
const id3v2_frame_event_timing_1 = require("./implementations/id3v2.frame.event-timing");
const id3v2_frame_lang_desc_text_1 = require("./implementations/id3v2.frame.lang-desc-text");
const id3v2_frame_synclyrics_1 = require("./implementations/id3v2.frame.synclyrics");
const id3v2_frame_rva_1 = require("./implementations/id3v2.frame.rva");
const id3v2_frame_pic_1 = require("./implementations/id3v2.frame.pic");
const id3v2_frame_generic_object_1 = require("./implementations/id3v2.frame.generic-object");
const id3v2_frame_playcount_1 = require("./implementations/id3v2.frame.playcount");
const id3v2_frame_popularimeter_1 = require("./implementations/id3v2.frame.popularimeter");
const id3v2_frame_aenc_1 = require("./implementations/id3v2.frame.aenc");
const id3v2_frame_linked_info_1 = require("./implementations/id3v2.frame.linked-info");
const id3v2_frame_id_bin_1 = require("./implementations/id3v2.frame.id-bin");
const id3v2_frame_boolstring_1 = require("./implementations/id3v2.frame.boolstring");
const id3v2_frame_pcst_1 = require("./implementations/id3v2.frame.pcst");
const id3v2_frame_musiccdid_1 = require("./implementations/id3v2.frame.musiccdid");
const id3v2_frame_rva2_1 = require("./implementations/id3v2.frame.rva2");
const id3v2_frame_lang_text_1 = require("./implementations/id3v2.frame.lang-text");
const id3v2_frame_gain_adjustment_1 = require("./implementations/id3v2.frame.gain-adjustment");
const id3v2_frame_chapter_toc_1 = require("./implementations/id3v2.frame.chapter-toc");
const id3v2_frame_chapter_1 = require("./implementations/id3v2.frame.chapter");
exports.FrameDefs = {
    'UFI': {
        title: 'Unique file identifier',
        versions: [2],
        impl: id3v2_frame_id_ascii_1.FrameIdAscii,
        upgrade: 'UFID'
    },
    'TOT': {
        title: 'Original album/Movie/Show title',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TOAL'
    },
    'CDM': {
        title: 'Compressed Data Metaframe',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'CRM': {
        title: 'Encrypted meta',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'TT1': {
        title: 'Content group description',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TIT1'
    },
    'TT2': {
        title: 'Title',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TIT2'
    },
    'TT3': {
        title: 'Subtitle',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TIT3'
    },
    'TP1': {
        title: 'Artist',
        versions: [2],
        impl: id3v2_frame_text_concat_list_1.FrameTextConcatList,
        upgrade: 'TPE1'
    },
    'TP2': {
        title: 'Band',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TPE2'
    },
    'TP3': {
        title: 'Conductor',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TPE3'
    },
    'TP4': {
        title: 'Interpreted, remixed, or otherwise modified by',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TPE4'
    },
    'TCM': {
        title: 'Composer',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TCOM'
    },
    'TXT': {
        title: 'Lyricist',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TEXT'
    },
    'TLA': {
        title: 'Languages',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TLAN'
    },
    'TCO': {
        title: 'Genre',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TCON'
    },
    'TAL': {
        title: 'Album',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TALB'
    },
    'TPA': {
        title: 'Part of a set',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TPOS'
    },
    'TRK': {
        title: 'Track number',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TRCK'
    },
    'TRC': {
        title: 'ISRC (international standard recording code)',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSRC'
    },
    'TYE': {
        title: 'Year',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TYER'
    },
    'TDA': {
        title: 'Date',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TDAT'
    },
    'TIM': {
        title: 'Time',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TIME'
    },
    'TRD': {
        title: 'Recording dates',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TRDA'
    },
    'TMT': {
        title: 'Media type',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TMED'
    },
    'TBP': {
        title: 'BPM',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TBPM'
    },
    'TCR': {
        title: 'Copyright message',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TCOP'
    },
    'TPB': {
        title: 'Publisher',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TPUB'
    },
    'TEN': {
        title: 'Encoded by',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TENC'
    },
    'TSS': {
        title: 'Encoding Software/Hardware',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSSE'
    },
    'TOF': {
        title: 'Original filename',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TOFN'
    },
    'TLE': {
        title: 'Length',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TLEN'
    },
    'TSI': {
        title: 'Size',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSIZ'
    },
    'TDY': {
        title: 'Playlist delay',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TDLY'
    },
    'TKE': {
        title: 'Initial key',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TKEY'
    },
    'TOL': {
        title: 'Original lyricist',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TOLY'
    },
    'TOA': {
        title: 'Original artist',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TOPE'
    },
    'TOR': {
        title: 'Original release year',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TORY'
    },
    'TXX': {
        title: 'User defined text',
        versions: [2],
        impl: id3v2_frame_id_text_1.FrameIdText,
        upgrade: 'TXXX'
    },
    'WAF': {
        title: 'Official audio file webpage',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WOAF'
    },
    'WAR': {
        title: 'Official artist/performer webpage',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WOAR'
    },
    'WAS': {
        title: 'Official audio source webpage',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WOAS'
    },
    'WCM': {
        title: 'Commercial information',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WCOM'
    },
    'WCP': {
        title: 'Copyright/Legal information',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WCOP'
    },
    'WPB': {
        title: 'Publishers official webpage',
        versions: [2],
        impl: id3v2_frame_ascii_1.FrameAscii,
        upgrade: 'WPUB'
    },
    'WXX': {
        title: 'User defined URL link frame',
        versions: [2],
        impl: id3v2_frame_id_text_1.FrameIdText,
        upgrade: 'WXXX'
    },
    'IPL': {
        title: 'Involved people list',
        versions: [2],
        impl: id3v2_frame_text_list_1.FrameTextList,
        upgrade: 'IPLS'
    },
    'ETC': {
        title: 'Event timing codes',
        versions: [2],
        impl: id3v2_frame_event_timing_1.FrameETCO,
        upgrade: 'ETCO'
    },
    'MLL': {
        title: 'MPEG location lookup table',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'MLLT'
    },
    'STC': {
        title: 'Synchronised tempo codes',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'SYTC'
    },
    'ULT': {
        title: 'Unsychronized lyric/text transcription',
        versions: [2],
        impl: id3v2_frame_lang_desc_text_1.FrameLangDescText,
        upgrade: 'USLT'
    },
    'SLT': {
        title: 'Synchronised lyrics/text',
        versions: [2],
        impl: id3v2_frame_synclyrics_1.FrameSYLT,
        upgrade: 'SYLT'
    },
    'COM': {
        title: 'Comments',
        versions: [2],
        impl: id3v2_frame_lang_desc_text_1.FrameLangDescText,
        upgrade: 'COMM'
    },
    'RVA': {
        title: 'Relative volume adjustment',
        versions: [2],
        impl: id3v2_frame_rva_1.FrameRelativeVolumeAdjustment,
        upgrade: 'RVAD'
    },
    'EQU': {
        title: 'Equalisation',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'EQUA'
    },
    'REV': {
        title: 'Reverb',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'RVRB'
    },
    'PIC': {
        title: 'Attached picture',
        versions: [2],
        impl: id3v2_frame_pic_1.FramePic,
        upgrade: 'APIC'
    },
    'GEO': {
        title: 'General encapsulated object',
        versions: [2],
        impl: id3v2_frame_generic_object_1.FrameGEOB,
        upgrade: 'GEOB'
    },
    'CNT': {
        title: 'Play counter',
        versions: [2],
        impl: id3v2_frame_playcount_1.FramePlayCount,
        upgrade: 'PCNT'
    },
    'POP': {
        title: 'Popularimeter',
        versions: [2],
        impl: id3v2_frame_popularimeter_1.FramePopularimeter,
        upgrade: 'POPM'
    },
    'BUF': {
        title: 'Recommended buffer size',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'RBUF'
    },
    'CRA': {
        title: 'Audio encryption',
        versions: [2],
        impl: id3v2_frame_aenc_1.FrameAENC,
        upgrade: 'AENC'
    },
    'LNK': {
        title: 'Linked information',
        versions: [2],
        impl: id3v2_frame_linked_info_1.FrameLINK,
        upgrade: 'LINK'
    },
    'NCO': {
        title: 'MusicMatch Binary',
        versions: [2],
        impl: id3v2_frame_unknown_1.FrameUnknown,
        upgrade: 'NCON'
    },
    'PRI': {
        title: 'Private frame',
        versions: [2],
        impl: id3v2_frame_id_bin_1.FrameIdBin,
        upgrade: 'PRIV'
    },
    'TCP': {
        title: 'iTunes Compilation Flag',
        versions: [2],
        impl: id3v2_frame_boolstring_1.FrameBooleanString,
        upgrade: 'TCMP'
    },
    'TST': {
        title: 'Title sort order',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'XSOT'
    },
    'TSP': {
        title: 'Performer sort order',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'XSOP'
    },
    'TSA': {
        title: 'Album sort order',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'XSOA'
    },
    'TS2': {
        title: 'Album Artist sort order',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSO2'
    },
    'TSC': {
        title: 'Composer sort order',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSOC'
    },
    'TDR': {
        title: 'Release time',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TDRL'
    },
    'TDS': {
        title: 'iTunes podcast description',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TDES'
    },
    'TID': {
        title: 'Podcast URL',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TGID'
    },
    'WFD': {
        title: 'Podcast feed URL',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'WFED'
    },
    'PCS': {
        title: 'iTunes podcast marker',
        versions: [2],
        impl: id3v2_frame_pcst_1.FramePCST,
        upgrade: 'PCST'
    },
    'XSOA': {
        title: 'Album sort order',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSOA'
    },
    'XSOP': {
        title: 'Performer sort order',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSOP'
    },
    'XSOT': {
        title: 'Title sort order',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TSOT'
    },
    'XDOR': {
        title: 'Original release time',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TDOR'
    },
    'TIT1': {
        title: 'Content group description',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TIT2': {
        title: 'Title',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TIT3': {
        title: 'Subtitle',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TALB': {
        title: 'Album',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TOAL': {
        title: 'Original album',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TRCK': {
        title: 'Track number',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPOS': {
        title: 'Part of a set',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TSRC': {
        title: 'ISRC (international standard recording code)',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TSST': {
        title: 'Set subtitle',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPE1': {
        title: 'Artist',
        versions: [3, 4],
        impl: id3v2_frame_text_concat_list_1.FrameTextConcatList
    },
    'TPE2': {
        title: 'Band',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPE3': {
        title: 'Conductor',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPE4': {
        title: 'Interpreted, remixed, or otherwise modified by',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TOPE': {
        title: 'Original artist',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TEXT': {
        title: 'Lyricist',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TOLY': {
        title: 'Original lyricist',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TCOM': {
        title: 'Composer',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TENC': {
        title: 'Encoded by',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TBPM': {
        title: 'BPM',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TLEN': {
        title: 'Length',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TKEY': {
        title: 'Initial key',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TLAN': {
        title: 'Languages',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TCON': {
        title: 'Genre',
        versions: [3, 4],
        impl: id3v2_frame_text_concat_list_1.FrameTextConcatList
    },
    'TFLT': {
        title: 'File type',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TMED': {
        title: 'Media type',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TCOP': {
        title: 'Copyright message',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPUB': {
        title: 'Publisher',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TOWN': {
        title: 'File owner',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TRSN': {
        title: 'Internet radio station name',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TRSO': {
        title: 'Internet radio station owner',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TOFN': {
        title: 'Original filename',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TDLY': {
        title: 'Playlist delay',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TDEN': {
        title: 'Encoding Time',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TSSE': {
        versions: [3, 4],
        title: 'Encoding Software/Hardware',
        impl: id3v2_frame_text_1.FrameText
    },
    'TDAT': {
        title: 'Date',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TIME': {
        title: 'Time',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TORY': {
        title: 'Original release year',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TRDA': {
        title: 'Recording dates',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TSIZ': {
        title: 'Size',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TYER': {
        title: 'Year',
        versions: [3],
        impl: id3v2_frame_text_1.FrameText
    },
    'TMCL': {
        versions: [4],
        title: 'Musician credits list',
        impl: id3v2_frame_text_list_1.FrameTextList
    },
    'TIPL': {
        versions: [4],
        title: 'Involved people list',
        impl: id3v2_frame_text_list_1.FrameTextList
    },
    'TMOO': {
        title: 'Mood',
        versions: [4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TPRO': {
        title: 'Produced notice',
        versions: [4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TDOR': {
        title: 'Original release time',
        versions: [4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TDRC': {
        versions: [4],
        title: 'Recording time',
        impl: id3v2_frame_text_1.FrameText
    },
    'TDRL': {
        versions: [3, 4],
        title: 'Release time',
        impl: id3v2_frame_text_1.FrameText
    },
    'TDTG': {
        versions: [4],
        title: 'Tagging time',
        impl: id3v2_frame_text_1.FrameText
    },
    'TSOA': {
        versions: [4],
        title: 'Album sort order',
        impl: id3v2_frame_text_1.FrameText
    },
    'TSOP': {
        versions: [4],
        title: 'Performer sort order',
        impl: id3v2_frame_text_1.FrameText
    },
    'TSOT': {
        versions: [4],
        title: 'Title sort order',
        impl: id3v2_frame_text_1.FrameText
    },
    'WCOM': {
        title: 'Commercial information',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WCOP': {
        title: 'Copyright/Legal information',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WOAF': {
        title: 'Official audio file webpage',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WOAR': {
        title: 'Official artist/performer webpage',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WOAS': {
        title: 'Official audio source webpage',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WORS': {
        title: 'Official internet radio station homepage',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WPAY': {
        title: 'Payment URL',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'WPUB': {
        title: 'Publishers official webpage',
        versions: [3, 4],
        impl: id3v2_frame_ascii_1.FrameAscii
    },
    'TXXX': {
        title: 'User defined text',
        versions: [3, 4],
        impl: id3v2_frame_id_text_1.FrameIdText
    },
    'WXXX': {
        title: 'User defined URL link frame',
        versions: [3, 4],
        impl: id3v2_frame_id_text_1.FrameIdText
    },
    'UFID': {
        title: 'Unique file identifier',
        versions: [3, 4],
        impl: id3v2_frame_id_ascii_1.FrameIdAscii
    },
    'MCDI': {
        title: 'Music CD identifier',
        versions: [3, 4],
        impl: id3v2_frame_musiccdid_1.FrameMusicCDId
    },
    'ETCO': {
        title: 'Event timing codes',
        versions: [3, 4],
        impl: id3v2_frame_event_timing_1.FrameETCO
    },
    'MLLT': {
        title: 'MPEG location lookup table',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'SYTC': {
        title: 'Synchronised tempo codes',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'USLT': {
        title: 'Unsychronized lyric/text transcription',
        versions: [3, 4],
        impl: id3v2_frame_lang_desc_text_1.FrameLangDescText
    },
    'SYLT': {
        title: 'Synchronised lyrics',
        versions: [3, 4],
        impl: id3v2_frame_synclyrics_1.FrameSYLT
    },
    'COMM': {
        title: 'Comments',
        versions: [3, 4],
        impl: id3v2_frame_lang_desc_text_1.FrameLangDescText
    },
    'RVAD': {
        title: 'Relative volume adjustment',
        versions: [3, 4],
        impl: id3v2_frame_rva_1.FrameRelativeVolumeAdjustment
    },
    'RVA2': {
        title: 'Relative volume adjustment 2',
        versions: [4],
        impl: id3v2_frame_rva2_1.FrameRelativeVolumeAdjustment2
    },
    'EQUA': {
        title: 'Equalisation',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'RVRB': {
        title: 'Reverb',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'APIC': {
        title: 'Attached picture',
        versions: [3, 4],
        impl: id3v2_frame_pic_1.FramePic
    },
    'GEOB': {
        title: 'General encapsulated object',
        versions: [3, 4],
        impl: id3v2_frame_generic_object_1.FrameGEOB
    },
    'PCNT': {
        title: 'Play counter',
        versions: [3, 4],
        impl: id3v2_frame_playcount_1.FramePlayCount
    },
    'POPM': {
        title: 'Popularimeter',
        versions: [3, 4],
        impl: id3v2_frame_popularimeter_1.FramePopularimeter
    },
    'RBUF': {
        title: 'Recommended buffer size',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'AENC': {
        title: 'Audio encryption',
        versions: [3, 4],
        impl: id3v2_frame_aenc_1.FrameAENC
    },
    'LINK': {
        title: 'Linked information',
        versions: [3, 4],
        impl: id3v2_frame_linked_info_1.FrameLINK
    },
    'POSS': {
        title: 'Position synchronisation',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'USER': {
        title: 'Terms of use',
        versions: [3, 4],
        impl: id3v2_frame_lang_text_1.FrameLangText
    },
    'OWNE': {
        title: 'Ownership',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'COMR': {
        title: 'Commercial',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'ENCR': {
        title: 'Encryption method registration',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'GRID': {
        title: 'Group ID registration',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'PRIV': {
        title: 'Private frame',
        versions: [3, 4],
        impl: id3v2_frame_id_bin_1.FrameIdBin
    },
    'IPLS': {
        title: 'Involved people list',
        versions: [3],
        impl: id3v2_frame_text_list_1.FrameTextList,
        upgrade: 'TIPL'
    },
    'SIGN': {
        title: 'Signature',
        versions: [4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'SEEK': {
        title: 'Seek',
        versions: [4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'ASPI': {
        title: 'Audio seek point index',
        versions: [4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'RGAD': {
        title: 'Replay Gain Adjustment',
        versions: [3, 4],
        impl: id3v2_frame_gain_adjustment_1.FrameRGAD
    },
    'TCMP': {
        title: 'iTunes Compilation Flag',
        versions: [3, 4],
        impl: id3v2_frame_boolstring_1.FrameBooleanString
    },
    'TSO2': {
        title: 'Album Artist sort order',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TSOC': {
        title: 'Composer sort order',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'MVNM': {
        title: 'Movement',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'MVIN': {
        title: 'Movement Number/Total',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'PCST': {
        title: 'Podcast Marker',
        versions: [3, 4],
        impl: id3v2_frame_pcst_1.FramePCST
    },
    'TDES': {
        title: 'Podcast Description',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TKWD': {
        title: 'Podcast Keywords',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'TGID': {
        title: 'Podcast URL',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'WFED': {
        title: 'Podcast feed URL',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'GRP1': {
        title: 'Work',
        versions: [3, 4],
        impl: id3v2_frame_text_1.FrameText
    },
    'NCON': {
        title: 'MusicMatch Binary',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'CTOC': {
        title: 'Chapter TOC',
        versions: [4],
        impl: id3v2_frame_chapter_toc_1.FrameCTOC
    },
    'CHAP': {
        title: 'Chapter',
        versions: [4],
        impl: id3v2_frame_chapter_1.FrameCHAP
    },
    'XHD3': {
        title: 'mp3hd',
        versions: [3, 4],
        impl: id3v2_frame_unknown_1.FrameUnknown
    },
    'CM1': {
        title: 'User defined text',
        versions: [2],
        impl: id3v2_frame_text_1.FrameText,
        upgrade: 'TXXX',
        upgradeValue: (value) => {
            return {
                id: '',
                text: value.text
            };
        }
    }
};
//# sourceMappingURL=id3v2.frame.defs.js.map