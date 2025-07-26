import { Command } from 'commander';
import fse from 'fs-extra';
import { collectFiles } from './utils';

export async function runTool(program: Command, onFile: (filename: string) => Promise<void>) {
	let input = program.opts().input;
	if (!input && program.args[0]) {
		input = program.args[0];
	}
	if (!input || input.length === 0) {
		return Promise.reject(new Error('must specify a filename/directory'));
	}
	const stat = await fse.stat(input);
	await (stat.isDirectory() ? collectFiles(input, ['.mp3'], program.opts().recursive, onFile) : onFile(input));
}
