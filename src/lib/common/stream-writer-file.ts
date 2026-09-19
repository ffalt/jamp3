import fs from 'node:fs';
import { WriterStream } from './stream-writer.js';

export class FileWriterStream extends WriterStream {
	async open(filename: string): Promise<void> {
		try {
			this.wstream = fs.createWriteStream(filename);
		} catch (error) {
			return Promise.reject(error);
		}
		this.attachErrorHandler();
		return new Promise<void>((resolve, reject) => {
			this.wstream.once('open', () => {
				resolve();
			});
			this.wstream.once('error', reject);
		});
	}

	async close(): Promise<void> {
		if (this.writeError) {
			return Promise.reject(this.writeError);
		}
		return new Promise<void>((resolve, reject) => {
			this.wstream.once('close', () => {
				resolve();
			});
			this.wstream.once('error', reject);
			this.wstream.end();
		});
	}

	private async pipeStream(readstream: fs.ReadStream): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			readstream.on('error', error => reject(error));
			this.wstream.once('error', reject);
			readstream.on('end', () => resolve());
			readstream.pipe(this.wstream, { end: false });
		});
	}

	async copyRange(filename: string, start: number, finish: number): Promise<void> {
		return this.pipeStream(fs.createReadStream(filename, { start, end: finish }));
	}

	async copyFrom(filename: string, position: number): Promise<void> {
		return this.pipeStream(fs.createReadStream(filename, { start: position }));
	}
}
