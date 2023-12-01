import {IID3V2} from './id3v2.types';

export class ID3V2FramesCollect {
	protected frameValues: IID3V2.Frames.Map = {};

	constructor(protected encoding?: string) {
	}

	protected replace(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = [frame];
	}

	protected replaceFrame<T extends IID3V2.FrameValue.Base>(key: string, value: T): void {
		this.replace(key, {id: key, value, head: this.head()});
	}

	protected add(key: string, frame: IID3V2.Frame) {
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}

	protected addFrame<T extends IID3V2.FrameValue.Base>(key: string, value: T): void {
		this.add(key, {id: key, value, head: this.head()});
	}

	protected addIDFrame<T extends { id: string }>(key: string, value: T): void {
		const list = (this.frameValues[key] || [])
			.filter(f => (f as any).value.id !== value.id);
		this.frameValues[key] = list.concat([{id: key, value, head: this.head()}]);
	}

	protected head(): IID3V2.FrameHeader {
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

}
