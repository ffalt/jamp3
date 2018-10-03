import {IID3V2} from './id3v2__types';
import {FrameDefs, matchFrame} from './id3v2_frames';

const TXXXMap: { [key: string]: string; } = {
	'ASIN': 'asin',
	'CATALOGNUMBER': 'catalognumber',
	'SCRIPT': 'script',
	'BARCODE': 'barcode',
	'originalyear': 'originalyear',
	'replaygain_track_gain': 'replaygain_track_gain',
	'replaygain_album_gain': 'replaygain_album_gain',
	'replaygain_track_peak': 'replaygain_track_peak',
	'replaygain_album_peak': 'replaygain_album_peak',
	'Artists': 'artists',
	'Acoustid Id': 'ACOUSTID',
	'MusicBrainz Album Type': 'ALBUMTYPE',
	'MusicBrainz Album Artist Id': 'ALBUMARTISTID',
	'MusicBrainz Artist Id': 'ARTISTID',
	'MusicBrainz Album Id': 'ALBUMID',
	'MusicBrainz Release Track Id': 'RELEASETRACKID',
	'MusicBrainz Release Group Id': 'RELEASEGROUPID',
	'MusicBrainz Recording Id': 'RECORDINGID',
	'MusicBrainz Album Status': 'ALBUMSTATUS',
	'MusicBrainz Album Release Country': 'RELEASECOUNTRY',
	'MusicBrainz TRM Id': 'TRMID'
};

const slugMap: { [key: string]: string; } = {
	'TIT2': 'title',
	'TPE1': 'artist',
	'TSOP': 'artist_sort',
	'TPE2': 'album_artist',
	'TSO2': 'album_artist_sort',
	'TRCK': 'track',
	'TALB': 'album',
	'TCON': 'genre',
	'TMED': 'media',
	'TDRC': 'date',
	'TDOR': 'release_date',
	'TYER': 'year',
	'TDLR': 'release_year',
	'TPOS': 'disc',
	'TPUB': 'publisher',
	'TSRC': 'isrc',
	'TSST': 'set_subtitle',
	'TIPL': 'involved_people',
	'TCOM': 'composer',
	'TSOC': 'composer_sort',
	'TMCL': 'musicians_credits',
	'TLAN': 'language',
	'TLEN': 'length',
	'TSSE': 'encoder',
	'TIT1': 'content_group',
	'TEXT': 'lyricist',
	'USLT': 'unsync_lyric',
	'TENC': 'encoded_by',
	'COMM': 'comment',
	'TOPE': 'original_artist',
	'TDRL': 'release_time',
	'TKEY': 'initial_key',
	'TORY': 'original_release_year',
	'TMOO': 'mood',
	'TIME': 'time',
	'TIM': 'time',
	'TFLT': 'file_type',
	'BPM': 'bpm',
	'TBPM': 'bpm',
	'WCP': 'copyright',
	'WCOP': 'copyright',
	'TCOP': 'copyright_msg',
	'WPUB': 'publishers_official_webpage',
	'TOT': 'original_album',
	'TOAL': 'original_album',
	'UFI': 'unique_file_identifier',
	'CRM': 'encrypted_meta',
	'TT1': 'content_group_description',
	'TT2': 'title',
	'TT3': 'subtitle',
	'TP1': 'artist',
	'TP2': 'band',
	'TP3': 'conductor',
	'TP4': 'interpreted_by',
	'TCM': 'composer',
	'TXT': 'lyricist',
	'TLA': 'languages',
	'TCO': 'genre',
	'TAL': 'album',
	'TPA': 'part_of_a_set',
	'TRK': 'track',
	'TRC': 'isrc',
	'TYE': 'year',
	'TDA': 'date',
	'TRD': 'recording_dates',
	'TMT': 'media_type',
	'TBP': 'bpm',
	'TCR': 'copyright_message',
	'TPB': 'publisher',
	'TEN': 'encoded_by',
	'TSS': 'encoding_software',
	'TOF': 'original_filename',
	'TLE': 'length',
	'TSI': 'size',
	'TDY': 'playlist_delay',
	'TKE': 'initial_key',
	'TOL': 'original_lyricist',
	'TOA': 'original_artist',
	'TOR': 'original_release_year',
	'TXX': 'user_defined_text',
	'WAF': 'official_audio_file_webpage',
	'WAR': 'official_artist',
	'WAS': 'official_audio_source_webpage',
	'WCM': 'commercial_information',
	'WPB': 'publishers_official_webpage',
	'WXX': 'user_defined_url_link_frame',
	'IPL': 'involved_people_list',
	'ETC': 'event_timing_codes',
	'MLL': 'mpeg_location_lookup_table',
	'STC': 'synchronised_tempo_codes',
	'ULT': 'unsychronized_lyric',
	'SLT': 'synchronised_lyrics',
	'COM': 'comments',
	'RVA': 'relative_volume_adjustment',
	'EQU': 'equalisation',
	'REV': 'reverb',
	'PIC': 'attached_picture',
	'GEO': 'general_encapsulated_object',
	'CNT': 'play_counter',
	'POP': 'popularimeter',
	'BUF': 'recommended_buffer_size',
	'CRA': 'audio_encryption',
	'LNK': 'linked_information',
	'NCO': 'musicmatch_binary',
	'PRI': 'private_frame',
	'TCP': 'itunes_compilation_flag',
	'TST': 'title_sort_order',
	'TSP': 'performer_sort_order',
	'TSA': 'album_sort_order',
	'TS2': 'album_artist_sort_order',
	'TSC': 'composer_sort_order',
	'TDR': 'release_time',
	'TDS': 'itunes_podcast_description',
	'TID': 'podcast_url',
	'WFD': 'podcast_feed_url',
	'PCS': 'itunes_podcast_marker',
	'XSOA': 'album_sort_order',
	'XSOP': 'performer_sort_order',
	'XSOT': 'title_sort_order',
	'XDOR': 'original_release_time',
	'TIT3': 'subtitle',
	'TPE3': 'conductor',
	'TPE4': 'interpreted_by',
	'TOLY': 'original_lyricist',
	'TOWN': 'file_owner',
	'TRSN': 'internet_radio_station_name',
	'TRSO': 'internet_radio_station_owner',
	'TOFN': 'original_filename',
	'TDLY': 'playlist_delay',
	'TDAT': 'date',
	'TRDA': 'recording_dates',
	'TSIZ': 'size',
	'TPRO': 'produced_notice',
	'TDTG': 'tagging_time',
	'TSOA': 'album_sort_order',
	'TSOT': 'title_sort_order',
	'WCOM': 'commercial_information',
	'WOAF': 'official_audio_file_webpage',
	'WOAR': 'official_artist',
	'WOAS': 'official_audio_source_webpage',
	'WORS': 'official_internet_radio_station_homepage',
	'WPAY': 'payment',
	'TXXX': 'user_defined_text',
	'WXXX': 'user_defined_url_link_frame',
	'UFID': 'unique_file_identifier',
	'MCDI': 'music_cd_identifier',
	'ETCO': 'event_timing_codes',
	'MLLT': 'mpeg_location_lookup_table',
	'SYTC': 'synchronised_tempo_codes',
	'SYLT': 'synchronised_lyrics',
	'RVAD': 'relative_volume_adjustment',
	'RVA2': 'relative_volume_adjustment_2',
	'EQUA': 'equalisation',
	'RVRB': 'reverb',
	'APIC': 'attached_picture',
	'GEOB': 'general_encapsulated_object',
	'PCNT': 'play_counter',
	'POPM': 'popularimeter',
	'RBUF': 'recommended_buffer_size',
	'AENC': 'audio_encryption',
	'LINK': 'linked_information',
	'POSS': 'position_synchronisation',
	'USER': 'terms_of_use',
	'OWNE': 'ownership',
	'COMR': 'commercial',
	'ENCR': 'encryption_method_registration',
	'GRID': 'group_id_registration',
	'PRIV': 'private_frame',
	'IPLS': 'involved_people_list',
	'SIGN': 'signature',
	'SEEK': 'seek',
	'ASPI': 'audio_seek_point_index',
	'RGAD': 'replay_gain_adjustment',
	'TCMP': 'itunes_compilation_flag',
	'PCST': 'itunes_podcast_marker',
	'TDES': 'itunes_podcast_description',
	'TKWD': 'itunes_podcast_keywords',
	'TGID': 'podcast_url',
	'WFED': 'podcast_feed_url',
	'NCON': 'musicmatch_binary',
	'CTOC': 'chapter_toc',
	'CHAP': 'chapter',
	'XHD3': 'mp3hd',
	'CM1': 'ext_comment',
	'CDM': 'compressed_data_metaframe'
};

Object.keys(FrameDefs).forEach(key => {
	const slug = slugMap[key];
	if (!slug) {
		console.log('DEVELOPER ERROR: Add a slug for the frame \'' + key + '\': \'' + FrameDefs[key].title.toLowerCase().replace(/ /g, '_') + '\',');
	}
});

export function simplyfyFrame(frame: IID3V2.Frame): { slug: string; text: string; } | null {
	let slug = slugMap[frame.id];
	if (!slug) {
		// console.log('TODO: slug name for frame ', frame.id);
		return null;
	}
	if (frame.id === 'UFID') {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id === 'http://musicbrainz.org') {
			slug = 'TRACKID';
		}
	}
	if (['TXX', 'TXXX'].indexOf(frame.id) >= 0) {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id) {
			slug = TXXXMap[value.id];
			if (!slug) {
				slug = 'T|' + value.id;
			}
		} else {
			return null;
		}
	}
	if (['COM', 'COMM'].indexOf(frame.id) >= 0) {
		const value = <IID3V2.FrameValue.LangDescText>frame.value;
		if (value && value.id) {
			slug = 'C|' + value.id;
		} else {
			return null;
		}
	}
	if (['PRI', 'PRIV'].indexOf(frame.id) >= 0) {
		const value = <IID3V2.FrameValue.IdBin>frame.value;
		if (value && value.id) {
			slug = 'P|' + value.id;
		} else {
			return null;
		}
	}
	if (['WXX', 'WXXX'].indexOf(frame.id) >= 0) {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id) {
			slug = 'W|' + value.id;
		} else {
			return null;
		}
	}
	const frameDef = matchFrame(frame.id);
	const text = frameDef.impl.simplify(frame.value);
	if (text) {
		return {slug, text};
	}
	return null;
}

export function simplifyTag(tag: IID3V2.Tag): IID3V2.TagSimplified {
	const result: IID3V2.TagSimplified = {};
	const slugcounter: { [name: string]: number } = {};
	tag.frames.forEach((frame: IID3V2.Frame) => {
		const simple = simplyfyFrame(frame);
		if (simple) {
			const count = (slugcounter[simple.slug] || 0) + 1;
			slugcounter[simple.slug] = count;
			if (['track', 'year', 'disc'].indexOf(simple.slug) >= 0) {
				if (simple.text.indexOf('/') >= 0) {
					simple.text = simple.text.slice(0, simple.text.indexOf('/'));
				}
				const i = parseInt(simple.text, 10);
				if (!isNaN(i)) {
					(<any>result)[simple.slug + (count > 1 ? '|' + count : '')] = i;
				}
			} else {
				(<any>result)[simple.slug + (count > 1 ? '|' + count : '')] = simple.text;
			}
		}
	});
	return result;
}

