import {IID3V2} from './id3v2__types';
import {ITagID} from '../..';

interface ID3V2Frames {
	[key: string]: Array<IID3V2.Frame>;
}

interface ID3V2TextFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.Text;
}

interface ID3V2IdTextFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.IdText;
}

interface ID3V2TextListFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.TextList;
}

interface ID3V2BoolValueFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.Bool;
}

interface ID3V2LangDescTextValueFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.LangDescText;
}

interface ID3V2PicValueFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.Pic;
}

interface ID3V2IdBinValueFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.IdBin;
}

interface ID3V2ChapterValueFrame extends IID3V2.Frame {
	value: IID3V2.FrameValue.Chapter;
}

export interface ID3v2Builder {
	buildFrames(): Array<IID3V2.Frame>;

	version(): number;

	rev(): number;
}

export class ID3V2RawBuilder {
	private frameValues: ID3V2Frames = {};

	build(): ID3V2Frames {
		return this.frameValues;
	}

	text(key: string, text: string | undefined) {
		if (text) {
			const frame: ID3V2TextFrame = {id: key, value: {text}};
			this.frameValues[key] = [frame];
		}
	}

	idText(key: string, id: string, value: string | undefined) {
		if (value) {
			const frame: ID3V2IdTextFrame = {id: key, value: {id, text: value}};
			const list = (<Array<ID3V2IdTextFrame>>(this.frameValues[key] || []))
				.filter(f => f.value.id !== id);
			this.frameValues[key] = list.concat([frame]);
		}
	}

	nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined) {
		if (value) {
			const text = value.toString() + (total ? '/' + total.toString() : '');
			const frame: ID3V2TextFrame = {id: key, value: {text}};
			this.frameValues[key] = [frame];
		}
	}

	keyTextList(key: string, group: string, value?: string) {
		if (value) {
			const frames = <Array<ID3V2TextListFrame>>(this.frameValues[key] || []);
			const frame: ID3V2TextListFrame = (frames.length > 0) ? frames[0] : {id: key, value: {list: []}};
			frame.value.list.push(group);
			frame.value.list.push(value);
			this.frameValues[key] = [frame];
		}
	}

	bool(key: string, bool: boolean) {
		if (bool !== undefined) {
			const frame: ID3V2BoolValueFrame = {id: key, value: {bool}};
			this.frameValues[key] = [frame];
		}
	}

	idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined) {
		if (value) {
			id = id || '';
			lang = lang || '';
			const list = (<Array<ID3V2LangDescTextValueFrame>>(this.frameValues[key] || []))
				.filter(f => f.value.id !== id);
			const frame: ID3V2LangDescTextValueFrame = {id: key, value: {id, language: lang, text: value}};
			this.frameValues[key] = list.concat([frame]);
		}
	}

	picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer) {
		const frame: ID3V2PicValueFrame = {
			id: key, value: {
				description: description || '',
				pictureType,
				bin: binary,
				mimeType: mimeType
			}
		};
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}

	idBin(key: string, id: string, binary: Buffer) {
		const frame: ID3V2IdBinValueFrame = {
			id: key,
			value: {
				id,
				bin: binary
			}
		};
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}

	chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>) {
		const frame: ID3V2ChapterValueFrame = {
			id: key,
			value: {
				id: chapterID,
				start,
				end,
				offset,
				offsetEnd
			},
			subframes
		};
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}
}
