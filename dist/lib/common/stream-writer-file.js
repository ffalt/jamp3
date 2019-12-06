"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_writer_1 = require("./stream-writer");
const fs_1 = __importDefault(require("fs"));
class FileWriterStream extends stream_writer_1.WriterStream {
    constructor() {
        super();
    }
    open(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.wstream = fs_1.default.createWriteStream(filename);
            }
            catch (err) {
                return Promise.reject(err);
            }
            return new Promise((resolve, reject) => {
                this.wstream.once('open', (fd) => {
                    resolve();
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.wstream.on('close', () => {
                    resolve();
                });
                this.wstream.end();
            });
        });
    }
    pipeStream(readstream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                readstream.on('error', (err) => {
                    return reject(err);
                });
                readstream.on('end', (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
                readstream.pipe(this.wstream, { end: false });
            });
        });
    }
    copyRange(filename, start, finish) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pipeStream(fs_1.default.createReadStream(filename, { start, end: finish }));
        });
    }
    copyFrom(filename, position) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pipeStream(fs_1.default.createReadStream(filename, { start: position }));
        });
    }
}
exports.FileWriterStream = FileWriterStream;
//# sourceMappingURL=stream-writer-file.js.map