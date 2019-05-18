"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_frames_1 = require("./id3v2_frames");
const PRIVMap = {};
const COMMMap = {
    'description': 'COMMENT',
    'comment': 'COMMENT'
};
const UFIDMap = {
    'http://musicbrainz.org': 'MUSICBRAINZ_TRACKID'
};
const TXXXMap = {
    'ORIGINALYEAR': 'ORIGINALYEAR',
    'REPLAYGAIN_TRACK_GAIN': 'REPLAYGAIN_TRACK_GAIN',
    'REPLAYGAIN_ALBUM_GAIN': 'REPLAYGAIN_ALBUM_GAIN',
    'REPLAYGAIN_TRACK_PEAK': 'REPLAYGAIN_TRACK_PEAK',
    'REPLAYGAIN_ALBUM_PEAK': 'REPLAYGAIN_ALBUM_PEAK',
    'MusicIP PUID': 'MUSICIP_PUID',
    'Acoustid Fingerprint': 'ACOUSTID_FINGERPRINT',
    'Acoustid Id': 'ACOUSTID_ID',
    'MusicBrainz Recording Id': 'MUSICBRAINZ_TRACKID',
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
const FramesMap = {
    'TALB': 'ALBUM',
    'TSOA': 'ALBUMSORT',
    'TIT2': 'TITLE',
    'TSOT': 'TITLESORT',
    'TIT1': 'WORK',
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
    'GRP1': 'GROUPING',
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
const SplitFrameMap = {
    'TRCK': ['TRACKNUMBER', 'TRACKTOTAL'],
    'MVIN': ['MOVEMENT', 'MOVEMENTTOTAL'],
    'TPOS': ['DISCNUMBER', 'DISCTOTAL']
};
const DateUpgradeMap = {
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
            const slug = (['TXXX', 'UFID', 'COMM', 'PRIV', 'WXXX', 'LINK', 'TIPL', 'TMCL'].indexOf(key) >= 0) || FramesMap[key] ||
                TXXXMap[key] || UFIDMap[key] || COMMMap[key] || PRIVMap[key] || SplitFrameMap[key] || DateUpgradeMap[key];
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
    let slug = FramesMap[id];
    if (id === 'UFID') {
        const value = frame.value;
        if (value && value.id) {
            slug = UFIDMap[value.id] || ('UFID|' + value.id);
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
            slug = TXXXMap[value.id] || TXXXMap[value.id.toUpperCase()] || ('TXXX|' + value.id);
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
            slug = COMMMap[value.id] || ('COMM|' + value.id);
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
            slug = PRIVMap[value.id] || ('PRIV|' + value.id);
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
    if (text && SplitFrameMap[id]) {
        const names = SplitFrameMap[id];
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
function simplifyTag(tag, dropIDsList) {
    const result = {};
    const slugcounter = {};
    const frames = tag.frames.filter(f => !DateUpgradeMap[f.id]);
    const dateframes = tag.frames.filter(f => !!DateUpgradeMap[f.id]);
    const dateFrame = id3v2_frames_1.upgrade23DateFramesTov24Date(dateframes);
    if (dateFrame) {
        frames.push(dateFrame);
    }
    frames.forEach((frame) => {
        const simples = simplifyFrame(frame, dropIDsList);
        if (simples) {
            for (const simple of simples) {
                const count = (slugcounter[simple.slug] || 0) + 1;
                slugcounter[simple.slug] = count;
                const name = simple.slug + (count > 1 ? '|' + count : '');
                result[name] = simple.text;
            }
        }
    });
    return result;
}
exports.simplifyTag = simplifyTag;
//# sourceMappingURL=id3v2_simplify.js.map