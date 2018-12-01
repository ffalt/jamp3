import {ID3v2, simplifyTag} from '..';
import fse from 'fs-extra';
import {collectFiles} from '../lib/common/utils';
import {toPrettyJsonWithBin} from '../lib/common/pretty-json';
import program from 'commander';
const pack = require('../../package.json');

program
	.version(pack.version, '-v, --version')
	.usage('[options]')
	.option('-i, --input <fileOrDir>', 'mp3 file or folder')
	.option('-r, --recursive', 'dump the folder recursive')
	.option('-f, --full', 'full tag output (simple otherwise)')
	.option('-d, --dest <file>', 'destination analyze result file')
	.parse(process.argv);


const id3v2 = new ID3v2();

interface IDumpResult {
	filename: string;
	tag?: any;
	error?: string;
}

const result: Array<IDumpResult> = [];

async function onFile(filename: string): Promise<void> {
	const tag = await id3v2.read(filename);
	let dump: IDumpResult;
	if (tag) {
		dump = {filename, tag: program.full ? tag : simplifyTag(tag)};
	} else {
		dump = {error: 'No tag found', filename};
	}
	if (program.dest) {
		result.push(dump);
	} else if (program.full) {
		console.log(toPrettyJsonWithBin(dump));
	} else {
		console.log(JSON.stringify(dump, null, '\t'));
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
		await fse.writeFile(program.dest, toPrettyJsonWithBin(result));
	}
}

run().catch(e => {
	console.error(e);
});
