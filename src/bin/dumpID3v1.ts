import {program} from 'commander';
import fse from 'fs-extra';

import {ID3v1} from '../lib/id3v1/id3v1';
import {runTool} from '../lib/common/tool';

import pack from '../../package.json';

program
	.version(pack.version, '-v, --version')
	.usage('[options]')
	.option('-i, --input <fileOrDir>', 'mp3 file or folder')
	.option('-r, --recursive', 'dump the folder recursive')
	.option('-d, --dest <file>', 'destination analyze result file')
	.parse(process.argv);

const id3v1 = new ID3v1();

interface IDumpResult {
	filename: string;
	tag?: any;
	error?: string;
}

const result: Array<IDumpResult> = [];

async function onFile(filename: string): Promise<void> {
	const tag = await id3v1.read(filename);
	let dump: IDumpResult;
	if (tag) {
		dump = {filename, tag: tag};
	} else {
		dump = {error: 'No tag found', filename};
	}
	if (program.opts().dest) {
		result.push(dump);
	} else {
		console.log(JSON.stringify(dump, null, '\t'));
	}
}

async function run(): Promise<void> {
	await runTool(program, onFile);
	if (program.opts().dest) {
		await fse.writeJSON(program.opts().dest, result);
	}
}

run()
	.catch(e => {
		console.error(e);
	});
