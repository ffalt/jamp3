import {IMP3AnalyzerOptions, IMP3Report, MP3Analyzer} from '../lib/mp3/mp3_analyzer';
import {collectFiles} from '../lib/common/utils';
import program from 'commander';
import fse from 'fs-extra';

const pack = require('../../package.json');

program
	.version(pack.version, '-v, --version')
	.usage('[options] <fileOrDir>')
	.option('-i, --input <fileOrDir>', 'mp3 file or folder')
	.option('-r, --recursive', 'scan the folder recursive')
	.option('-w, --warnings', 'show results only for files with warnings')
	.option('-x, --ignoreXingOffOne', 'ignore most common error in off-by-one XING header declaration')
	.option('-f, --format <format>', 'format of analyze result (plain|json)', /^(plain|json)$/i, 'plain')
	.option('-d, --dest <file>', 'destination analyze result file')
	.parse(process.argv);

const result: Array<IMP3Report> = [];
const options: IMP3AnalyzerOptions = {mpeg: true, xing: true, id3v2: true, id3v1: true};

function toPlain(report: IMP3Report): string {
	const sl: Array<string> = [report.filename];
	const features: Array<string> = [];
	if (report.frames) {
		features.push(report.frames + ' Frames');
	}
	if (report.durationMS) {
		features.push('Duration ' + report.durationMS + 'ms');
	}
	if (report.mode) {
		features.push(report.mode + (report.bitRate ? ' ' + report.bitRate : ''));
	}
	if (report.format) {
		features.push(report.format);
	}
	if (report.channels) {
		features.push('Channels ' + report.channels + (report.channelMode ? ' (' + report.channelMode + ')' : ''));
	}
	if (report.header) {
		features.push(report.header);
	}
	if (report.id3v1) {
		features.push('ID3v1');
	}
	if (report.id3v2) {
		features.push('ID3v2');
	}
	sl.push(features.join(', '));
	if (report.msgs.length > 0) {
		sl.push('WARNINGS:');
		report.msgs.forEach(msg => {
			sl.push(msg.msg + ' (expected: ' + msg.expected + ', actual: ' + msg.actual + ')');
		});
	}
	return sl.join('\n');
}

async function onFile(filename: string): Promise<void> {
	const probe = new MP3Analyzer();
	const info = await probe.read(filename, options);
	if (!program.warnings || info.msgs.length > 0) {
		if (program.dest) {
			result.push(info);
		} else if (program.format === 'plain') {
			console.log(toPlain(info) + '\n');
		} else {
			console.log(JSON.stringify(info, null, '\t'));
		}
	}
}

async function run(): Promise<void> {
	let input = program.input;
	if (!input) {
		if (program.args[0]) {
			input = program.args[0];
			// if (program.args[1]) {
			// 	destfile = program.args[1];
			// }
		}
	}
	if (program.ignoreXingOffOne) {
		options.ignoreXingOffOne = program.ignoreXingOffOne;
	}
	if (!input || input.length === 0) {
		return Promise.reject(Error('must specify a filename/directory'));
	}
	const stat = await fse.stat(input);
	if (stat.isDirectory()) {
		await collectFiles(input, ['.mp3'], program.recursive, onFile);
	} else {
		await onFile(input);
	}
	if (program.dest) {
		if (program.format === 'plain') {
			await fse.writeFile(program.dest, result.map(r => toPlain(r)).join('\n'));
		} else {
			await fse.writeFile(program.dest, JSON.stringify(result, null, '\t'));
		}
	}
}

run().catch(e => {
	console.error(e);
});
