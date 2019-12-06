import {ITag} from '../common/types';

export namespace IID3V1 {

	/** ID3v1 Remove Options */
	export interface RemoveOptions {
		/** keep backup file (.bak) created while removing tag */
		keepBackup?: boolean;
	}

	/** ID3v1 Write Options */
	export interface WriteOptions {
		/** keep backup file (.bak) created while writing tag */
		keepBackup?: boolean;
	}

	/** ID3v1 values */
	export interface ID3v1Tag {
		/** title */
		title?: string;
		/** artist */
		artist?: string;
		/** comment */
		comment?: string;
		/** album */
		album?: string;
		/** genre index, see [[ID3v1_GENRES]] */
		genreIndex?: number;
		/** year */
		year?: string;
		/** track number */
		track?: number;
	}

	/** ID3v1 Tag */
	export interface Tag extends ITag {
		/** ID3v1 values */
		value: ID3v1Tag;
		/** ID3v1.x version */
		version?: number;
	}
}
