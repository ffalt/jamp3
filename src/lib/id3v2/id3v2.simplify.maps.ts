import {FrameDefs} from './frames/id3v2.frame.defs';
import {findId3v2FrameDef} from './frames/id3v2.frame.match';

export const PRIVMap: { [key: string]: string; } = {};

export const COMMMap: { [key: string]: string; } = {
	'description': 'COMMENT',
	'comment': 'COMMENT'
};

export const UFIDMap: { [key: string]: string; } = {
	'http://musicbrainz.org': 'MUSICBRAINZ_TRACKID'
};

export const TXXXMap: { [key: string]: string; } = {
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

export const FramesMap: { [key: string]: string; } = {
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

export const SplitFrameMap: { [key: string]: Array<string>; } = {
	'TRCK': ['TRACKNUMBER', 'TRACKTOTAL'],
	'MVIN': ['MOVEMENT', 'MOVEMENTTOTAL'],
	'TPOS': ['DISCNUMBER', 'DISCTOTAL']
};

export const DateUpgradeMap: { [key: string]: string; } = {
	'TYER': 'Year',
	'TDAT': 'Date',
	'TIME': 'Time'
};

/**
 TODO: simplify following frames more like in style VORBISCOMMENT
 POPM    RATING:user@email
 Chapter tags        CHAPTERxxx
 */

if (process.env.NODE_ENV === 'development') {
	Object.keys(FrameDefs).forEach(key => {
		const frame = findId3v2FrameDef(key);
		if (!frame) {
			console.error('DEVELOPER ERROR: Unknown frame id \'' + key + '\' in simplify list');
		} else {
			const slug = (['TXXX', 'UFID', 'COMM', 'PRIV', 'WXXX', 'LINK', 'TIPL', 'TMCL'].indexOf(key) >= 0) || FramesMap[key] ||
				TXXXMap[key] || UFIDMap[key] || COMMMap[key] || PRIVMap[key] || SplitFrameMap[key] || DateUpgradeMap[key];
			if (!slug) {
				if (frame.versions.indexOf(4) >= 0) {
					console.error('DEVELOPER ERROR: Add a slug for the 2.4 frame \'' + key + '\': \'' + FrameDefs[key].title.toLowerCase().replace(/ /g, '_') + '\',');
				} else if (!frame.upgrade) {
					console.error('DEVELOPER ERROR: Add a slug for the ' + frame.versions.join('/') + ' frame \'' + key + '\': \'' + FrameDefs[key].title.toLowerCase().replace(/ /g, '_') + '\',');
				}
			}
		}
	});
}

