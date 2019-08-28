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
        interface LangText extends Base {
            language: string;
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
        interface LinkedInfo extends Base {
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
        dataLengthIndicator?: boolean;
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
        statusFlags?: Flags;
        formatFlags?: FormatFlags;
        size?: number;
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
    namespace Frames {
        interface Map {
            [key: string]: Array<Frame>;
        }
        interface TextFrame extends Frame {
            value: FrameValue.Text;
        }
        interface NumberFrame extends Frame {
            value: FrameValue.Number;
        }
        interface IdTextFrame extends Frame {
            value: FrameValue.IdText;
        }
        interface TextListFrame extends Frame {
            value: FrameValue.TextList;
        }
        interface BoolFrame extends Frame {
            value: FrameValue.Bool;
        }
        interface LangDescTextFrame extends Frame {
            value: FrameValue.LangDescText;
        }
        interface PicFrame extends Frame {
            value: FrameValue.Pic;
        }
        interface IdBinFrame extends Frame {
            value: FrameValue.IdBin;
        }
        interface ChapterFrame extends Frame {
            value: FrameValue.Chapter;
        }
        interface EventTimingCodesFrame extends Frame {
            value: FrameValue.EventTimingCodes;
        }
        interface SynchronisedLyricsFrame extends Frame {
            value: FrameValue.SynchronisedLyrics;
        }
        interface RelativeAudioAdjustmentsFrame extends Frame {
            value: FrameValue.RVA;
        }
        interface RelativeAudioAdjustments2Frame extends Frame {
            value: FrameValue.RVA2;
        }
        interface UnknownFrame extends Frame {
            value: FrameValue.Bin;
        }
        interface GEOBFrame extends Frame {
            value: FrameValue.GEOB;
        }
        interface PopularimeterFrame extends Frame {
            value: FrameValue.Popularimeter;
        }
        interface AudioEncryptionFrame extends Frame {
            value: FrameValue.AudioEncryption;
        }
        interface LinkedInfoFrame extends Frame {
            value: FrameValue.LinkedInfo;
        }
        interface LangTextFrame extends Frame {
            value: FrameValue.LangText;
        }
        interface ReplayGainAdjustmentFrame extends Frame {
            value: FrameValue.ReplayGainAdjustment;
        }
        interface ChapterTOCFrame extends Frame {
            value: FrameValue.ChapterToc;
        }
    }
    interface Builder {
        buildFrames(): Array<Frame>;
        version(): number;
        rev(): number;
    }
    interface TagHeaderFlagsV2 {
        unsynchronisation?: boolean;
        compression?: boolean;
    }
    interface TagHeaderV2 {
        sizeAsSyncSafe?: number;
        flags: TagHeaderFlagsV2;
    }
    interface TagHeaderFlagsV3 {
        unsynchronisation?: boolean;
        extendedheader?: boolean;
        experimental?: boolean;
    }
    interface TagHeaderV3 {
        flags: TagHeaderFlagsV3;
        extended?: TagHeaderExtendedVer3;
    }
    interface TagHeaderFlagsV4 {
        unsynchronisation?: boolean;
        extendedheader?: boolean;
        experimental?: boolean;
        footer?: boolean;
    }
    interface TagHeaderV4 {
        flags: TagHeaderFlagsV4;
        extended?: TagHeaderExtendedVer4;
    }
    interface TagHeader {
        ver: number;
        rev: number;
        size: number;
        valid: boolean;
        v2?: TagHeaderV2;
        v3?: TagHeaderV3;
        v4?: TagHeaderV4;
        flagBits?: Array<number>;
    }
    interface TagHeaderExtendedVer3 {
        size: number;
        flags1: Flags;
        flags2: Flags;
        crcData?: number;
        sizeOfPadding: number;
    }
    interface TagHeaderExtendedVer4 {
        size: number;
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
    interface ID3v2Tag {
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
        [name: string]: string | undefined;
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
    interface Warning {
        msg: string;
        expected: number | string | boolean;
        actual: number | string | boolean;
    }
    interface RemoveOptions {
        keepBackup?: boolean;
    }
    interface WriteOptions {
        defaultEncoding?: string;
        paddingSize?: number;
        keepBackup?: boolean;
    }
}
