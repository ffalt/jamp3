import {WriterStream} from './stream-writer';
import fs from 'fs';

export class FileWriterStream extends WriterStream {

	constructor() {
		super();
	}

	async open(filename: string): Promise<void> {
		try {
			this.wstream = fs.createWriteStream(filename);
		} catch (err) {
			return Promise.reject(err);
		}
		return new Promise<void>((resolve, reject) => {
			this.wstream.once('open', (fd) => {
				resolve();
			});
		});
	}

	async close(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.wstream.on('close', () => {
				resolve();
			});
			this.wstream.end();
		});
	}

	async copyRange(filename: string, start: number, finish: number): Promise<void> {
		const readstream = fs.createReadStream(filename, {start, end: finish});
		return new Promise<void>((resolve, reject) => {
			readstream.on('error', (err) => {
				return reject(err);
			});
			readstream.on('end', (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
			readstream.pipe(this.wstream, {end: false});
		});
	}

	async copyFrom(filename: string, position: number): Promise<void> {
		const readstream = fs.createReadStream(filename, {start: position});
		return new Promise<void>((resolve, reject) => {
			readstream.on('error', (err) => {
				return reject(err);
			});
			readstream.on('end', (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
			readstream.pipe(this.wstream, {end: false});
		});
	}
}
