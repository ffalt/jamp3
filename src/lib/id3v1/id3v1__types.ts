import {ITag} from '../common/types';

export namespace IID3V1 {
	export interface Value {
		title?: string;
		artist?: string;
		comment?: string;
		album?: string;
		genreIndex?: number;
		year?: string;
		track?: number;
	}

	export interface Tag extends ITag {
		value: Value;
		version?: number;
	}
}
