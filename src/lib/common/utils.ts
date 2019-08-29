/* tslint:disable:no-bitwise */

// http://en.wikipedia.org/wiki/Synchsafe

import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

export function isBitSetAt(byte: number, bit: number) {
	return (byte & 1 << bit) !== 0;
}

export function flags(names: Array<string>, values: Array<number>): {
	[name: string]: boolean;
} {
	const result: {
		[name: string]: boolean;
	} = {};
	names.forEach((name, i) => {
		result[name] = !!values[i];
	});
	return result;
}

export function unflags(names: Array<string>, flagsObj?: { [name: string]: boolean | undefined; }): Array<number> {
	return names.map(name => {
		return flagsObj && flagsObj[name] ? 1 : 0;
	});
}

export function synchsafe(input: number): number {
	let out;
	let mask = 0x7F;
	while (mask ^ 0x7FFFFFFF) {
		out = input & ~mask;
		out = out << 1;
		out = out | (input & mask);
		mask = ((mask + 1) << 8) - 1;
		input = out;
	}
	if (out === undefined) {
		return 0;
	}
	return out;
}

export function unsynchsafe(input: number): number {
	let out = 0, mask = 0x7F000000;
	while (mask) {
		out = out >> 1;
		out = out | (input & mask);
		mask = mask >> 8;
	}
	if (out === undefined) {
		return 0;
	}
	return out;
}

export function log2(x: number): number {
	return Math.log(x) * Math.LOG2E;
}

export function bitarray(byte: number): Array<number> {
	const b = []; // The binary representation
	b[0] = ((byte & 128) === 128 ? 1 : 0);
	b[1] = ((byte & 64) === 64 ? 1 : 0);
	b[2] = ((byte & 32) === 32 ? 1 : 0);
	b[3] = ((byte & 16) === 16 ? 1 : 0);
	b[4] = ((byte & 8) === 8 ? 1 : 0);
	b[5] = ((byte & 4) === 4 ? 1 : 0);
	b[6] = ((byte & 2) === 2 ? 1 : 0);
	b[7] = ((byte & 1) === 1 ? 1 : 0);
	return b;
}

export function unbitarray(bitsarray: Array<number>): number {
	let result = 0;
	for (let i = 0; i < 8; ++i) {
		result = (result * 2) + (bitsarray[i] ? 1 : 0);
	}
	return result;
}

export function bitarray2(byte: number): Array<number> {
	const b = []; // The binary representation
	for (let i = 0; i < 8; ++i) {
		b[7 - i] = (byte >> i) & 1;
	}
	return b;
}

export function isBit(field: number, nr: number): boolean {
	return !!(field & nr);
}

export function removeZeroString(s: string): string {
	for (let j = 0; j < s.length; j++) {
		if (s.charCodeAt(j) === 0) {
			s = s.slice(0, j);
			break;
		}
	}
	return s;
}

export function neededStoreBytes(num: number, min: number) {
	let result = Math.ceil((Math.floor(log2(num) + 1) + 1) / 8);
	result = Math.max(result, min);
	return result;
}

export async function fileRangeToBuffer(filename: string, start: number, end: number): Promise<Buffer> {
	const chunks: Array<Buffer> = [];
	return new Promise<Buffer>((resolve, reject) => {
		try {
			const readStream = fs.createReadStream(filename, {start, end});
			readStream.on('data', chunk => {
				chunks.push(chunk);
			});
			readStream.on('error', e => {
				reject(e);
			});
			readStream.on('close', () => {
				resolve(Buffer.concat(chunks));
			});
		} catch (e) {
			return reject(e);
		}
	});
}

export async function collectFiles(dir: string, ext: Array<string>, recursive: boolean, onFileCB: (filename: string) => Promise<void>): Promise<void> {
	const files1 = await fse.readdir(dir);
	for (const f of files1) {
		const sub = path.join(dir, f);
		const stat = await fse.stat(sub);
		if (stat.isDirectory()) {
			if (recursive) {
				await collectFiles(sub, ext, recursive, onFileCB);
			}
		} else if ((ext.indexOf(path.extname(f).toLowerCase()) >= 0)) {
			await onFileCB(sub);
		}
	}
}

export function validCharKeyCode(c: number): boolean {
	// /0-9 A-Z/
	return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
