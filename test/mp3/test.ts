import {expect, should, use} from 'chai';
import {describe, it, run} from 'mocha';
import chaiExclude from 'chai-exclude';
import path from 'path';
import Debug from 'debug';
import {compareID3v2Spec} from '../id3v2/id3v2spec';
import {compareID3v2Save} from '../id3v2/id3v2compare';
import {ID3v2} from '../../src/lib/id3v2/id3v2';
import {ID3V24TagBuilder, IMP3, MP3} from '../../src';
import {compareID3v1Save, compareID3v1Spec} from '../id3v1/id3v1compare';
import {ID3v2TestDirectories, ID3v2TestPath} from '../id3v2/id3v2config';
import {ID3v1TestDirectories, ID3v1TestPath} from '../id3v1/id3v1config';
import {collectTestFiles} from '../common/common';
import {expandRawHeader, expandRawHeaderArray, rawHeaderOffSet, rawHeaderSize} from '../../src/lib/mp3/mp3_frame';
import {filterBestMPEGChain} from '../../src/lib/mp3/mp3_frames';
import fse from 'fs-extra';
import tmp from 'tmp';
import {ITestSpec, ITestSpecFrame} from '../common/test-spec';

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

const testSingleFile: string | undefined =
	undefined;
// 'mpeg20-xing';

const debug = Debug('mp3-test');

use(chaiExclude);

const mp3 = new MP3();

async function loadForSpec(filename: string): Promise<void> {
	debug('loadForSpec', 'loading', filename);
	const result = await mp3.read(filename, {id3v1: true, id3v2: true});
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
	const result = await mp3.read(filename, {id3v1: true, id3v2: true});
	should().exist(result);
	if (!result) {
		return;
	}
	if (result.id3v1) {
		await compareID3v1Save(filename, result.id3v1);
	}
	if (result.id3v2 && result.id3v2.head && result.id3v2.head.valid) {
		await compareID3v2Save(filename, result.id3v2);
	}
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
	const allframes = result.frames && result.frames.audio ? result.frames.audio || [] : [];
	let frames = filterBestMPEGChain(allframes, 50);
	const head = result.frames && result.frames.headers ? result.frames.headers[0] : undefined;
	if (head) {
		const j = compareframes.findIndex(f => f.offset === head.header.offset);
		if (j < 0) {
			// probe removes xing frames sometimes
			frames = frames.filter(f => rawHeaderOffSet(f) !== head.header.offset);
		}
	}
	// saveIfNotExists(filename + '.frames.jam.filtered.json', frames);
	if (frames.length !== compareframes.length) {
		const missing: Array<number> = [];
		frames.forEach(frame => {
			if (!compareframes.find(f => f.offset === rawHeaderOffSet(frame))) {
				missing.push(rawHeaderOffSet(frame));
			}
		});
		if (missing.length > 0) {
			// console.log('missing frame offsets in probe', missing);
			frames = frames.filter(f => {
				return missing.indexOf(rawHeaderOffSet(f)) < 0;
			});
		}
		const missing2: Array<number> = [];
		compareframes.forEach(frame => {
			if (!frames.find(f => rawHeaderOffSet(f) === frame.offset)) {
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
		const header: IMP3.FrameHeader = expandRawHeader(expandRawHeaderArray(frame));
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
	const result = await mp3.read(filename, {mpeg: true, id3v2: true});
	should().exist(result);
	if (!result || !result.frames) {
		return;
	}
	const exists = await fse.pathExists(filename + '.frames.json');
	if (exists) {
		await loadFramesCompareProbe(filename, result);
	} else {
		throw new Error('Testset incomplete, missing filename.frames.json')
	}
}

async function compareRemovalAudio(before: IMP3.Result, after: IMP3.Result): Promise<void> {
	if (!before.frames || !after.frames) {
		return Promise.reject(Error('no frames obj'));
	}
	expect(after.frames.headers.length).to.equal(before.frames.headers.length, 'header frames length not equal');
	expect(after.frames.audio.length).to.equal(before.frames.audio.length, 'audio frames length not equal');
}

async function removeID3v1TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const result = await mp3.removeTags(file.name, {id3v1: true, id3v2: false});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	file.removeCallback();
	should().exist(result);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(true, 'result should report removed id3v1 tag (id3v1.remove)');
	expect(result.id3v2).to.equal(false, 'result should not report removed id3v2 tag (id3v1.remove)');
	expect(!!after.id3v2).to.equal(!!before.id3v2, 'id3v2 tag should be unchanged (id3v1.remove)');
	expect(!!after.id3v1).to.equal(false, 'id3v1 tag should no longer exists (id3v1.remove)');
	return compareRemovalAudio(before, after);
}

async function removeID3v2TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const result = await mp3.removeTags(file.name, {id3v1: false, id3v2: true});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	const cleanFileSize = (await fse.stat(file.name)).size;
	const id3v2 = new ID3v2();
	await id3v2.write(file.name, (new ID3V24TagBuilder()).buildTag(), 4, 0);
	await mp3.removeTags(file.name, {id3v1: false, id3v2: true});
	const cleanFileSize2 = (await fse.stat(file.name)).size;
	file.removeCallback();
	should().exist(result);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(false, 'result should not report removed id3v1 tag (id3v2.remove)');
	expect(result.id3v2).to.equal(true, 'result should report removed id3v2 tag (id3v2.remove)');
	expect(!!after.id3v1).to.equal(!!before.id3v1, 'id3v1 tag should be unchanged (id3v2.remove)');
	expect(!!after.id3v2).to.equal(false, 'id3v2 tag should no longer exists (id3v2.remove)');
	await compareRemovalAudio(before, after);
	expect(cleanFileSize2).to.equal(cleanFileSize, 'padding leftovers not removed');
}

async function removeID3TagsTest(filename: string, before: IMP3.Result): Promise<void> {
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copyFile(filename, file.name);
	const result = await mp3.removeTags(file.name, {id3v1: true, id3v2: true});
	const after = await mp3.read(file.name, {id3v1: true, id3v2: true, mpeg: true});
	const empty = await mp3.removeTags(file.name, {id3v1: true, id3v2: false});
	file.removeCallback();
	should().exist(result);
	should().not.exist(empty);
	if (!result) {
		return;
	}
	expect(result.id3v1).to.equal(true, 'result should report removed id3v1 tag (id3v2&1.remove)');
	expect(result.id3v2).to.equal(true, 'result should report removed id3v2 tag (id3v2&1.remove)');
	expect(!!after.id3v1).to.equal(false, 'id3v1 tag should no longer exists (id3v2&1.remove)');
	expect(!!after.id3v2).to.equal(false, 'id3v2 tag should no longer exists (id3v2&1.remove)');
	return compareRemovalAudio(before, after);
}

async function removeTagsTest(filename: string): Promise<void> {
	const before = await mp3.read(filename, {id3v1: true, id3v2: true, mpeg: true});
	if (before.id3v1) {
		await removeID3v1TagsTest(filename, before);
	}
	if (before.id3v2) {
		await removeID3v2TagsTest(filename, before);
	}
	if (before.id3v1 && before.id3v2) {
		await removeID3TagsTest(filename, before);
	}
}

async function loadMPEGCompare(filename: string): Promise<void> {
	debug('mp3test', 'loading', filename);
	const exists = await fse.pathExists(filename + '.frames.json');
	if (!exists) {
		throw new Error('Testset incomplete, missing filename.frames.json')
	}
	const compare: ITestSpec = await fse.readJSON(filename + '.frames.json');
	const data = await mp3.read(filename, {mpeg: true, mpegQuick: true, id3v2: true});
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
			if (!data.frames || data.frames.audio.length < 20 && parseInt(compare.stream.nb_read_frames, 10) < 20) {
				return;
			}
			if (data.frames && data.frames.audio.length > 0) {
				audioBytes -= rawHeaderSize(data.frames.audio[0]);
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
	for (const root of roots) {
		describe(root.root, () => {
			for (const filename of root.files) {
				describe(filename.slice(root.root.length), () => {
					it('should load & compare to spec', async () => {
						const exists = await fse.pathExists(filename + '.spec.json');
						if (exists) {
							await loadForSpec(filename);
						} else {
							throw new Error('Testset incomplete, missing filename.spec.json')
						}
					});
					it('should load tags & save tags & compare tags', async () => {
						await loadSaveCompare(filename);
					});
					if (path.extname(filename) !== '.id3') {
						it('should read mpeg frames', async () => {
							await loadFramesCompare(filename);
						}).timeout(200000);
						it('should read mpeg more quick info', async () => {
							await loadMPEGCompare(filename);
						}).timeout(10000);
						it('should remove tags', async () => {
							await removeTagsTest(filename);
						}).timeout(10000);
					}
				});
			}
		});
	}
	run(); // https://github.com/mochajs/mocha/issues/2221#issuecomment-214636042
});

