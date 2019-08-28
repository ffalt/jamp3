import {ID3v1, MP3} from '..';
import {collectFiles} from '../lib/common/utils';
import program from 'commander';

const pack = require('../../package.json');
import fse from 'fs-extra';

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
	if (!program.silent || important) {
		console.log(filename);
		console.log(msg);
	}
}

async function onFile(filename: string): Promise<void> {
	if (program.onlyIfId3v2) {
		const tag = await mp3.read(filename, {id3v2: true, id3v1: true});
		if (!tag.id3v2) {
			log('ℹ️ No ID3v2 found. Ignoring this file.', filename);
			return;
		}
		if (!tag.id3v1) {
			log('ℹ️ No ID3v1 found.', filename);
			return;
		}
	}
	const result = await mp3.removeTags(filename, {id3v1: true, id3v2: false, keepBackup: program.keepBackup});
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
	let input = program.input;
	if (!input) {
		if (program.args[0]) {
			input = program.args[0];
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
}

run().catch(e => {
	console.error(e);
});
