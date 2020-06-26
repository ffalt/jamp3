import fse from 'fs-extra';
import program from 'commander';

import {runTool} from '../lib/common/tool';
import {ID3v2} from '../lib/id3v2/id3v2';
import {toPrettyJsonWithBin} from '../lib/common/pretty-json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
		dump = {filename, tag: program.full ? tag : ID3v2.simplify(tag)};
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
	await runTool(program, onFile);
	if (program.dest) {
		await fse.writeFile(program.dest, toPrettyJsonWithBin(result));
	}
}

run().catch(e => {
	console.error(e);
});
