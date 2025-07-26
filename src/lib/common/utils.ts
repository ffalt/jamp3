// http://en.wikipedia.org/wiki/Synchsafe

import fs from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';

export function isBitSetAt(byte: number, bit: number) {
	return (byte & 1 << bit) !== 0;
}

export function flags(names: Array<string>, values: Array<number>): Record<string, boolean> {
	const result: Record<string, boolean> = {};
	for (const [i, name] of names.entries()) {
		result[name] = !!values[i];
	}
	return result;
}

export function unflags(names: Array<string>, flagsObj?: Record<string, boolean | undefined>): Array<number> {
	return names.map(name => flagsObj && flagsObj[name] ? 1 : 0);
}

export function synchsafe(input: number): number {
	let current = input;
	let out;
	let mask = 0x7F;
	while (mask ^ 0x7F_FF_FF_FF) {
		out = current & ~mask;
		out = out << 1;
		out = out | (current & mask);
		mask = ((mask + 1) << 8) - 1;
		current = out;
	}
	if (out === undefined) {
		return 0;
	}
	return out;
}

export function unsynchsafe(input: number): number {
	let out = 0, mask = 0x7F_00_00_00;
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

export function bitarray(byte: number): Array<number> {
	return [128, 64, 32, 16, 8, 4, 2, 1].map(offset => (byte & offset) === offset ? 1 : 0);
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
		if (s.codePointAt(j) === 0) {
			return s.slice(0, j);
		}
	}
	return s;
}

export function neededStoreBytes(num: number, min: number) {
	let result = Math.ceil((Math.floor(Math.log2(num) + 1) + 1) / 8);
	result = Math.max(result, min);
	return result;
}

export async function fileRangeToBuffer(filename: string, start: number, end: number): Promise<Buffer> {
	const chunks: Array<Buffer<ArrayBufferLike>> = [];
	return new Promise<Buffer>((resolve, reject) => {
		try {
			const readStream = fs.createReadStream(filename, { start, end });
			readStream.on('data', chunk => {
				chunks.push(chunk as Buffer<ArrayBufferLike>);
			});
			readStream.on('error', e => {
				reject(e);
			});
			readStream.on('close', () => {
				resolve(Buffer.concat(chunks));
			});
		} catch (error) {
			return reject(error);
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
		} else if ((ext.includes(path.extname(f).toLowerCase()))) {
			await onFileCB(sub);
		}
	}
}

export function validCharKeyCode(c: number): boolean {
	// /0-9 A-Z/
	return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
