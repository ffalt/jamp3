import { WriterStream } from './stream-writer';
import fs from 'node:fs';

export class FileWriterStream extends WriterStream {
	async open(filename: string): Promise<void> {
		try {
			this.wstream = fs.createWriteStream(filename);
		} catch (error) {
			return Promise.reject(error);
		}
		return new Promise<void>((resolve, _reject) => {
			this.wstream.once('open', () => {
				resolve();
			});
		});
	}

	async close(): Promise<void> {
		return new Promise<void>((resolve, _reject) => {
			this.wstream.on('close', () => {
				resolve();
			});
			this.wstream.end();
		});
	}

	private async pipeStream(readstream: fs.ReadStream): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			readstream.on('error', error => reject(error));
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
