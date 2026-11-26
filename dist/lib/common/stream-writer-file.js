import fs from 'node:fs';
import { WriterStream } from './stream-writer.js';
export class FileWriterStream extends WriterStream {
    async open(filename) {
        try {
            this.wstream = fs.createWriteStream(filename);
        }
        catch (error) {
            return Promise.reject(error);
        }
        this.attachErrorHandler();
        return new Promise((resolve, reject) => {
            this.wstream.once('open', () => {
                resolve();
            });
            this.wstream.once('error', reject);
        });
    }
    async close() {
        if (this.writeError) {
            return Promise.reject(this.writeError);
        }
        if (!this.closePromise) {
            this.closePromise = new Promise((resolve, reject) => {
                this.wstream.once('close', () => {
                    resolve();
                });
                this.wstream.once('error', reject);
                this.wstream.end();
            });
        }
        return this.closePromise;
    }
    async pipeStream(readstream) {
        return new Promise((resolve, reject) => {
            readstream.on('error', error => reject(error));
            this.wstream.once('error', reject);
            readstream.on('end', () => resolve());
            readstream.pipe(this.wstream, { end: false });
        });
    }
    async copyRange(filename, start, finish) {
        if (finish <= start) {
            return;
        }
        return this.pipeStream(fs.createReadStream(filename, { start, end: finish - 1 }));
    }
    async copyFrom(filename, position) {
        return this.pipeStream(fs.createReadStream(filename, { start: position }));
    }
}
//# sourceMappingURL=stream-writer-file.js.map