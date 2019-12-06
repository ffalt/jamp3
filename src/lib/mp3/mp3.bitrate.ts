import {IMP3} from './mp3.types';
import {expandRawHeader, expandRawHeaderArray} from './mp3.mpeg.frame';

export function analyzeBitrateMode(frames: Array<IMP3.FrameRawHeaderArray>): { encoded: string, bitRate: number, duration: number, count: number, audioBytes: number } {
	const bitRates: { [bitRate: number]: number } = {};
	let duration = 0;
	let audioBytes = 0;
	let count = 0;
	frames.forEach(frame => {
		const header: IMP3.FrameHeader = expandRawHeader(expandRawHeaderArray(frame));
		bitRates[header.bitRate] = (bitRates[header.bitRate] || 0) + 1;
		duration += header.time;
		audioBytes += header.size;
		count++;
	});
	let encoded = 'CBR';
	const first: IMP3.FrameHeader | undefined = frames.length > 0 ? expandRawHeader(expandRawHeaderArray(frames[0])) : undefined;
	let bitRate = first ? first.bitRate : 0;
	const rates = Object.keys(bitRates).map(s => parseInt(s, 10));
	if (rates.length > 1) {
		encoded = 'VBR';
		let sumBitrate = 0;
		let countBitrate = 0;
		rates.forEach(rate => {
			sumBitrate += (rate * bitRates[rate]);
			countBitrate += bitRates[rate];
		});
		bitRate = Math.trunc(sumBitrate / countBitrate);
	}
	return {encoded, bitRate, duration, count, audioBytes};
}
