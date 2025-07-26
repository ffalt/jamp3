import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import pack from '../../package.json';

const execP = promisify(exec);

const BinPath = path.join(__dirname, '..', '..', 'dist', 'bin');

describe('cmdline', () => {
	it('should have a dist bin build available', async () => {
		expect(fs.existsSync(BinPath)).toBe(true);
	});
	it('should return the analyzeMP3 version', async () => {
		const { stdout } = await execP(`node ${path.join(BinPath, 'analyzeMP3.js' + ' --version')}`);
		expect(stdout.trim()).toBe(pack.version);
	});
	it('should return the dumpID3v1 version', async () => {
		const { stdout } = await execP(`node ${path.join(BinPath, 'dumpID3v1.js' + ' --version')}`);
		expect(stdout.trim()).toBe(pack.version);
	});
	it('should return the dumpID3v2 version', async () => {
		const { stdout } = await execP(`node ${path.join(BinPath, 'dumpID3v2.js' + ' --version')}`);
		expect(stdout.trim()).toBe(pack.version);
	});
	it('should return the removeID3v1 version', async () => {
		const { stdout } = await execP(`node ${path.join(BinPath, 'removeID3v1.js' + ' --version')}`);
		expect(stdout.trim()).toBe(pack.version);
	});
});
