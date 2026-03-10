import { program } from 'commander';

import { MP3 } from '../lib/mp3/mp3';
import { runTool } from '../lib/common/tool';

import pack from '../../package.json';

program
	.version(pack.version, '-v, --version')
	.usage('[options]')
	.option('-i, --input <fileOrDir>', 'mp3 file or folder to remove ID3v1')
	.option('-r, --recursive', 'scan the folder recursive')
	.option('-o, --onlyIfId3v2', 'remove ID3v1 only if ID3v2 exists')
	.option('-b, --keepBackup', 'keep original file as .bak file')
	.option('-s, --silent', 'report changed files only')
	.parse(process.argv);

const mp3 = new MP3();

function log(msg: string, filename: string, important?: boolean): void {
	if (!program.opts().silent || important) {
		console.log(filename);
		console.log(msg);
	}
}

async function onFile(filename: string): Promise<void> {
	if (program.opts().onlyIfId3v2) {
		const tag = await mp3.read(filename, { id3v2: true, id3v1: true });
		if (!tag.id3v2) {
			log('ℹ️ No ID3v2 found. Ignoring this file.', filename);
			return;
		}
		if (!tag.id3v1) {
			log('ℹ️ No ID3v1 found.', filename);
			return;
		}
	}
	const result = await mp3.removeTags(filename, { id3v1: true, id3v2: false, keepBackup: program.opts().keepBackup });
	if (result) {
		if (result.id3v1) {
			log('👍 ID3v1 removed.', filename, true);
		} else {
			log('ℹ️ No ID3v1 found.', filename);
		}
	} else {
		log('ℹ️ No ID3v1 found.', filename);
	}
}

async function run(): Promise<void> {
	await runTool(program, onFile);
}

run().catch(error => {
	console.error(error);
});
