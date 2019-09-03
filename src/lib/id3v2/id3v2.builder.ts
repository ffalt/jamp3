import {IID3V2} from './id3v2.types';

export class ID3V2RawBuilder {
	private frameValues: IID3V2.Frames.Map = {};

	constructor(private encoding?: string) {
	}

	private replace(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = [frame];
	}

	private replaceFrame<T>(key: string, value: T): void {
		const frame = {id: key, value, head: this.head()};
		this.replace(key, frame);
	}

	private add(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}

	private addFrame<T>(key: string, value: T): void {
		const frame = {id: key, value, head: this.head()};
		this.add(key, frame);
	}

	private head(): IID3V2.FrameHeader {
		return {
			size: 0,
			statusFlags: {},
			formatFlags: {},
			encoding: this.encoding
		};
	}

	build(): IID3V2.Frames.Map {
		return this.frameValues;
	}

	// frame types as functions

	audioEncryption(key: string, id: string, previewStart: number, previewLength: number, bin: Buffer) {
		this.addFrame<IID3V2.FrameValue.AudioEncryption>(key, {id, previewStart, previewLength, bin});
	}

	bool(key: string, bool: boolean) {
		if (bool !== undefined) {
			this.replaceFrame<IID3V2.FrameValue.Bool>(key, {bool});
		}
	}

	chapter(key: string, chapterID: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>) {
		const frame: IID3V2.Frames.ChapterFrame = {
			id: key,
			value: {id: chapterID, start, end, offset, offsetEnd},
			subframes,
			head: this.head()
		};
		this.add(key, frame);
	}

	chapterTOC(key: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>) {
		this.addFrame<IID3V2.FrameValue.ChapterToc>(key, {id, ordered, topLevel, children});
	}

	eventTimingCodes(key: string, timeStampFormat: number, events: Array<{ type: number; timestamp: number }>) {
		this.addFrame<IID3V2.FrameValue.EventTimingCodes>(key, {format: timeStampFormat, events});
	}

	idBin(key: string, id: string, binary: Buffer) {
		this.addFrame<IID3V2.FrameValue.IdBin>(key, {id, bin: binary});
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

	idText(key: string, id: string, value: string | undefined) {
		if (value) {
			const frame: IID3V2.Frames.IdTextFrame = {id: key, value: {id, text: value}, head: this.head()};
			const list = (<Array<IID3V2.Frames.IdTextFrame>>(this.frameValues[key] || [])).filter(f => f.value.id !== id);
			this.frameValues[key] = list.concat([frame]);
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

	langText(key: string, language: string, text: string) {
		this.addFrame<IID3V2.FrameValue.LangText>(key, {language, text});
	}

	linkedInformation(key: string, id: string, url: string, additional: Array<string>) {
		this.addFrame<IID3V2.FrameValue.LinkedInfo>(key, {id, url, additional});
	}

	nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined) {
		if (value) {
			const text = value.toString() + (total ? '/' + total.toString() : '');
			this.replaceFrame<IID3V2.FrameValue.Text>(key, {text});
		}
	}

	number(key: string, num: number | undefined) {
		if (num !== undefined) {
			this.replaceFrame<IID3V2.FrameValue.Number>(key, {num});
		}
	}

	object(key: string, filename: string, mimeType: string, contentDescription: string, bin: Buffer) {
		this.addFrame<IID3V2.FrameValue.GEOB>(key, {filename, mimeType, contentDescription, bin});
	}

	picture(key: string, pictureType: number, description: string, mimeType: string, binary: Buffer) {
		this.addFrame<IID3V2.FrameValue.Pic>(key, {description: description || '', pictureType, bin: binary, mimeType: mimeType});
	}

	popularimeter(key: string, email: string, rating: number, count: number) {
		this.addFrame<IID3V2.FrameValue.Popularimeter>(key, {email, rating, count});
	}

	relativeVolumeAdjustment(
		key: string, right: number, left: number, peakRight?: number, peakLeft?: number, rightBack?: number, leftBack?: number, peakRightBack?: number, peakLeftBack?: number,
		center?: number, peakCenter?: number, bass?: number, peakBass?: number) {
		this.addFrame<IID3V2.FrameValue.RVA>(key, {
			right, left, peakRight, peakLeft,
			rightBack, leftBack, peakRightBack, peakLeftBack,
			center, peakCenter, bass, peakBass
		});
	}

	relativeVolumeAdjustment2(key: string, id: string, channels: Array<{ type: number; adjustment: number; peak?: number }>) {
		this.addFrame<IID3V2.FrameValue.RVA2>(key, {id, channels});
	}

	replayGainAdjustment(key: string, peak: number, radioAdjustment: number, audiophileAdjustment: number) {
		this.addFrame<IID3V2.FrameValue.ReplayGainAdjustment>(key, {peak, radioAdjustment, audiophileAdjustment});
	}

	synchronisedLyrics(key: string, id: string, language: string, timestampFormat: number, contentType: number, events: Array<{ timestamp: number; text: string; }>) {
		this.addFrame<IID3V2.FrameValue.SynchronisedLyrics>(key, {id, language, timestampFormat, contentType, events});
	}

	text(key: string, text: string | undefined) {
		if (text) {
			this.replaceFrame<IID3V2.FrameValue.Text>(key, {text});
		}
	}

	unknown(key: string, binary: Buffer) {
		this.addFrame<IID3V2.FrameValue.Bin>(key, {bin: binary});
	}

}
