import path from 'path';
import fse from 'fs-extra';

function replacer(name: string, val: any): any {
	if (name === 'bin') {
		return '<bin ' + val.data.length + 'bytes>';
	}
	// // convert RegExp to string
	// if (val && val.constructor === RegExp) {
	// 	return val.toString();
	// } else if (name === 'str') { //
	// 	return undefined; // remove from result
	// } else {
	return val; // return as is
	// }
}

export function toNonBinJson(o: any): string {
	return JSON.stringify(o, replacer, '\t');
}

export async function collectTestFiles(dirs: Array<string>, rootDir: string, testSingleFile?: string): Promise<Array<string>> {
	let files: Array<string> = [];
	for (const dir of dirs) {
		const files1 = await fse.readdir(path.join(rootDir, dir));
		for (const f of files1) {
			const stat = await fse.lstat(path.join(rootDir, dir, f));
			if (stat.isDirectory()) {
				files = files.concat(await collectTestFiles([f], path.join(rootDir, dir), testSingleFile));
			} else if (
				(['.mp3', '.id3'].indexOf(path.extname(f).toLowerCase()) >= 0) &&
				(!testSingleFile || path.join(dir, f).indexOf(testSingleFile) >= 0)
			) {
				files.push(path.join(rootDir, dir, f));
			}
		}
	}
	return files;
}
