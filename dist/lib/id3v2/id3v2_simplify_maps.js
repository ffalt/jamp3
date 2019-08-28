"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_frames_1 = require("./id3v2_frames");
exports.PRIVMap = {};
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
    Object.keys(id3v2_frames_1.FrameDefs).forEach(key => {
        const frame = id3v2_frames_1.findId3v2FrameDef(key);
        if (!frame) {
            console.error('DEVELOPER ERROR: Unknown frame id \'' + key + '\' in simplify list');
        }
        else {
            const slug = (['TXXX', 'UFID', 'COMM', 'PRIV', 'WXXX', 'LINK', 'TIPL', 'TMCL'].indexOf(key) >= 0) || exports.FramesMap[key] ||
                exports.TXXXMap[key] || exports.UFIDMap[key] || exports.COMMMap[key] || exports.PRIVMap[key] || exports.SplitFrameMap[key] || exports.DateUpgradeMap[key];
            if (!slug) {
                if (frame.versions.indexOf(4) >= 0) {
                    console.error('DEVELOPER ERROR: Add a slug for the 2.4 frame \'' + key + '\': \'' + id3v2_frames_1.FrameDefs[key].title.toLowerCase().replace(/ /g, '_') + '\',');
                }
                else if (!frame.upgrade) {
                    console.error('DEVELOPER ERROR: Add a slug for the ' + frame.versions.join('/') + ' frame \'' + key + '\': \'' + id3v2_frames_1.FrameDefs[key].title.toLowerCase().replace(/ /g, '_') + '\',');
                }
            }
        }
    });
}
function simplifyFrame(frame, dropIDsList) {
    const id = id3v2_frames_1.ensureID3v2FrameVersionDef(frame.id, 4) || frame.id;
    if (dropIDsList && dropIDsList.indexOf(frame.id) >= 0) {
        return null;
    }
    let slug = exports.FramesMap[id];
    if (id === 'UFID') {
        const value = frame.value;
        if (value && value.id) {
            slug = exports.UFIDMap[value.id] || ('UFID|' + value.id);
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'TXXX') {
        const value = frame.value;
        if (value && value.id) {
            slug = exports.TXXXMap[value.id] || exports.TXXXMap[value.id.toUpperCase()] || ('TXXX|' + value.id);
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'COMM') {
        const value = frame.value;
        if (value && value.id) {
            slug = exports.COMMMap[value.id] || ('COMM|' + value.id);
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'PRIV') {
        const value = frame.value;
        if (value && value.id) {
            slug = exports.PRIVMap[value.id] || ('PRIV|' + value.id);
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'WXXX') {
        const value = frame.value;
        if (value && value.id) {
            slug = 'WXXX|' + value.id;
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'LINK') {
        const value = frame.value;
        if (value && value.id) {
            slug = 'LINK|' + value.id;
        }
        else if (value) {
            slug = id;
        }
        else {
            return null;
        }
    }
    else if (id === 'TIPL' || id === 'TMCL') {
        const value = frame.value;
        const knownSections = {
            'arranger': 'ARRANGER',
            'engineer': 'ENGINEER',
            'DJ-mix': 'DJMIXER',
            'mix': 'MIXER',
            'producer': 'PRODUCER',
            'instrument': 'PERFORMER'
        };
        const list = [];
        let i = 0;
        while (i < value.list.length - 1) {
            slug = knownSections[value.list[i]];
            const val = knownSections[value.list[i]];
            if (val) {
                if (slug) {
                    list.push({ slug, text: val });
                }
                else {
                    list.push({ slug: id + '|' + value.list[i], text: val });
                }
            }
            i += 2;
        }
        return list;
    }
    if (!slug) {
        return null;
    }
    const frameDef = id3v2_frames_1.matchFrame(id);
    const text = frameDef.impl.simplify(frame.value);
    if (text && exports.SplitFrameMap[id]) {
        const names = exports.SplitFrameMap[id];
        const split = text.split('/');
        const result = [];
        if (split[0]) {
            result.push({ slug: names[0], text: split[0] });
        }
        if (split[1]) {
            result.push({ slug: names[1], text: split[1] });
        }
        return result;
    }
    if (text) {
        return [{ slug, text }];
    }
    return null;
}
exports.simplifyFrame = simplifyFrame;
//# sourceMappingURL=id3v2_simplify_maps.js.map