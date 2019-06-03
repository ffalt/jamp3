export enum ITagID {
	ID3v1 = 'ID3v1',
	ID3v2 = 'ID3v2'
}

export interface ITag {
	id: ITagID;
	start: number;
	end: number;
}
