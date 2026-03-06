import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const cache: Record<string, string> = {};

const isWindows = process.platform === 'win32' ||
	process.env.OSTYPE === 'cygwin' ||
	process.env.OSTYPE === 'msys';
const COLON = isWindows ? ';' : ':';

function getPathInfo(cmd: string, opt: { colon?: string; path?: string; pathExt?: string }) {
	const colon = opt.colon || COLON;
	let pathEnv: Array<string> = (opt.path || process.env.PATH || '').split(colon);
	let pathExt = [''];
	let pathExtExe = '';

	if (isWindows) {
		pathEnv.unshift(process.cwd());
		pathExtExe = opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM';
		pathExt = pathExtExe.split(colon);
		if (cmd.indexOf('.') !== -1 && pathExt[0] !== '') {
			pathExt.unshift('');
		}
	}

	// If it has a slash, don't bother searching the pathenv.
	if (cmd.match(/\//) || (isWindows && cmd.match(/\\/))) {
		pathEnv = [''];
	}

	return { env: pathEnv, ext: pathExt, extExe: pathExtExe };
}

function getNotFoundError(cmd: string): Error {
	const er = new Error('not found: ' + cmd);
	(er as any).code = 'ENOENT';
	return er;
}

async function isExecutable(filePath: string): Promise<boolean> {
	try {
		await fs.promises.access(filePath, isWindows ? fs.constants.F_OK : fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}

async function whichs(cmd: string): Promise<string> {
	const info = getPathInfo(cmd, {});
	const { env: pathEnv, ext: pathExt } = info;

	for (let i = 0; i < pathEnv.length; i++) {
		let pathPart = pathEnv[i];
		if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"') {
			pathPart = pathPart.slice(1, -1);
		}
		let p = path.join(pathPart, cmd);
		if (!pathPart && /^\.[\\\/]/.test(cmd)) {
			p = cmd.slice(0, 2) + p;
		}
		for (const ext of pathExt) {
			if (await isExecutable(p + ext)) {
				return p + ext;
			}
		}
	}
	throw getNotFoundError(cmd);
}

async function which(name: string): Promise<string> {
	if (name in cache) {
		return cache[name];
	}
	try {
		const result = await whichs(name);
		cache[name] = result;
		return result;
	} catch {
		cache[name] = '';
		return '';
	}
}

async function getFfmpegPath(): Promise<string> {
	if ('ffmpegPath' in cache) {
		return cache.ffmpegPath;
	}
	// Try FFMPEG_PATH env var
	if (process.env.FFMPEG_PATH) {
		try {
			await fs.promises.access(process.env.FFMPEG_PATH);
			return (cache.ffmpegPath = process.env.FFMPEG_PATH);
		} catch { /* not found */ }
	}
	// Search in PATH
	const ffmpeg = await which('ffmpeg');
	return (cache.ffmpegPath = ffmpeg);
}

async function getFfprobePath(): Promise<string> {
	if ('ffprobePath' in cache) {
		return cache.ffprobePath;
	}
	// Try FFPROBE_PATH env var
	if (process.env.FFPROBE_PATH) {
		try {
			await fs.promises.access(process.env.FFPROBE_PATH);
			return (cache.ffprobePath = process.env.FFPROBE_PATH);
		} catch { /* not found */ }
	}
	// Search in PATH
	const ffprobe = await which('ffprobe');
	if (ffprobe) {
		return (cache.ffprobePath = ffprobe);
	}
	// Search in same directory as ffmpeg
	const ffmpeg = await getFfmpegPath();
	if (ffmpeg) {
		const name = isWindows ? 'ffprobe.exe' : 'ffprobe';
		const fp = path.join(path.dirname(ffmpeg), name);
		try {
			await fs.promises.access(fp);
			return (cache.ffprobePath = fp);
		} catch { /* not found */ }
	}
	return (cache.ffprobePath = '');
}

export interface IProbeResult {
	format: {
		filename: string;
		nb_streams: number;
		nb_programs: number;
		format_name: string; // 'mp3',
		format_long_name: string; // 'MP2/3 (MPEG audio layer 2/3)',
		start_time: string; // '0.000000',
		duration: string; // '662.499375',
		size: string; // '10600329',
		bit_rate: string; // '128004',
		probe_score: number;
		tags: { [name: string]: string };
	};
	frames?: Array<{
		media_type: string; //  'audio',
		stream_index: number; // 0,
		key_frame: number; // 1,
		pkt_pts: number; // 0,
		pkt_pts_time: string; //  '0.000000',
		pkt_dts: number; // 0,
		pkt_dts_time: string; //  '0.000000',
		best_effort_timestamp: number; // 0,
		best_effort_timestamp_time: string; //  '0.000000',
		duration: number; // 508032,
		duration_time: string; //  '0.036000',
		pkt_pos: string; // '0',
		pkt_size: string; // '288',
		sample_fmt: string; //  'fltp',
		nb_samples: number; // 1152,
		channels: number; // 1,
		channel_layout: string; //  'mono'
	}>;
	streams?: Array<{
		index: number;
		width: number;
		height: number;
		codec_name: string;
		codec_long_name: string;
		codec_type: string;
		codec_time_base: string; // '1/44100',
		codec_tag_string: string; //  '[0][0][0][0]',
		mode: string;
		channels: number;
		bits_per_sample: number;
		codec_tag: string; //  '0x0000',
		sample_fmt: string; //  'fltp',
		sample_rate: string; //  '44100',
		channel_layout: string; //  'stereo',
		r_frame_rate: string; // '0/0',
		avg_frame_rate: string; // '0/0',
		time_base: string; // '1/14112000',
		nb_read_frames: string; // "10020";
		start_pts: number;
		start_time: string;
		duration_ts: number;
		duration: string;
		bit_rate: string;
		disposition?: {
			default: number;
			dub: number;
			original: number;
			comment: number;
			lyrics: number;
			karaoke: number;
			forced: number;
			hearing_impaired: number;
			visual_impaired: number;
			clean_effects: number;
			attached_pic: number;
			timed_thumbnails: number;
		};
		side_data_list?: Array<{
			side_data_type: string; // 'Replay Gain'
		}>;
	}>;
}

export async function probe(filename: string, cmds: Array<string>): Promise<IProbeResult> {
	const ffprobe = await getFfprobePath();
	return new Promise<IProbeResult>((resolve, reject) => {
		const child = spawn(ffprobe, [
			'-print_format', 'json',
			'-show_error',
			'-show_streams',
			'-show_format',
			...cmds,
			filename
		]);
		let result = '';
		child.stdout.on('data', (data: string) => {
			result += data;
		});
		child.on('close', () => {
			try {
				resolve(JSON.parse(result));
			} catch (e) {
				reject(e);
			}
		});
		child.on('error', reject);
	});
}
