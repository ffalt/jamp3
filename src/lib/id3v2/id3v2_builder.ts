import {IID3V2} from './id3v2__types';


export class ID3V2RawBuilder {
	constructor(private encoding?: string) {
	}

	private frameValues: IID3V2.Frames.Map = {};

	build(): IID3V2.Frames.Map {
		return this.frameValues;
	}

	private replace(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = [frame];
	}

	private add(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}

	private head(): IID3V2.FrameHeader {
		return {
			size: 0,
			statusFlags: {},
			formatFlags: {},
			encoding: this.encoding
		};
	}

	text(key: string, text: string | undefined) {
		if (text) {
			const frame: IID3V2.Frames.TextFrame = {id: key, value: {text}, head: this.head()};
			this.replace(key, frame);
		}
	}

	number(key: string, num: number | undefined) {
		if (num !== undefined) {
			const frame: IID3V2.Frames.NumberFrame = {id: key, value: {num}, head: this.head()};
			this.replace(key, frame);
		}
	}

	idText(key: string, id: string, value: string | undefined) {
		if (value) {
			const frame: IID3V2.Frames.IdTextFrame = {id: key, value: {id, text: value}, head: this.head()};
			const list = (<Array<IID3V2.Frames.IdTextFrame>>(this.frameValues[key] || [])).filter(f => f.value.id !== id);
			this.frameValues[key] = list.concat([frame]);
		}
	}

	nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined) {
		if (value) {
			const text = value.toString() + (total ? '/' + total.toString() : '');
			const frame: IID3V2.Frames.TextFrame = {id: key, value: {text}, head: this.head()};
			this.replace(key, frame);
		}
	}

	keyTextList(key: string, group: string, value?: string) {
		if (value) {
			const frames = <Array<IID3V2.Frames.TextListFrame>>(this.frameValues[key] || []);
			const frame: IID3V2.Frames.TextListFrame = (frames.length > 0) ? frames[0] : {id: key, value: {list: []}, head: this.head()};
			frame.value.list.push(group);
			frame.value.list.push(value);
			this.replace(key, frame);
		}
	}

	bool(key: string, bool: boolean) {
		if (bool !== undefined) {
			const frame: IID3V2.Frames.BoolFrame = {id: key, value: {bool}, head: this.head()};
			this.replace(key, frame);
		}
	}

	idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined) {
		if (value) {
			id = id || '';
			lang = lang || '';
			const list = (<Array<IID3V2.Frames.LangDescTextFrame>>(this.frameValues[key] || []))
				.filter(f => f.value.id !== id);
			const frame: IID3V2.Frames.LangDescTextFrame = {id: key, value: {id, language: lang, text: value}, head: this.head()};
			this.frameValues[key] = list.concat([frame]);
		}
	}

	picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer) {
		const frame: IID3V2.Frames.PicFrame = {
			id: key,
			value: {
				description: description || '',
				pictureType,
				bin: binary,
				mimeType: mimeType
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	idBin(key: string, id: string, binary: Buffer) {
		const frame: IID3V2.Frames.IdBinFrame = {
			id: key,
			value: {id, bin: binary},
			head: this.head()
		};
		this.add(key, frame);
	}

	chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>) {
		const frame: IID3V2.Frames.ChapterFrame = {
			id: key,
			value: {id: chapterID, start, end, offset, offsetEnd},
			subframes, head: this.head()
		};
		this.add(key, frame);
	}

	synchronisedLyrics(
		key: string, id: string, language: string, timestampFormat: number,
		contentType: number, events: Array<{ timestamp: number; text: string; }>
	) {
		const frame: IID3V2.Frames.SynchronisedLyricsFrame = {
			id: key,
			value: {id, language, timestampFormat, contentType, events},
			head: this.head()
		};
		this.add(key, frame);
	}

	relativeVolumeAdjustment(
		key: string,
		right: number,
		left: number,
		peakRight?: number,
		peakLeft?: number,
		rightBack?: number,
		leftBack?: number,
		peakRightBack?: number,
		peakLeftBack?: number,
		center?: number,
		peakCenter?: number,
		bass?: number,
		peakBass?: number
	) {
		const frame: IID3V2.Frames.RelativeAudioAdjustmentsFrame = {
			id: key,
			value: {
				right, left,
				peakRight, peakLeft,
				rightBack, leftBack,
				peakRightBack, peakLeftBack,
				center, peakCenter,
				bass, peakBass
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	relativeVolumeAdjustment2(key: string, id: string, channels: Array<{ type: number; adjustment: number; peak?: number }>) {
		const frame: IID3V2.Frames.RelativeAudioAdjustments2Frame = {
			id: key,
			value: {
				id,
				channels
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	eventTimingCodes(key: string, timeStampFormat: number, events: Array<{ type: number; timestamp: number }>) {
		const frame: IID3V2.Frames.EventTimingCodesFrame = {
			id: key,
			value: {
				format: timeStampFormat,
				events
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	unknown(key: string, binary: Buffer) {
		const frame: IID3V2.Frames.UnknownFrame = {
			id: key,
			value: {
				bin: binary
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	object(key: string, filename: string, mimeType: string, contentDescription: string, bin: Buffer) {
		const frame: IID3V2.Frames.GEOBFrame = {
			id: key,
			value: {
				filename, mimeType, contentDescription, bin
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	popularimeter(key: string, email: string, rating: number, count: number) {
		const frame: IID3V2.Frames.PopularimeterFrame = {
			id: key,
			value: {
				email, rating, count
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	audioEncryption(key: string, id: string, previewStart: number, previewLength: number, bin: Buffer) {
		const frame: IID3V2.Frames.AudioEncryptionFrame = {
			id: key,
			value: {
				id, previewStart, previewLength, bin
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	linkedInformation(key: string, id: string, url: string, additional: Array<string>) {
		const frame: IID3V2.Frames.LinkedInfoFrame = {
			id: key,
			value: {
				id, url, additional
			},
			head: this.head()
		};
		this.add(key, frame);
	}

	langText(key: string, language: string, text: string) {
		const frame: IID3V2.Frames.LangTextFrame = {
			id: key,
			value: {language, text},
			head: this.head()
		};
		this.add(key, frame);
	}

	replayGainAdjustment(key: string, peak: number, radioAdjustment: number, audiophileAdjustment: number) {
		const frame: IID3V2.Frames.ReplayGainAdjustmentFrame = {
			id: key,
			value: {peak, radioAdjustment, audiophileAdjustment},
			head: this.head()
		};
		this.add(key, frame);
	}

	chapterTOC(key: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>) {
		const frame: IID3V2.Frames.ChapterTOCFrame = {
			id: key,
			value: {id, ordered, topLevel, children},
			head: this.head()
		};
		this.add(key, frame);
	}
}
