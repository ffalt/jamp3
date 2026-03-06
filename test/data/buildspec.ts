/**
 * Generate .spec.json files for ID3v2/ID3v1 test files.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs","moduleResolution":"node"}' local/local/buildspec.ts <dir-or-file> [...]
 *
 * Example:
 *   npx ts-node --compiler-options '{"module":"commonjs","moduleResolution":"node"}' local/local/buildspec.ts test/data/testfiles/id3v2/mutagen
 *
 * Skips files that already have a .spec.json.
 * Pass --overwrite to regenerate existing specs.
 */

import fse from 'fs-extra';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { ID3v1 } from '../../src/lib/id3v1/id3v1';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types';
import { ITestSpecFrame } from '../common/spec';
import { probe } from './ffprobe';
import path from 'node:path';

function omitBin(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(o => omitBin(o));
	}
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	const result: any = {};
	for (const key of Object.keys(obj)) {
		if (key !== 'bin') {
			result[key] = omitBin(obj[key]);
		}
	}
	return result;
}

function frameToSpec(frame: IID3V2.Frame): any {
	const spec: any = { id: frame.id };
	if (frame.head?.size !== undefined) {
		spec.size = frame.head.size;
	}
	if (frame.invalid) {
		spec.invalid = true;
		return spec;
	}
	spec.value = omitBin(frame.value);
	if (frame.head?.formatFlags) {
		const ff = frame.head.formatFlags;
		const hasTrue = Object.keys(ff).some(k => ff[k]);
		if (hasTrue) {
			const specFlags: any = {};
			for (const k of Object.keys(ff)) {
				if (ff[k]) {
					specFlags[k] = true;
				}
			}
			spec.formatFlags = specFlags;
		}
	}
	if (frame.groupId !== undefined) {
		spec.groupId = frame.groupId;
	}
	if (frame.subframes && frame.subframes.length > 0) {
		spec.subframes = frame.subframes.map(frameToSpec);
	}
	return spec;
}

async function buildSpecForFile(filename: string, overwrite: boolean): Promise<void> {
	const specFile = `${filename}.spec.json`;
	if (!overwrite && await fse.pathExists(specFile)) {
		console.log('skip (exists):', path.relative(process.cwd(), specFile));
		return;
	}
	const spec: any = {};
	try {
		const id3v2 = new ID3v2();
		const tag = await id3v2.read(filename);
		if (tag?.head) {
			spec.id3v2 = {
				ver: tag.head.ver,
				size: tag.head.size,
				subversion: tag.head.rev,
				frames: tag.frames.map(frameToSpec)
			};
		}
	} catch (e) {
		console.error('id3v2 read error on', filename, e);
	}
	try {
		const id3v1 = new ID3v1();
		const v1tag = await id3v1.read(filename);
		if (v1tag) {
			spec.id3v1 = {
				version: v1tag.version,
				value: v1tag.value
			};
		}
	} catch (e) {
		console.error('id3v1 read error on', filename, e);
	}
	await fse.writeJSON(specFile, spec, { spaces: '\t' });
	console.log('written:', path.relative(process.cwd(), specFile));
}

async function saveProbeFrames(filename: string, overwrite: boolean): Promise<void> {
	const specFile = `${filename}.frames.json`;
	if (!overwrite && await fse.pathExists(specFile)) {
		console.log('skip (exists):', path.relative(process.cwd(), specFile));
		return;
	}
	const data = await probe(filename, ['-show_frames', '-count_frames', '-show_format']);
	if (!data) {
		return;
	}
	const frames: Array<ITestSpecFrame> = (data.frames || []).filter(f => f.media_type === 'audio').map(frame => {
		return {
			offset: parseInt(frame.pkt_pos, 10),
			size: parseInt(frame.pkt_size, 10),
			time: parseFloat(frame.duration_time) * 1000,
			samples: frame.nb_samples,
			channels: frame.channels
		};
	});
	const stream = (data.streams || []).find((s: { codec_type: string; }) => s.codec_type === 'audio');
	const keys = frames.length > 0 ? Object.keys(frames[0]) : [];
	const myCompactString = '{\n\t' +
		(stream ? '"stream": ' + JSON.stringify(stream) + ',\n\t' : '')
		+ '"cols": ' + JSON.stringify(keys) + ',\n\t"frames": [\n\t\t' +
		frames.map(frame => {
			return JSON.stringify(keys.map((key: string) => frame[key]));
		}).join(',\n\t\t') +
		'\n\t]\n}';
	await fse.writeFile(specFile, myCompactString);
	console.log('written:', path.relative(process.cwd(), specFile));
}

function collectFiles(dir: string): Array<string> {
	let result: Array<string> = [];
	for (const f of fse.readdirSync(dir)) {
		const full = path.join(dir, f);
		if (fse.lstatSync(full).isDirectory()) {
			result = result.concat(collectFiles(full));
		} else if (['.mp3', '.id3'].includes(path.extname(f).toLowerCase())) {
			result.push(full);
		}
	}
	return result;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2).filter(a => a !== '--overwrite');
	const overwrite = process.argv.includes('--overwrite');
	if (args.length === 0) {
		console.error('Usage: npx ts-node --compiler-options \'{"module":"commonjs","moduleResolution":"node"}\' local/local/buildspec.ts [--overwrite] <dir-or-file> [...]');
		process.exit(1);
	}
	for (const arg of args) {
		const stat = await fse.stat(arg);
		const files = stat.isDirectory() ? collectFiles(arg) : [arg];
		for (const file of files) {
			await buildSpecForFile(file, overwrite);
			await saveProbeFrames(file, overwrite);
		}
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});

