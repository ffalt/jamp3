"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUpgradeMap = exports.SplitFrameMap = exports.FramesMap = exports.TXXXMap = exports.UFIDMap = exports.COMMMap = exports.WMMediaClassPrimaryIDs = exports.PRIVWideStringOwners = exports.PRIVGuidOwners = exports.PRIVNumericOwners = exports.PRIVMap = void 0;
const id3v2_frame_defs_1 = require("./frames/id3v2.frame.defs");
const id3v2_frame_match_1 = require("./frames/id3v2.frame.match");
exports.PRIVMap = {
    'AverageLevel': 'AVERAGELEVEL',
    'PeakValue': 'PEAKVALUE',
    'WM/MediaClassPrimaryID': 'WM_MEDIACLASSPRIMARYID',
    'WM/MediaClassSecondaryID': 'WM_MEDIACLASSSECONDARYID',
    'WM/WMContentID': 'WM_CONTENTID',
    'WM/WMCollectionID': 'WM_COLLECTIONID',
    'WM/WMCollectionGroupID': 'WM_COLLECTIONGROUPID',
    'WM/Provider': 'WM_PROVIDER',
    'WM/UniqueFileIdentifier': 'WM_UNIQUEFILEIDENTIFIER',
    'WM/Mood': 'WM_MOOD'
};
exports.PRIVNumericOwners = new Set(['AverageLevel', 'PeakValue']);
exports.PRIVGuidOwners = new Set([
    'WM/MediaClassPrimaryID',
    'WM/MediaClassSecondaryID',
    'WM/WMContentID',
    'WM/WMCollectionID',
    'WM/WMCollectionGroupID'
]);
exports.PRIVWideStringOwners = new Set(['WM/Provider', 'WM/UniqueFileIdentifier', 'WM/Mood']);
exports.WMMediaClassPrimaryIDs = {
    music: 'D1607DBC-E323-4BE2-86A1-48A42A28441E',
    video: 'DB9830BD-3AB3-4FAB-8A37-1A995F7FF74B',
    nonMusicAudio: '01CD0F29-DA4E-4157-897B-6275D50C4F11',
    other: 'FCF24A76-9A57-4036-990D-E35DD8B244E1'
};
exports.COMMMap = {
    'description': 'COMMENT',
    'comment': 'COMMENT'
};
exports.UFIDMap = {
    'http://musicbrainz.org': 'MUSICBRAINZ_TRACKID'
};
exports.TXXXMap = {
    'ORIGINALYEAR': 'ORIGINALYEAR',
    'REPLAYGAIN_TRACK_GAIN': 'REPLAYGAIN_TRACK_GAIN',
    'REPLAYGAIN_ALBUM_GAIN': 'REPLAYGAIN_ALBUM_GAIN',
    'REPLAYGAIN_TRACK_PEAK': 'REPLAYGAIN_TRACK_PEAK',
    'REPLAYGAIN_ALBUM_PEAK': 'REPLAYGAIN_ALBUM_PEAK',
    'MusicIP PUID': 'MUSICIP_PUID',
    'Acoustid Fingerprint': 'ACOUSTID_FINGERPRINT',
    'Acoustid Id': 'ACOUSTID_ID',
    'MusicBrainz Recording Id': 'MUSICBRAINZ_TRACKID',
    'MusicBrainz Track Id': 'MUSICBRAINZ_TRACKID',
    'MusicBrainz Disc Id': 'MUSICBRAINZ_DISCID',
    'MusicBrainz TRM Id': 'MUSICBRAINZ_TRMID',
    'MusicBrainz Work Id': 'MUSICBRAINZ_WORKID',
    'MusicBrainz Release Group Id': 'MUSICBRAINZ_RELEASEGROUPID',
    'MusicBrainz Album Artist Id': 'MUSICBRAINZ_ALBUMARTISTID',
    'MusicBrainz Original Artist Id': 'MUSICBRAINZ_ORIGINALARTISTID',
    'MusicBrainz Artist Id': 'MUSICBRAINZ_ARTISTID',
    'MusicBrainz Original Album Id': 'MUSICBRAINZ_ORIGINALALBUMID',
    'MusicBrainz Album Id': 'MUSICBRAINZ_ALBUMID',
    'MusicBrainz Release Track Id': 'MUSICBRAINZ_RELEASETRACKID',
    'MusicBrainz Album Release Country': 'RELEASECOUNTRY',
    'MusicBrainz Album Type': 'RELEASETYPE',
    'MusicBrainz Album Status': 'RELEASESTATUS',
    'Discogs Artist ID': 'DISCOGS_ARTIST_ID',
    'Discogs Album Artist ID': 'DISCOGS_ALBUM_ARTIST_ID',
    'Discogs Label ID': 'DISCOGS_LABEL_ID',
    'Discogs Release ID': 'DISCOGS_RELEASE_ID',
    'Discogs Master Release ID': 'DISCOGS_MASTER_RELEASE_ID',
    'Discogs Votes': 'DISCOGS_VOTES',
    'Discogs Rating': 'DISCOGS_RATING',
    'ASIN': 'ASIN',
    'BARCODE': 'BARCODE',
    'SCRIPT': 'SCRIPT',
    'CATALOGNUMBER': 'CATALOGNUMBER',
    'WORK': 'WORK',
    'ARTISTS': 'ARTISTS',
    'COMPOSERSORT': 'COMPOSERSORT',
    'WRITER': 'WRITER',
    'SHOWMOVEMENT': 'SHOWMOVEMENT',
    'LICENSE': 'LICENSE',
    'ALBUM ARTIST': 'ALBUMARTIST',
    'ALBUMARTISTSORT': 'ALBUMARTISTSORT',
    'ORGANIZATION': 'ORGANIZATION',
    'REPLAY GAIN': 'REPLAYGAIN',
    'PARTNUMBER': 'PARTNUMBER',
    'PEAK LEVEL': 'PEAKLEVEL',
    'Tagging time': 'TAGGINGTIME',
    'TOTALDISCS': 'TOTALDISCS',
    'PERFORMER': 'PERFORMER'
};
exports.FramesMap = {
    'TALB': 'ALBUM',
    'TSOA': 'ALBUMSORT',
    'TIT2': 'TITLE',
    'TSOT': 'TITLESORT',
    'TIT1': 'GROUPING',
    'TPE1': 'ARTIST',
    'TSOP': 'ARTISTSORT',
    'TPE2': 'ALBUMARTIST',
    'TSO2': 'ALBUMARTISTSORT',
    'TDRC': 'DATE',
    'TOAL': 'ORIGINALALBUM',
    'TOPE': 'ORIGINALARTIST',
    'TDOR': 'ORIGINALDATE',
    'TORY': 'ORIGINALYEAR',
    'TCOM': 'COMPOSER',
    'TSOC': 'COMPOSERSORT',
    'TEXT': 'LYRICIST',
    'TPE3': 'CONDUCTOR',
    'TPE4': 'REMIXER',
    'TPUB': 'LABEL',
    'MVNM': 'MOVEMENTNAME',
    'GRP1': 'WORK',
    'TIT3': 'SUBTITLE',
    'TSST': 'DISCSUBTITLE',
    'TCMP': 'COMPILATION',
    'TCON': 'GENRE',
    'TBPM': 'BPM',
    'TMOO': 'MOOD',
    'USLT': 'LYRICS',
    'TMED': 'MEDIA',
    'TLAN': 'LANGUAGE',
    'TCOP': 'COPYRIGHT',
    'WCOP': 'LICENSE',
    'TENC': 'ENCODEDBY',
    'TSSE': 'ENCODERSETTINGS',
    'TSRC': 'ISRC',
    'WOAR': 'WEBSITE',
    'TKEY': 'KEY',
    'TLEN': 'TRACKLENGTH',
    'PCST': 'PODCAST',
    'TDES': 'PODCAST_DESCRIPTION',
    'TKWD': 'PODCAST_KEYWORDS',
    'TOLY': 'ORIGINALLYICIST',
    'TFLT': 'FILETYPE',
    'TOWN': 'FILEOWNER',
    'TRSN': 'RADIOSTATIONNAME',
    'TRSO': 'RADIOSTATIONOWNER',
    'TOFN': 'ORIGINALFILENAME',
    'TDLY': 'PLAYLISTDELAY',
    'TDEN': 'ENCODINGTIME',
    'TPRO': 'PRODUCEDNOTICE',
    'TSIZ': 'AUDIOSTREAMSIZE',
    'WCOM': 'COMMERCIALINFORMATIONURL',
    'WOAF': 'FILEWEBPAGEURL',
    'WOAS': 'AUDIOSOURCEWWEBPAGEURL',
    'WORS': 'RADIOSTATIONWEBPAGEURL',
    'WPAY': 'PAYMENTURL',
    'WPUB': 'PUBLISHERURL',
    'OWNE': 'OWNERSHIP',
    'USER': 'TERMSOFUSE',
    'GRID': 'GROUPIDREGISTRATION',
    'SIGN': 'SIGNATURE',
    'SEEK': 'SEEK',
    'ASPI': 'AUDIOSEEKPOINTINDEX',
    'RGAD': 'REPLAYGAINADJUSTMENT',
    'TGID': 'PODCASTID',
    'WFED': 'PODCASTFEEDURL',
    'CHAP': 'CHAPTER',
    'CTOC': 'CHAPTERTOC',
    'APIC': 'PICTURE',
    'RVRB': 'REVERB',
    'EQUA': 'EQUALISATION',
    'PCNT': 'PLAYCOUNTER',
    'GEOB': 'GENERALENCAPSULATEDOBJECT',
    'RBUF': 'RECOMMENDEDBUFFERSIZE',
    'MCDI': 'MUSICCDID',
    'MLLT': 'MPEGLOCATIONLOOKUPTABLE',
    'SYTC': 'SYNCHRONISEDTEMPOCODES',
    'SYLT': 'SYNCHRONISEDLYRICS',
    'TDRL': 'RELEASETIME',
    'TDTG': 'TAGGINGTIME',
    'ETCO': 'EVENTTIMINGCODE',
    'POPM': 'RATING',
    'AENC': 'AUDIOENCRYPTION',
    'RVAD': 'RELATIVEVOLUMEADJUSTMENT',
    'RVA2': 'RELATIVEVOLUMEADJUSTMENT',
    'COMR': 'COMMERCIAL',
    'ENCR': 'ENCRYPTIONMETHODREGISTRATION',
    'NCON': 'MUSICMATCH',
    'POSS': 'POSITIONSYNCHRONISATION',
    'XHD3': 'MP3HD',
    'TRDA': 'RECORDINGDATES',
    'CDM': 'COMPRESSEDMETA',
    'CRM': 'ENCRYPTEDMETA',
    'TRCK': 'TRACKNUMBER',
    'MVIN': 'MOVEMENT',
    'TPOS': 'DISCNUMBER'
};
exports.SplitFrameMap = {
    'TRCK': ['TRACKNUMBER', 'TRACKTOTAL'],
    'MVIN': ['MOVEMENT', 'MOVEMENTTOTAL'],
    'TPOS': ['DISCNUMBER', 'DISCTOTAL']
};
exports.DateUpgradeMap = {
    'TYER': 'Year',
    'TDAT': 'Date',
    'TIME': 'Time'
};
if (process.env.NODE_ENV === 'development') {
    for (const key of Object.keys(id3v2_frame_defs_1.FrameDefs)) {
        const frame = (0, id3v2_frame_match_1.findId3v2FrameDef)(key);
        if (frame) {
            const slug = ['TXXX', 'UFID', 'COMM', 'PRIV', 'WXXX', 'LINK', 'TIPL', 'TMCL'].includes(key) ||
                exports.FramesMap[key] || exports.TXXXMap[key] || exports.UFIDMap[key] || exports.COMMMap[key] || exports.PRIVMap[key] || exports.SplitFrameMap[key] || exports.DateUpgradeMap[key];
            if (!slug) {
                if (frame.versions.includes(4)) {
                    console.error(`DEVELOPER ERROR: Add a slug for the 2.4 frame '${key}': '${id3v2_frame_defs_1.FrameDefs[key].title.toLowerCase().replaceAll(' ', '_')}',`);
                }
                else if (!frame.upgrade) {
                    console.error(`DEVELOPER ERROR: Add a slug for the ${frame.versions.join('/')} frame '${key}': '${id3v2_frame_defs_1.FrameDefs[key].title.toLowerCase().replaceAll(' ', '_')}',`);
                }
            }
        }
        else {
            console.error(`DEVELOPER ERROR: Unknown frame id '${key}' in simplify list`);
        }
    }
}
//# sourceMappingURL=id3v2.simplify.maps.js.map