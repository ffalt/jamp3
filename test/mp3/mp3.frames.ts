import fse from 'fs-extra';

import { MP3 } from '../../src/lib/mp3/mp3';
import { IMP3 } from '../../src/lib/mp3/mp3.types';
import { ITestSpec, ITestSpecFrame } from '../common/spec';
import { filterBestMPEGChain } from '../../src/lib/mp3/mp3.mpeg.chain';
import { expandRawHeader, expandRawHeaderArray, rawHeaderOffSet } from '../../src/lib/mp3/mp3.mpeg.frame';

async function loadFramesCompareProbe(filename: string, result: IMP3.Result): Promise<void> {
	const compare: ITestSpec = await fse.readJSON(`${filename}.frames.json`);
	const compareCols = compare.cols || [];
	const compareFrames: Array<ITestSpecFrame> = (compare.frames || []).map(row => {
		const o: Record<string, number> = {};
		for (const [index, key] of compareCols.entries()) {
			o[key] = row[index];
		}
		return o as ITestSpecFrame;
	});
	const allFrames = result.frames && result.frames.audio ? result.frames.audio || [] : [];
	let frames = filterBestMPEGChain(allFrames, 50);
	const head = result.frames && result.frames.headers ? result.frames.headers[0] : undefined;
	if (head) {
		const index = compareFrames.findIndex(f => f.offset === head.header.offset);
		if (index === -1) {
			// probe removes xing frames sometimes
			frames = frames.filter(f => rawHeaderOffSet(f) !== head.header.offset);
		}
	}
	// saveIfNotExists(filename + '.frames.jam.filtered.json', frames);
	if (frames.length !== compareFrames.length) {
		const missing: Array<number> = [];
		for (const frame of frames) {
			if (!compareFrames.some(f => f.offset === rawHeaderOffSet(frame))) {
				missing.push(rawHeaderOffSet(frame));
			}
		}
		if (missing.length > 0) {
			// console.log('missing frame offsets in probe', missing);
			frames = frames.filter(f => !missing.includes(rawHeaderOffSet(f)));
		}
		const missing2: Array<number> = [];
		for (const frame of compareFrames) {
			if (!frames.some(f => rawHeaderOffSet(f) === frame.offset)) {
				missing2.push(frame.offset);
			}
		}
		if (missing2.length > 0) {
			// console.log('missing frame offsets in jam', missing2);
		}
	}
	for (const [index, frame] of frames.entries()) {
		const compareframe = compareFrames[index];
		if (!compareframe) {
			continue;
		}
		const header: IMP3.FrameHeader = expandRawHeader(expandRawHeaderArray(frame));
		if ((index > 0) && index < frames.length - 2) {
			// ignore last calculated size (ffprobe reports the real size, which may be smaller)
			expect(header.size).toBe(compareframe.size); // 'Size not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
			expect(header.samples).toBe(compareframe.samples); // 'Nr of samples not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
		}
		expect(header.offset).toBe(compareframe.offset); // 'Header position not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
		expect(header.channelCount).toBe(compareframe.channels); // 'Channels not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
	}
	expect(frames.length).toBe(compareFrames.length); // 'Frame lengths not equal');
	if (compare.stream && result.mpeg) {
		expect(frames.length).toBe(Number(compare.stream.nb_read_frames)); // 'nb_read_frames not equal');
		expect(result.mpeg.sampleRate).toBe(Number(compare.stream.sample_rate)); // 'sampleRate not equal');
		expect(result.mpeg.channels).toBe(compare.stream.channels); // 'channels not equal');
		expect(`MP3 (${result.mpeg.layer})`).toBe(compare.stream.codec_long_name); // 'codec_long_name not equal');
		let time = 0;
		for (const f of compareFrames) {
			time += f.time;
		}
		time = Math.trunc(time) / 1000;
		if (frames.length > 30 && time !== result.mpeg.durationRead) {
			const diff = Number.parseFloat(Math.abs((Number.parseFloat(compare.stream.duration) - result.mpeg.durationEstimate)).toFixed(5));
			expect(diff < 1).toBe(true); // 'Estimated duration differs to much. diff: ' + diff + ' actual: ' + result.mpeg.durationEstimate + ' expected:' + compare.stream.duration);
		}
	}
}

export async function testFrames(filename: string): Promise<void> {
	const mp3 = new MP3();
	const result = await mp3.read(filename, { mpeg: true, id3v2: true });
	expect(result).toBeTruthy();
	if (!result || !result.frames) {
		return;
	}
	const exists = await fse.pathExists(`${filename}.frames.json`);
	if (exists) {
		await loadFramesCompareProbe(filename, result);
	} else {
		throw new Error('Testset incomplete, missing filename.frames.json');
	}
}
