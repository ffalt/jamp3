/** Tag IDs: ID3v1 | ID3v2 */
export enum ITagID {
	ID3v1 = 'ID3v1',
	ID3v2 = 'ID3v2'
}

/** Base for Tags ID3v1 | ID3v2 */
export interface ITag {
	/** id of tag: ID3v1 | ID3v2 */
	id: ITagID;
	/** start of tag */
	start: number;
	/** end of tag (excluding padding) */
	end: number;
}
