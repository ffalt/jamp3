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

export function omit(obj: any, omitKeys: Array<string>): any {
	if (Array.isArray(obj)) {
		return obj.map(o => omit(o, omitKeys));
	}
	if (typeof obj !== 'object') {
		return obj;
	}
	return Object.keys(obj).reduce((result, key) => {
		if (!omitKeys.includes(key)) {
			(result as any)[key] = omit(obj[key], omitKeys);
		}
		return result;
	}, {});
}

export function collectTestFilesSync(dirs: Array<string>, rootDir: string, testSingleFile?: string): Array<string> {
	let files: Array<string> = [];
	for (const dir of dirs) {
		const files1 = fse.readdirSync(path.join(rootDir, dir));
		for (const f of files1) {
			const stat = fse.lstatSync(path.join(rootDir, dir, f));
			if (stat.isDirectory()) {
				files = files.concat(collectTestFilesSync([f], path.join(rootDir, dir), testSingleFile));
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

export async function hasSpec(filename: string): Promise<any> {
	return (await fse.pathExists(filename + '.spec.json'));
}

export async function loadSpec(filename: string): Promise<any> {
	return await fse.readJSON(filename + '.spec.json');
}

export async function wait(duration: number = 100): Promise<void> {
	return new Promise<void>(function(resolve, reject) {
		setTimeout(function() {
			resolve();
		}, duration);
	});
}
