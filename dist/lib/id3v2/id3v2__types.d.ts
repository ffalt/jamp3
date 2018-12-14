/// <reference types="node" />
import { ITag } from '../common/types';
export declare namespace IID3V2 {
    namespace FrameValue {
        interface Base {
        }
        interface IdAscii extends Base {
            id: string;
            text: string;
        }
        interface LangDescText extends Base {
            language: string;
            id: string;
            text: string;
        }
        interface Pic extends Base {
            description: string;
            pictureType: number;
            url?: string;
            bin?: Buffer;
            mimeType?: string;
        }
        interface Bin {
            bin: Buffer;
        }
        interface Number extends Base {
            num: number;
        }
        interface RVA extends Base {
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
        interface RVA2Channel extends Base {
            type: number;
            adjustment: number;
            peak?: number;
        }
        interface RVA2 extends Base {
            id: string;
            channels: Array<RVA2Channel>;
        }
        interface Popularimeter extends Base {
            rating: number;
            count: number;
            email: string;
        }
        interface Bool extends Base {
            bool: boolean;
        }
        interface AudioEncryption extends Base {
            id: string;
            previewStart: number;
            previewLength: number;
            bin: Buffer;
        }
        interface Link extends Base {
            url: string;
            id: string;
            additional: Array<string>;
        }
        interface EventTimingCodes extends Base {
            format: number;
            events: Array<EventTimingCodesEvent>;
        }
        interface EventTimingCodesEvent {
            type: number;
            timestamp: number;
        }
        interface SynchronisedLyrics extends Base {
            id: string;
            language: string;
            timestampFormat: number;
            contentType: number;
            events: Array<SynchronisedLyricsEvent>;
        }
        interface SynchronisedLyricsEvent {
            timestamp: number;
            text: string;
        }
        interface GEOB extends Base {
            filename: string;
            mimeType: string;
            contentDescription: string;
            bin: Buffer;
        }
        interface ReplayGainAdjustment extends Base {
            peak: number;
            radioAdjustment: number;
            audiophileAdjustment: number;
        }
        interface ChapterToc extends Base {
            id: string;
            ordered: boolean;
            topLevel: boolean;
            children: Array<string>;
        }
        interface Chapter extends Base {
            id: string;
            start: number;
            end: number;
            offset: number;
            offsetEnd: number;
        }
        interface IdBin extends Base {
            id: string;
            bin: Buffer;
        }
        interface IdText extends Base {
            id: string;
            text: string;
        }
        interface Ascii extends Base {
            text: string;
        }
        interface Text extends Base {
            text: string;
        }
        interface TextList extends Base {
            list: Array<string>;
        }
    }
    interface FormatFlags {
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
    interface Flags {
        [name: string]: boolean | undefined;
        unsynchronisation?: boolean;
        extendedheader?: boolean;
        experimental?: boolean;
        footer?: boolean;
    }
    interface FrameHeader {
        encoding?: string;
        statusFlags: Flags;
        formatFlags: FormatFlags;
        size: number;
    }
    interface Frame {
        id: string;
        title?: string;
        head?: FrameHeader;
        value: FrameValue.Base;
        subframes?: Array<Frame>;
        invalid?: string;
        groupId?: number;
    }
    interface TagHeader {
        ver: number;
        rev: number;
        size: number;
        valid: boolean;
        syncSaveSize?: number;
        flags?: Flags;
        flagBits?: Array<number>;
        extended?: TagHeaderExtended;
    }
    interface TagHeaderExtended {
        size: number;
        ver3?: TagHeaderExtendedVer3;
        ver4?: TagHeaderExtendedVer4;
    }
    interface TagHeaderExtendedVer3 {
        flags1: Flags;
        flags2: Flags;
        crcData?: number;
        sizeOfPadding: number;
    }
    interface TagHeaderExtendedVer4 {
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
    interface Tag extends ITag {
        head?: TagHeader;
        frames: Array<Frame>;
    }
    interface RawTag extends ITag {
        head: TagHeader;
        frames: Array<RawFrame>;
    }
    interface RawFrame {
        id: string;
        start: number;
        end: number;
        size: number;
        data: Buffer;
        statusFlags: Flags;
        formatFlags: FormatFlags;
    }
    interface TagSimplified {
        album?: string;
        album_artist?: string;
        album_artist_sort?: string;
        album_artist_sort_order?: string;
        album_sort_order?: string;
        artist?: string;
        artist_sort?: string;
        attached_picture?: string;
        audio_encryption?: string;
        audio_seek_point_index?: string;
        band?: string;
        bpm?: string;
        chapter?: string;
        chapter_toc?: string;
        comment?: string;
        comments?: string;
        commercial?: string;
        commercial_information?: string;
        composer?: string;
        composer_sort?: string;
        composer_sort_order?: string;
        conductor?: string;
        content_group?: string;
        content_group_description?: string;
        copyright?: string;
        copyright_message?: string;
        copyright_msg?: string;
        date?: string;
        disc?: number;
        encoded_by?: string;
        encoder?: string;
        encoding_software?: string;
        encrypted_meta?: string;
        encryption_method_registration?: string;
        equalisation?: string;
        event_timing_codes?: string;
        file_owner?: string;
        file_type?: string;
        general_encapsulated_object?: string;
        genre?: string;
        group_id_registration?: string;
        initial_key?: string;
        internet_radio_station_name?: string;
        internet_radio_station_owner?: string;
        interpreted_by?: string;
        involved_people?: string;
        involved_people_list?: string;
        isrc?: string;
        itunes_compilation_flag?: string;
        itunes_podcast_description?: string;
        itunes_podcast_keywords?: string;
        itunes_podcast_marker?: string;
        language?: string;
        length?: string;
        linked_information?: string;
        lyricist?: string;
        media?: string;
        media_type?: string;
        mood?: string;
        mpeg_location_lookup_table?: string;
        music_cd_identifier?: string;
        musicians_credits?: string;
        musicmatch_binary?: string;
        official_artist?: string;
        official_audio_file_webpage?: string;
        official_audio_source_webpage?: string;
        official_internet_radio_station_homepage?: string;
        original_album?: string;
        original_artist?: string;
        original_filename?: string;
        original_lyricist?: string;
        original_release_time?: string;
        original_release_year?: string;
        ownership?: string;
        part_of_a_set?: string;
        payment?: string;
        performer_sort_order?: string;
        play_counter?: string;
        playlist_delay?: string;
        podcast_feed_url?: string;
        podcast_url?: string;
        popularimeter?: string;
        position_synchronisation?: string;
        produced_notice?: string;
        publisher?: string;
        publishers_official_webpage?: string;
        recommended_buffer_size?: string;
        recording_dates?: string;
        relative_volume_adjustment?: string;
        relative_volume_adjustment_2?: string;
        release_date?: string;
        release_time?: string;
        release_year?: string;
        replay_gain_adjustment?: string;
        reverb?: string;
        seek?: string;
        set_subtitle?: string;
        signature?: string;
        size?: string;
        subtitle?: string;
        synchronised_lyrics?: string;
        synchronised_tempo_codes?: string;
        tagging_time?: string;
        terms_of_use?: string;
        time?: string;
        title?: string;
        title_sort_order?: string;
        track?: number;
        unique_file_identifier?: string;
        unsychronized_lyric?: string;
        unsync_lyric?: string;
        year?: number;
        private_frame?: string;
        user_defined_text?: string;
        user_defined_url_link_frame?: string;
        TRACKID?: string;
        asin?: string;
        catalognumber?: string;
        script?: string;
        barcode?: string;
        originalyear?: string;
        replaygain_track_gain?: string;
        replaygain_album_gain?: string;
        replaygain_track_peak?: string;
        replaygain_album_peak?: string;
        artists?: string;
        ACOUSTID?: string;
        ALBUMTYPE?: string;
        ALBUMARTISTID?: string;
        ARTISTID?: string;
        ALBUMID?: string;
        RELEASETRACKID?: string;
        RELEASEGROUPID?: string;
        RECORDINGID?: string;
        ALBUMSTATUS?: string;
        RELEASECOUNTRY?: string;
        TRMID?: string;
    }
}
export declare const ID3v2_ValuePicTypes: {
    [name: string]: string;
};
export declare const ID3v2_ValueRelativeVolumeAdjustment2ChannelTypes: {
    [name: string]: string;
};
