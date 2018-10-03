import { ITag } from '../common/types';
export declare namespace IID3V1 {
    interface Value {
        title?: string;
        artist?: string;
        comment?: string;
        album?: string;
        genreIndex?: number;
        year?: string;
        track?: number;
    }
    interface Tag extends ITag {
        value: Value;
        version?: number;
    }
}
