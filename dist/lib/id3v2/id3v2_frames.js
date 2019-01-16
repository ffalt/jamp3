"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const streams_1 = require("../common/streams");
const buffer_1 = require("../common/buffer");
const id3v2_consts_1 = require("./id3v2_consts");
const id3v2_reader_1 = require("./id3v2_reader");
const id3v2_1 = require("./id3v2");
const zlib = __importStar(require("zlib"));
const id3v2_writer_1 = require("./id3v2_writer");
const id3v2_frame_1 = require("./id3v2_frame");
function validCharKeyCode(c) {
    return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
const Matcher = [
    {
        match: (id) => {
            return id[0] === 'T' && id !== 'TXX' && id !== 'TXXX';
        },
        matchBin: (id) => {
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
            impl: id3v2_frame_1.FrameText
        }
    },
    {
        match: (id) => {
            return (id[0] === 'W' && id !== 'WXX' && id !== 'WXXX');
        },
        matchBin: (id) => {
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
            impl: id3v2_frame_1.FrameAsciiValue,
        }
    }
];
exports.FrameDefs = {
    'UFI': {
        title: 'Unique file identifier',
        versions: [2],
        impl: id3v2_frame_1.FrameIdAscii,
        upgrade: 'UFID'
    },
    'TOT': {
        title: 'Original album/Movie/Show title',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TOAL'
    },
    'CDM': {
        title: 'Compressed Data Metaframe',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown
    },
    'CRM': {
        title: 'Encrypted meta',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown
    },
    'TT1': {
        title: 'Content group description',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TIT1'
    },
    'TT2': {
        title: 'Title',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TIT2'
    },
    'TT3': {
        title: 'Subtitle',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TIT3'
    },
    'TP1': {
        title: 'Artist',
        versions: [2],
        impl: id3v2_frame_1.FrameTextConcatList,
        upgrade: 'TPE1'
    },
    'TP2': {
        title: 'Band',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TPE2'
    },
    'TP3': {
        title: 'Conductor',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TPE3'
    },
    'TP4': {
        title: 'Interpreted, remixed, or otherwise modified by',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TPE4'
    },
    'TCM': {
        title: 'Composer',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TCOM'
    },
    'TXT': {
        title: 'Lyricist',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TEXT'
    },
    'TLA': {
        title: 'Languages',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TLAN'
    },
    'TCO': {
        title: 'Genre',
        versions: [2],
        impl: id3v2_frame_1.FrameTextConcatList,
        upgrade: 'TCON'
    },
    'TAL': {
        title: 'Album',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TALB'
    },
    'TPA': {
        title: 'Part of a set',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TPOS'
    },
    'TRK': {
        title: 'Track number',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TRCK'
    },
    'TRC': {
        title: 'ISRC (international standard recording code)',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSRC'
    },
    'TYE': {
        title: 'Year',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TYER'
    },
    'TDA': {
        title: 'Date',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TDAT'
    },
    'TIM': {
        title: 'Time',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TIME'
    },
    'TRD': {
        title: 'Recording dates',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TRDA'
    },
    'TMT': {
        title: 'Media type',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TMED'
    },
    'TBP': {
        title: 'BPM',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TBPM'
    },
    'TCR': {
        title: 'Copyright message',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TCOP'
    },
    'TPB': {
        title: 'Publisher',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TPUB'
    },
    'TEN': {
        title: 'Encoded by',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TENC'
    },
    'TSS': {
        title: 'Encoding Software/Hardware',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSSE'
    },
    'TOF': {
        title: 'Original filename',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TOFN'
    },
    'TLE': {
        title: 'Length',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TLEN'
    },
    'TSI': {
        title: 'Size',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSIZ'
    },
    'TDY': {
        title: 'Playlist delay',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TDLY'
    },
    'TKE': {
        title: 'Initial key',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TKEY'
    },
    'TOL': {
        title: 'Original lyricist',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TOLY'
    },
    'TOA': {
        title: 'Original artist',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TOPE'
    },
    'TOR': {
        title: 'Original release year',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TORY'
    },
    'TXX': {
        title: 'User defined text',
        versions: [2],
        impl: id3v2_frame_1.FrameIdText,
        upgrade: 'TXXX'
    },
    'WAF': {
        title: 'Official audio file webpage',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WOAF'
    },
    'WAR': {
        title: 'Official artist/performer webpage',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WOAR'
    },
    'WAS': {
        title: 'Official audio source webpage',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WOAS'
    },
    'WCM': {
        title: 'Commercial information',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WCOM'
    },
    'WCP': {
        title: 'Copyright/Legal information',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WCOP'
    },
    'WPB': {
        title: 'Publishers official webpage',
        versions: [2],
        impl: id3v2_frame_1.FrameAsciiValue,
        upgrade: 'WPUB'
    },
    'WXX': {
        title: 'User defined URL link frame',
        versions: [2],
        impl: id3v2_frame_1.FrameIdText,
        upgrade: 'WXXX'
    },
    'IPL': {
        title: 'Involved people list',
        versions: [2],
        impl: id3v2_frame_1.FrameTextList,
        upgrade: 'IPLS'
    },
    'ETC': {
        title: 'Event timing codes',
        versions: [2],
        impl: id3v2_frame_1.FrameETCO,
        upgrade: 'ETCO'
    },
    'MLL': {
        title: 'MPEG location lookup table',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'MLLT'
    },
    'STC': {
        title: 'Synchronised tempo codes',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'SYTC'
    },
    'ULT': {
        title: 'Unsychronized lyric/text transcription',
        versions: [2],
        impl: id3v2_frame_1.FrameLangDescText,
        upgrade: 'USLT'
    },
    'SLT': {
        title: 'Synchronised lyrics/text',
        versions: [2],
        impl: id3v2_frame_1.FrameSYLT,
        upgrade: 'SYLT'
    },
    'COM': {
        title: 'Comments',
        versions: [2],
        impl: id3v2_frame_1.FrameLangDescText,
        upgrade: 'COMM'
    },
    'RVA': {
        title: 'Relative volume adjustment',
        versions: [2],
        impl: id3v2_frame_1.FrameRelativeVolumeAdjustment,
        upgrade: 'RVAD'
    },
    'EQU': {
        title: 'Equalisation',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'EQUA'
    },
    'REV': {
        title: 'Reverb',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'RVRB'
    },
    'PIC': {
        title: 'Attached picture',
        versions: [2],
        impl: id3v2_frame_1.FramePic,
        upgrade: 'APIC'
    },
    'GEO': {
        title: 'General encapsulated object',
        versions: [2],
        impl: id3v2_frame_1.FrameGEOB,
        upgrade: 'GEOB'
    },
    'CNT': {
        title: 'Play counter',
        versions: [2],
        impl: id3v2_frame_1.FramePlayCounter,
        upgrade: 'PCNT'
    },
    'POP': {
        title: 'Popularimeter',
        versions: [2],
        impl: id3v2_frame_1.FramePopularimeter,
        upgrade: 'POPM'
    },
    'BUF': {
        title: 'Recommended buffer size',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'RBUF'
    },
    'CRA': {
        title: 'Audio encryption',
        versions: [2],
        impl: id3v2_frame_1.FrameAENC,
        upgrade: 'AENC'
    },
    'LNK': {
        title: 'Linked information',
        versions: [2],
        impl: id3v2_frame_1.FrameLINK,
        upgrade: 'LINK'
    },
    'NCO': {
        title: 'MusicMatch Binary',
        versions: [2],
        impl: id3v2_frame_1.FrameUnknown,
        upgrade: 'NCON'
    },
    'PRI': {
        title: 'Private frame',
        versions: [2],
        impl: id3v2_frame_1.FrameIdBin,
        upgrade: 'PRIV'
    },
    'TCP': {
        title: 'iTunes Compilation Flag',
        versions: [2],
        impl: id3v2_frame_1.FramePartOfCompilation,
        upgrade: 'TCMP'
    },
    'TST': {
        title: 'Title sort order',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'XSOT'
    },
    'TSP': {
        title: 'Performer sort order',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'XSOP'
    },
    'TSA': {
        title: 'Album sort order',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'XSOA'
    },
    'TS2': {
        title: 'Album Artist sort order',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSO2'
    },
    'TSC': {
        title: 'Composer sort order',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSOC'
    },
    'TDR': {
        title: 'Release time',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TDRL'
    },
    'TDS': {
        title: 'iTunes podcast description',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TDES'
    },
    'TID': {
        title: 'Podcast URL',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TGID'
    },
    'WFD': {
        title: 'Podcast feed URL',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'WFED'
    },
    'PCS': {
        title: 'iTunes podcast marker',
        versions: [2],
        impl: id3v2_frame_1.FramePCST,
        upgrade: 'PCST'
    },
    'XSOA': {
        title: 'Album sort order',
        versions: [3],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSOA'
    },
    'XSOP': {
        title: 'Performer sort order',
        versions: [3],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSOP'
    },
    'XSOT': {
        title: 'Title sort order',
        versions: [3],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TSOT'
    },
    'XDOR': {
        title: 'Original release time',
        versions: [3],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TDOR'
    },
    'TIT1': {
        title: 'Content group description',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TIT2': {
        title: 'Title',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TIT3': {
        title: 'Subtitle',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TALB': {
        title: 'Album',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TOAL': {
        title: 'Original album',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TRCK': {
        title: 'Track number',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TPOS': {
        title: 'Part of a set',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TSRC': {
        title: 'ISRC (international standard recording code)',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TSST': {
        title: 'Set subtitle',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TPE1': {
        title: 'Artist',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameTextConcatList
    },
    'TPE2': {
        title: 'Band',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TPE3': {
        title: 'Conductor',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TPE4': {
        title: 'Interpreted, remixed, or otherwise modified by',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TOPE': {
        title: 'Original artist',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TEXT': {
        title: 'Lyricist',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TOLY': {
        title: 'Original lyricist',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TCOM': {
        title: 'Composer',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TENC': {
        title: 'Encoded by',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TBPM': {
        title: 'BPM',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TLEN': {
        title: 'Length',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TKEY': {
        title: 'Initial key',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TLAN': {
        title: 'Languages',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TCON': {
        title: 'Genre',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameTextConcatList
    },
    'TFLT': {
        title: 'File type',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TMED': {
        title: 'Media type',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TCOP': {
        title: 'Copyright message',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TPUB': {
        title: 'Publisher',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TOWN': {
        title: 'File owner',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TRSN': {
        title: 'Internet radio station name',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TRSO': {
        title: 'Internet radio station owner',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TOFN': {
        title: 'Original filename',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TDLY': {
        title: 'Playlist delay',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TSSE': {
        versions: [3, 4],
        title: 'Encoding Software/Hardware',
        impl: id3v2_frame_1.FrameText
    },
    'TDAT': {
        title: 'Date',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TIME': {
        title: 'Time',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TORY': {
        title: 'Original release year',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TRDA': {
        title: 'Recording dates',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TSIZ': {
        title: 'Size',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TYER': {
        title: 'Year',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TMCL': {
        versions: [4],
        title: 'Musician credits list',
        impl: id3v2_frame_1.FrameTextList
    },
    'TIPL': {
        versions: [4],
        title: 'Involved people list',
        impl: id3v2_frame_1.FrameTextList
    },
    'TMOO': {
        title: 'Mood',
        versions: [4],
        impl: id3v2_frame_1.FrameText
    },
    'TPRO': {
        title: 'Produced notice',
        versions: [4],
        impl: id3v2_frame_1.FrameText
    },
    'TDOR': {
        title: 'Original release time',
        versions: [4],
        impl: id3v2_frame_1.FrameText
    },
    'TDRC': {
        versions: [4],
        title: 'Recording time',
        impl: id3v2_frame_1.FrameText
    },
    'TDRL': {
        versions: [3, 4],
        title: 'Release time',
        impl: id3v2_frame_1.FrameText
    },
    'TDTG': {
        versions: [4],
        title: 'Tagging time',
        impl: id3v2_frame_1.FrameText
    },
    'TSOA': {
        versions: [4],
        title: 'Album sort order',
        impl: id3v2_frame_1.FrameText
    },
    'TSOP': {
        versions: [4],
        title: 'Performer sort order',
        impl: id3v2_frame_1.FrameText
    },
    'TSOT': {
        versions: [4],
        title: 'Title sort order',
        impl: id3v2_frame_1.FrameText
    },
    'WCOM': {
        title: 'Commercial information',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WCOP': {
        title: 'Copyright/Legal information',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WOAF': {
        title: 'Official audio file webpage',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WOAR': {
        title: 'Official artist/performer webpage',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WOAS': {
        title: 'Official audio source webpage',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WORS': {
        title: 'Official internet radio station homepage',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WPAY': {
        title: 'Payment',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'WPUB': {
        title: 'Publishers official webpage',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAsciiValue
    },
    'TXXX': {
        title: 'User defined text',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameIdText
    },
    'WXXX': {
        title: 'User defined URL link frame',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameIdText
    },
    'UFID': {
        title: 'Unique file identifier',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameIdAscii
    },
    'MCDI': {
        title: 'Music CD identifier',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameMusicCDId
    },
    'ETCO': {
        title: 'Event timing codes',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameETCO
    },
    'MLLT': {
        title: 'MPEG location lookup table',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'SYTC': {
        title: 'Synchronised tempo codes',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'USLT': {
        title: 'Unsychronized lyric/text transcription',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameLangDescText
    },
    'SYLT': {
        title: 'Synchronised lyrics/text',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameSYLT
    },
    'COMM': {
        title: 'Comments',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameLangDescText
    },
    'RVAD': {
        title: 'Relative volume adjustment',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameRelativeVolumeAdjustment
    },
    'RVA2': {
        title: 'Relative volume adjustment 2',
        versions: [4],
        impl: id3v2_frame_1.FrameRelativeVolumeAdjustment2
    },
    'EQUA': {
        title: 'Equalisation',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'RVRB': {
        title: 'Reverb',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'APIC': {
        title: 'Attached picture',
        versions: [3, 4],
        impl: id3v2_frame_1.FramePic
    },
    'GEOB': {
        title: 'General encapsulated object',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameGEOB
    },
    'PCNT': {
        title: 'Play counter',
        versions: [3, 4],
        impl: id3v2_frame_1.FramePlayCounter
    },
    'POPM': {
        title: 'Popularimeter',
        versions: [3, 4],
        impl: id3v2_frame_1.FramePopularimeter
    },
    'RBUF': {
        title: 'Recommended buffer size',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'AENC': {
        title: 'Audio encryption',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameAENC
    },
    'LINK': {
        title: 'Linked information',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameLINK
    },
    'POSS': {
        title: 'Position synchronisation',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'USER': {
        title: 'Terms of use',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'OWNE': {
        title: 'Ownership',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'COMR': {
        title: 'Commercial',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'ENCR': {
        title: 'Encryption method registration',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'GRID': {
        title: 'Group ID registration',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'PRIV': {
        title: 'Private frame',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameIdBin
    },
    'IPLS': {
        title: 'Involved people list',
        versions: [3],
        impl: id3v2_frame_1.FrameTextList
    },
    'SIGN': {
        title: 'Signature',
        versions: [4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'SEEK': {
        title: 'Seek',
        versions: [4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'ASPI': {
        title: 'Audio seek point index',
        versions: [4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'RGAD': {
        title: 'Replay Gain Adjustment',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameRGAD
    },
    'TCMP': {
        title: 'iTunes Compilation Flag',
        versions: [3, 4],
        impl: id3v2_frame_1.FramePartOfCompilation
    },
    'TSO2': {
        title: 'Album Artist sort order',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TSOC': {
        title: 'Composer sort order',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'PCST': {
        title: 'iTunes podcast marker',
        versions: [3, 4],
        impl: id3v2_frame_1.FramePCST
    },
    'TDES': {
        title: 'iTunes podcast description',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'TKWD': {
        title: 'iTunes podcast keywords',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'TGID': {
        title: 'Podcast URL',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'WFED': {
        title: 'Podcast feed URL',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameText
    },
    'NCON': {
        title: 'MusicMatch Binary',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'CTOC': {
        title: 'Chapter TOC',
        versions: [4],
        impl: id3v2_frame_1.FrameCTOC
    },
    'CHAP': {
        title: 'Chapter',
        versions: [4],
        impl: id3v2_frame_1.FrameCHAP
    },
    'XHD3': {
        title: 'mp3hd',
        versions: [3, 4],
        impl: id3v2_frame_1.FrameUnknown
    },
    'CM1': {
        title: 'User defined text',
        versions: [2],
        impl: id3v2_frame_1.FrameText,
        upgrade: 'TXXX',
        upgradeValue: (value) => {
            return {
                id: '',
                text: value.text
            };
        }
    }
};
let tree;
function fillTree() {
    tree = {};
    Object.keys(exports.FrameDefs).forEach(key => {
        let node = tree;
        for (let i = 0; i < key.length - 1; i++) {
            const c = key.charCodeAt(i);
            node[c] = node[c] || {};
            node = node[c];
        }
        const last = key.charCodeAt(key.length - 1);
        node[last] = node[last] || { frameDef: exports.FrameDefs[key] };
    });
}
function findId3v2FrameDefBuffer(id) {
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
function findId3v2FrameDef(id) {
    const f = exports.FrameDefs[id];
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
exports.findId3v2FrameDef = findId3v2FrameDef;
function matchFrame(id) {
    return findId3v2FrameDef(id) || { title: 'Unknown Frame', impl: id3v2_frame_1.FrameUnknown, versions: [2, 3, 4] };
}
exports.matchFrame = matchFrame;
function removeUnsync(data) {
    const result = buffer_1.BufferUtils.zeroBuffer(data.length);
    result[0] = data[0];
    let pos = 1;
    for (let i = 1; i < data.length; i++) {
        if (data[i] === 0 && data[i - 1] === 0xFF) {
        }
        else {
            result[pos] = data[i];
            pos++;
        }
    }
    return result.slice(0, pos);
}
exports.removeUnsync = removeUnsync;
function processRawFrame(frame, head) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((frame.formatFlags) && (frame.formatFlags.encrypted)) {
            return Promise.reject(Error('Frame Encryption currently not supported'));
        }
        if ((frame.formatFlags) && (frame.formatFlags.unsynchronised)) {
            frame.data = removeUnsync(frame.data);
        }
        if ((frame.formatFlags) && (frame.formatFlags.compressed)) {
            let data = frame.data;
            if (frame.formatFlags.compressed) {
                const sizebytes = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
                data = data.slice(sizebytes);
            }
            return new Promise((resolve, reject) => {
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
        }
        else if ((frame.formatFlags) && (frame.formatFlags.data_length_indicator)) {
            frame.data = frame.data.slice(4);
        }
    });
}
function writeToRawFrame(frame, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const frameHead = frame.head || {
            size: 0,
            statusFlags: {},
            formatFlags: {}
        };
        let id = frame.id;
        let data;
        if (frame.invalid) {
            const val = frame.value;
            if (!val.bin) {
                return Promise.reject(Error('Invalid frame definition (trying to write a frame with parser error)'));
            }
            data = val.bin;
        }
        else {
            const stream = new streams_1.MemoryWriterStream();
            const orgDef = matchFrame(frame.id);
            if (orgDef.versions.indexOf(head.ver) < 0) {
                const toWriteFrameID = ensureID3v2FrameVersionDef(frame.id, head.ver);
                if (!toWriteFrameID) {
                    yield orgDef.impl.write(frame, stream, head);
                }
                else {
                    id = toWriteFrameID;
                    const toWriteFrameDef = matchFrame(toWriteFrameID);
                    yield toWriteFrameDef.impl.write(frame, stream, head);
                }
            }
            else {
                yield orgDef.impl.write(frame, stream, head);
            }
            data = stream.toBuffer();
            if ((frameHead.formatFlags) && (frameHead.formatFlags.compressed)) {
                const sizebytes = id3v2_consts_1.ID3v2_FRAME_HEADER_LENGTHS.SIZE[head.ver];
                const uncompressedStream = new streams_1.MemoryWriterStream();
                if (sizebytes === 4) {
                    uncompressedStream.writeUInt4Byte(data.length);
                }
                else {
                    uncompressedStream.writeUInt3Byte(data.length);
                }
                data = buffer_1.BufferUtils.concatBuffer(uncompressedStream.toBuffer(), zlib.deflateSync(data));
            }
            else if ((frameHead.formatFlags) && (frameHead.formatFlags.data_length_indicator)) {
                const dataLengthStream = new streams_1.MemoryWriterStream();
                dataLengthStream.writeSyncSafeInt(data.length);
                data = buffer_1.BufferUtils.concatBuffer(dataLengthStream.toBuffer(), data);
            }
        }
        if (frameHead.formatFlags.grouping) {
            if (frame.groupId === undefined) {
                return Promise.reject(Error('Missing frame groupId but flag is set'));
            }
            const buf = buffer_1.BufferUtils.zeroBuffer(1);
            buf[0] = frame.groupId;
            data = buffer_1.BufferUtils.concatBuffer(buf, data);
        }
        return { id: id, start: 0, end: 0, size: data.length, data: data, statusFlags: frameHead.statusFlags, formatFlags: frameHead.formatFlags };
    });
}
function isKnownFrameId(id) {
    return !!findId3v2FrameDef(id);
}
exports.isKnownFrameId = isKnownFrameId;
function isValidFrameBinId(id) {
    return !!findId3v2FrameDefBuffer(id);
}
exports.isValidFrameBinId = isValidFrameBinId;
function isValidFrameId(id) {
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
exports.isValidFrameId = isValidFrameId;
function writeSubFrames(frames, stream, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const writer = new id3v2_writer_1.Id3v2RawWriter(stream, head);
        const rawframes = yield writeToRawFrames(frames, head);
        for (const frame of rawframes) {
            yield writer.writeFrame(frame);
        }
    });
}
exports.writeSubFrames = writeSubFrames;
function readSubFrames(bin, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const subtag = { id: 'ID3v2', head, frames: [], start: 0, end: 0 };
        const reader = new id3v2_reader_1.ID3v2Reader();
        const buffer = yield reader.readFrames(bin, subtag);
        const t = yield id3v2_1.buildID3v2(subtag);
        return t.frames;
    });
}
exports.readSubFrames = readSubFrames;
function writeToRawFrames(frames, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        for (const frame of frames) {
            const raw = yield writeToRawFrame(frame, head);
            result.push(raw);
        }
        return result;
    });
}
exports.writeToRawFrames = writeToRawFrames;
function ensureID3v2FrameVersionDef(id, dest) {
    const def = exports.FrameDefs[id];
    if (!def) {
        return null;
    }
    if (def.versions.indexOf(dest) >= 0) {
        return id;
    }
    if (def.versions[0] > dest) {
        const downgradeKey = Object.keys(exports.FrameDefs).find(key => {
            return exports.FrameDefs[key].upgrade === id;
        });
        if (!downgradeKey) {
            return null;
        }
        const f2 = exports.FrameDefs[downgradeKey];
        if (f2.versions.indexOf(dest) < 0) {
            if (f2.versions[0] > dest) {
                return ensureID3v2FrameVersionDef(downgradeKey, dest);
            }
            else {
                return null;
            }
        }
        else {
            return downgradeKey;
        }
    }
    else {
        if (!def.upgrade) {
            return null;
        }
        const upgradeKey = def.upgrade;
        const f2 = exports.FrameDefs[upgradeKey];
        if (f2.versions.indexOf(dest) < 0) {
            if (f2.versions[0] < dest) {
                return ensureID3v2FrameVersionDef(upgradeKey, dest);
            }
            else {
                return null;
            }
        }
        else {
            return upgradeKey;
        }
    }
}
exports.ensureID3v2FrameVersionDef = ensureID3v2FrameVersionDef;
function readID3v2Frame(rawFrame, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = matchFrame(rawFrame.id);
        let groupId;
        if (rawFrame.formatFlags && rawFrame.formatFlags.grouping) {
            groupId = rawFrame.data[0];
            rawFrame.data = rawFrame.data.slice(1);
        }
        const frame = {
            id: rawFrame.id,
            head: {
                encoding: undefined,
                statusFlags: rawFrame.statusFlags,
                formatFlags: rawFrame.formatFlags,
                size: rawFrame.size
            },
            value: {}
        };
        let result;
        try {
            yield processRawFrame(rawFrame, head);
            const reader = new streams_1.DataReader(rawFrame.data);
            result = yield f.impl.parse(reader, rawFrame, head);
            if (frame.head) {
                frame.head.encoding = result.encoding ? result.encoding.name : undefined;
            }
            frame.value = result.value || { bin: rawFrame.data };
            if (result.subframes) {
                frame.subframes = result.subframes;
            }
        }
        catch (e) {
            frame.invalid = e.toString();
            frame.value = { bin: rawFrame.data };
        }
        if (groupId) {
            frame.groupId = groupId;
        }
        frame.title = f.title;
        return frame;
    });
}
exports.readID3v2Frame = readID3v2Frame;
//# sourceMappingURL=id3v2_frames.js.map