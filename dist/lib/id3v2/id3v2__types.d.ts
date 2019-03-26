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
        ACOUSTID_FINGERPRINT?: string;
        ACOUSTID_ID?: string;
        ALBUM?: string;
        ALBUMARTIST?: string;
        ALBUMARTISTSORT?: string;
        ALBUMSORT?: string;
        ARRANGER?: string;
        ARTIST?: string;
        ARTISTS?: string;
        ARTISTSORT?: string;
        ASIN?: string;
        AUDIOENCRYPTION?: string;
        AUDIOSEEKPOINTINDEX?: string;
        AUDIOSOURCEWWEBPAGEURL?: string;
        AUDIOSTREAMSIZE?: string;
        BARCODE?: string;
        BPM?: string;
        CATALOGNUMBER?: string;
        CHAPTER?: string;
        CHAPTERTOC?: string;
        COMMENT?: string;
        COMMERCIAL?: string;
        COMMERCIALINFORMATIONURL?: string;
        COMPILATION?: string;
        COMPOSER?: string;
        COMPOSERSORT?: string;
        COMPRESSEDMETA?: string;
        CONDUCTOR?: string;
        COPYRIGHT?: string;
        DATE?: string;
        DISCNUMBER?: string;
        DISCSUBTITLE?: string;
        DISCTOTAL?: string;
        DJMIXER?: string;
        ENCODEDBY?: string;
        ENCODERSETTINGS?: string;
        ENCODINGTIME?: string;
        ENCRYPTEDMET?: string;
        ENCRYPTIONMETHODREGISTRATION?: string;
        ENGINEER?: string;
        EQUALISATION?: string;
        EVENTTIMINGCODE?: string;
        FILEOWNER?: string;
        FILETYPE?: string;
        FILEWEBPAGEURL?: string;
        GENERALENCAPSULATEDOBJECT?: string;
        GENRE?: string;
        GROUPIDREGISTRATION?: string;
        GROUPING?: string;
        ISRC?: string;
        KEY?: string;
        LABEL?: string;
        LANGUAGE?: string;
        LICENSE?: string;
        LYRICIST?: string;
        LYRICS?: string;
        MEDIA?: string;
        MIXER?: string;
        MOOD?: string;
        MOVEMENT?: string;
        MOVEMENTNAME?: string;
        MOVEMENTTOTAL?: string;
        MP3HD?: string;
        MPEGLOCATIONLOOKUPTABLE?: string;
        MUSICBRAINZ_ALBUMARTISTID?: string;
        MUSICBRAINZ_ALBUMID?: string;
        MUSICBRAINZ_ARTISTID?: string;
        MUSICBRAINZ_DISCID?: string;
        MUSICBRAINZ_ORIGINALALBUMID?: string;
        MUSICBRAINZ_ORIGINALARTISTID?: string;
        MUSICBRAINZ_RELEASEGROUPID?: string;
        MUSICBRAINZ_RELEASETRACKID?: string;
        MUSICBRAINZ_TRACKID?: string;
        MUSICBRAINZ_TRMID?: string;
        MUSICBRAINZ_WORKID?: string;
        MUSICCDID?: string;
        MUSICIP_PUID?: string;
        MUSICMATCH?: string;
        ORGANIZATION?: string;
        ORIGINALALBUM?: string;
        ORIGINALARTIST?: string;
        ORIGINALDATE?: string;
        ORIGINALFILENAME?: string;
        ORIGINALLYICIST?: string;
        ORIGINALYEAR?: string;
        OWNERSHIP?: string;
        PARTNUMBE?: string;
        PAYMENTURL?: string;
        PERFORME?: string;
        PICTURE?: string;
        PLAYCOUNTER?: string;
        PLAYLISTDELAY?: string;
        PODCAST?: string;
        PODCAST_DESCRIPTION?: string;
        PODCAST_KEYWORDS?: string;
        PODCASTFEEDURL?: string;
        PODCASTID?: string;
        POSITIONSYNCHRONISATION?: string;
        PRODUCEDNOTICE?: string;
        PRODUCER?: string;
        PUBLISHERURL?: string;
        RADIOSTATIONNAME?: string;
        RADIOSTATIONOWNER?: string;
        RADIOSTATIONWEBPAGEURL?: string;
        RATING?: string;
        RECOMMENDEDBUFFERSIZE?: string;
        RECORDINGDATES?: string;
        RELATIVEVOLUMEADJUSTMENT?: string;
        RELEASECOUNTRY?: string;
        RELEASESTATUS?: string;
        RELEASETIME?: string;
        RELEASETYPE?: string;
        REMIXER?: string;
        REPLAYGAIN_ALBUM_GAIN?: string;
        REPLAYGAIN_ALBUM_PEAK?: string;
        REPLAYGAIN_TRACK_GAIN?: string;
        REPLAYGAIN_TRACK_PEAK?: string;
        REPLAYGAINADJUSTMENT?: string;
        REVERB?: string;
        SCRIPT?: string;
        SEEK?: string;
        SHOWMOVEMENT?: string;
        SIGNATURE?: string;
        SUBTITLE?: string;
        SYNCHRONISEDLYRICS?: string;
        SYNCHRONISEDTEMPOCODES?: string;
        TAGGINGTIME?: string;
        TERMSOFUSE?: string;
        TITLE?: string;
        TITLESORT?: string;
        TRACKLENGTH?: string;
        TRACKNUMBER?: string;
        TRACKTOTAL?: string;
        WEBSITE?: string;
        WORK?: string;
        WRITER?: string;
    }
}
export declare const ID3v2_ValuePicTypes: {
    [name: string]: string;
};
export declare const ID3v2_ValueRelativeVolumeAdjustment2ChannelTypes: {
    [name: string]: string;
};
