import { ITag } from '../common/types';
export declare namespace IID3V1 {
    interface RemoveOptions {
        keepBackup?: boolean;
    }
    interface WriteOptions {
        keepBackup?: boolean;
    }
    interface ID3v1Tag {
        title?: string;
        artist?: string;
        comment?: string;
        album?: string;
        genreIndex?: number;
        year?: string;
        track?: number;
    }
    interface Tag extends ITag {
        value: ID3v1Tag;
        version?: number;
    }
}
