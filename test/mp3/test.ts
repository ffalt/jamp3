import {expect, should, use} from 'chai';
import {describe, it} from 'mocha';
import chaiExclude = require('chai-exclude');
import path from 'path';
import Debug from 'debug';
import {compareID3v2Spec} from '../id3v2/id3v2spec';
import {compareID3v2Save} from '../id3v2/id3v2compare';
import {IMP3, MP3} from '../../src';
import {compareID3v1Save, compareID3v1Spec} from '../id3v1/id3v1compare';
import {ID3v2TestDirectories, ID3v2TestPath} from '../id3v2/id3v2config';
import {ID3v1TestDirectories, ID3v1TestPath} from '../id3v1/id3v1config';
import {collectTestFiles} from '../common/common';
import {expandRawHeader} from '../../src/lib/mp3/mp3_frame';
import {filterBestMPEGChain} from '../../src/lib/mp3/mp3_frames';
import fse from 'fs-extra';

export const IMP3TestPath = path.join(__dirname, '..', 'data', 'testfiles', 'mp3');
export const IMP3TestDirectories = [
	'getID3',
	'mpgedit',
	'constant',
	'vbr',
	'vbrheadersdk'
];

const tests = [
	{dirs: ID3v2TestDirectories, dir: ID3v2TestPath}
	, {dirs: ID3v1TestDirectories, dir: ID3v1TestPath}
	, {dirs: IMP3TestDirectories, dir: IMP3TestPath}
];

const testSingleFile: string | undefined = undefined;
// const testSingleFile = 'toc_many';

const debug = Debug('id3v2-test');

use(chaiExclude);

const mp3 = new MP3();

async function loadForSpec(filename: string): Promise<void> {
	debug('loadForSpec', 'loading', filename);
	const result = await mp3.read({filename, id3v1: true, id3v2: true});
	should().exist(result);
	if (!result) {
		return;
	}
	// saveIfNotExists(filename + '.result.jam.json', result);
	await compareID3v1Spec(filename, result.id3v1);
	await compareID3v2Spec(filename, result.id3v2);
}

async function loadSaveCompare(filename: string): Promise<void> {
	debug('mp3test', 'loading', filename);
	const result = await mp3.read({filename, id3v1: true, id3v2: true});
	should().exist(result);
	if (!result) {
		return;
	}
	if (result.id3v1) {
		await compareID3v1Save(filename, result.id3v1);
	}
	if (result.id3v2 && result.id3v2.head.valid) {
		await compareID3v2Save(filename, result.id3v2);
	}
}

interface ITestSpecFrame {
	[key: string]: number;

	offset: number;
	size: number;
	time: number;
	samples: number;
	channels: number;
}

interface ITestSpecFileInfo {
	index: number; // 0,
	codec_name: string; // 'mp3',
	codec_long_name: string; // 'MP3 (MPEG audio layer 3)',
	codec_type: string; // 'audio',
	codec_time_base: string; // '1/44100',
	codec_tag_string: string; // '[0][0][0][0]',
	codec_tag: string; // '0x0000',
	sample_fmt: string; // 'fltp',
	sample_rate: string; // '44100',
	channels: number; // 2,
	channel_layout: string; // 'stereo',
	bits_per_sample: number; // 0,
	r_frame_rate: string; // '0/0',
	avg_frame_rate: string; // '0/0',
	time_base: string; // '1/14112000',
	start_pts: number; // 353600,
	start_time: string; // '0.025057',
	duration_ts: number; // 524206080,
	duration: string; // '37.146122',
	bit_rate: string; // '254087',
	nb_read_frames: string; // '1421',
	disposition: {
		default: number; // 0,
		dub: number; // 0,
		original: number; // 0,
		comment: number; // 0,
		lyrics: number; // 0,
		karaoke: number; // 0,
		forced: number; // 0,
		hearing_impaired: number; // 0,
		visual_impaired: number; // 0,
		clean_effects: number; // 0,
		attached_pic: number; // 0,
		timed_thumbnails: number; // 0
	};
	tags: { [key: string]: string; }; //  { encoder: 'LAME3.97 ' }
	side_data_list: Array<{ [key: string]: string; }>; //   [{ side_data_type: 'Replay Gain' }]
}

interface ITestSpec {
	stream?: ITestSpecFileInfo;
	cols?: Array<string>;
	frames?: Array<Array<number>>;
}

async function loadFramesCompareProbe(filename: string, result: IMP3.Result): Promise<void> {
	const compare: ITestSpec = await fse.readJSON(filename + '.frames.json');
	const comparecols = compare.cols || [];
	const compareframes: Array<ITestSpecFrame> = (compare.frames || []).map(row => {
		const o: any = {};
		comparecols.forEach((key, index) => {
			o[key] = row[index];
		});
		return <ITestSpecFrame>o;
	});
	// saveIfNotExists(filename + '.frames.jam.json', result.frames);
	let frames = filterBestMPEGChain(result.frames || [], 50);
	const head = frames.find(f => !!f.mode);
	if (head) {
		const j = compareframes.findIndex(f => f.offset === head.header.offset);
		if (j < 0) {
			// probe removes xing frames sometimes
			frames = frames.filter(f => f !== head);
		}
	}
	// saveIfNotExists(filename + '.frames.jam.filtered.json', frames);
	if (frames.length !== compareframes.length) {
		const missing: Array<number> = [];
		frames.forEach(frame => {
			if (!compareframes.find(f => f.offset === frame.header.offset)) {
				missing.push(frame.header.offset);
			}
		});
		if (missing.length > 0) {
			// console.log('missing frame offsets in probe', missing);
			frames = frames.filter(f => {
				return missing.indexOf(f.header.offset) < 0;
			});
		}
		const missing2: Array<number> = [];
		compareframes.forEach(frame => {
			if (!frames.find(f => f.header.offset === frame.offset)) {
				missing2.push(frame.offset);
			}
		});
		if (missing2.length > 0) {
			// console.log('missing frame offsets in jam', missing2);
		}
	}
	frames.forEach((frame, index) => {
		const compareframe = compareframes[index];
		if (!compareframe) {
			return;
		}
		const header: IMP3.FrameHeader = expandRawHeader(frame.header);
		if ((index > 0) && index < frames.length - 2) {
			// ignore last calculated size (ffprobe reports the real size, which may be smaller)
			expect(header.size).to.deep.equal(compareframe.size, 'Size not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
			expect(header.samples).to.deep.equal(compareframe.samples, 'Nr of samples not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
		}
		expect(header.offset).to.deep.equal(compareframe.offset, 'Header position not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
		expect(header.channelCount).to.deep.equal(compareframe.channels, 'Channels not equal ' + index + ': ' + JSON.stringify(frame) + ' ' + JSON.stringify(compareframe));
	});
	expect(frames.length).to.equal(compareframes.length, 'Frame lengths not equal');
	if (compare.stream && result.mpeg) {
		expect(frames.length).to.equal(parseInt(compare.stream.nb_read_frames, 10), 'nb_read_frames not equal');
		expect(result.mpeg.sampleRate).to.equal(parseInt(compare.stream.sample_rate, 10), 'sampleRate not equal');
		expect(result.mpeg.channels).to.equal(compare.stream.channels, 'channels not equal');
		expect('MP3 (' + result.mpeg.layer + ')').to.equal(compare.stream.codec_long_name, 'codec_long_name not equal');
		let time = 0;
		compareframes.forEach(f => {
			time += f.time;
		});
		time = Math.trunc(time) / 1000;
		if (frames.length > 30 && time !== result.mpeg.durationRead) {
			const diff = parseFloat(Math.abs((parseFloat(compare.stream.duration) - result.mpeg.durationEstimate)).toFixed(5));
			expect(diff < 1).to.deep.equal(true, 'Estimated duration differs to much. diff: ' + diff + ' actual: ' + result.mpeg.durationEstimate + ' expected:' + compare.stream.duration);
		}
	}
}

async function loadFramesCompare(filename: string): Promise<void> {
	debug('mp3test', 'loading', filename);
	const result = await mp3.read({filename, mpeg: true, id3v2: true});
	should().exist(result);
	if (!result || !result.frames) {
		return;
	}
	const exists = await fse.pathExists(filename + '.frames.json');
	if (exists) {
		await loadFramesCompareProbe(filename, result);
	}
}

async function loadMPEGCompare(filename: string): Promise<void> {
	debug('mp3test', 'loading', filename);
	const compare: ITestSpec = await fse.readJSON(filename + '.frames.json');
	const data = await mp3.read({filename, mpeg: true, mpegQuick: true, id3v2: true});
	should().exist(data);
	if (!data) {
		return;
	}
	const stat = await fse.stat(filename);
	expect(data.size).to.equal(stat.size, 'file sizes not equal');
	if (compare.stream && data.mpeg) {
		expect(data.mpeg.sampleRate).to.equal(parseInt(compare.stream.sample_rate, 10), 'sampleRate not equal');
		expect(data.mpeg.channels).to.equal(compare.stream.channels, 'channels not equal');
		expect('MP3 (' + data.mpeg.layer + ')').to.equal(compare.stream.codec_long_name, 'codec_long_name not equal');

		const a = data.mpeg.durationEstimate;
		const b = parseFloat(compare.stream.duration);
		let diff = parseFloat((a - b).toFixed(4));
		let diffAbs = Math.abs(diff);
		if (diffAbs <= 1) {
			return;
		}
		// in vbr without a xing header, the estimation can be very different depending how much data is read in quick mode,
		// so at least get the audioBytes right and calculate/compare with ffprobes bit_rate estimation

		if (data.mpeg.encoded === 'VBR') {
			let audioBytes = data.size;
			if (!data.frames || data.frames.length < 20 && parseInt(compare.stream.nb_read_frames, 10) < 20) {
				return;
			}
			if (data.frames) {
				audioBytes -= data.frames[0].header.offset;
				if (data.id3v1) {
					audioBytes -= (data.id3v1.end - data.id3v1.start);
				}
				const durationEstimate = (audioBytes * 8) / parseInt(compare.stream.bit_rate, 10);
				diff = parseFloat((durationEstimate - b).toFixed(4));
				diffAbs = Math.abs(diff);
				if (diffAbs <= 1) {
					return;
				}
			}
		}
		expect(false).to.deep.equal(true, 'Estimated duration differs to much. diff: ' + diff + ' actual: ' + a + ' expected:' + b);
	}
}

describe('MP3', async () => {
	const roots: Array<{ root: string, files: Array<string> }> = [];
	for (const test of tests) {
		roots.push({root: test.dir, files: await collectTestFiles(test.dirs, test.dir, testSingleFile)});
	}
	roots.forEach(root => {
		describe(root.root, () => {
			root.files.forEach(filename => {
				describe(filename.slice(root.root.length), () => {
					it('should load & compare to spec', async () => {
						const exists = await fse.pathExists(filename + '.spec.json');
						if (exists) {
							await loadForSpec(filename);
						}
					});
					it('should load tags & save tags & compare tags', async () => {
						await loadSaveCompare(filename);
					});
					if (path.extname(filename) !== '.id3') {
						it('should read mpeg frames', async () => {
							await loadFramesCompare(filename);
						}).timeout(200000);
						it('should read quickly read mpeg info', async () => {
							await loadMPEGCompare(filename);
						}).timeout(10000);
					}
				});
			});
		});
	});
});

