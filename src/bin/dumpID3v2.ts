import fse from 'fs-extra';
import { program } from 'commander';

import { runTool } from '../lib/common/tool';
import { ID3v2 } from '../lib/id3v2/id3v2';
import { toPrettyJsonWithBin } from '../lib/common/pretty-json';

import pack from '../../package.json';

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
	const dump: IDumpResult = tag ? { filename, tag: program.opts().full ? tag : ID3v2.simplify(tag) } : { error: 'No tag found', filename };
	if (program.opts().dest) {
		result.push(dump);
	} else if (program.opts().full) {
		console.log(toPrettyJsonWithBin(dump));
	} else {
		console.log(JSON.stringify(dump, null, '\t'));
	}
}

async function run(): Promise<void> {
	await runTool(program, onFile);
	if (program.opts().dest) {
		await fse.writeFile(program.opts().dest, toPrettyJsonWithBin(result));
	}
}

run().catch(error => {
	console.error(error);
});
