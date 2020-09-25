import commander from 'commander';
import fse from 'fs-extra';
import {collectFiles} from './utils';

export async function runTool(program: commander.CommanderStatic, onFile: (filename: string) => Promise<void>) {
	let input = program.input;
	if (!input && program.args[0]) {
		input = program.args[0];
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
