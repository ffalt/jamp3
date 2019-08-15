import fse from 'fs-extra';
import {ITestSpec} from '../common/test-spec';
import {expect, should} from 'chai';
import {rawHeaderSize} from '../../src/lib/mp3/mp3_frame';
import Debug from 'debug';
import {MP3} from '../../src';

const debug = Debug('mp3-test');

export async function testQuickMPEG(filename: string): Promise<void> {
	debug('QuickMPEG', 'loading', filename);
	const exists = await fse.pathExists(filename + '.frames.json');
	if (!exists) {
		throw new Error('Testset incomplete, missing filename.frames.json')
	}
	const mp3 = new MP3();
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
