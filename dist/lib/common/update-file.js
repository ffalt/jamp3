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
const mp3_reader_1 = require("../mp3/mp3.reader");
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_writer_file_1 = require("./stream-writer-file");
function updateFile(filename, options, keepBackup, canProcess, process) {
    return __awaiter(this, void 0, void 0, function* () {
        const reader = new mp3_reader_1.MP3Reader();
        const layout = yield reader.read(filename, options);
        if (!canProcess(layout)) {
            return;
        }
        const tmpFile = filename + '.tempmp3';
        const bakFile = filename + '.bak';
        const exists = yield fs_extra_1.default.pathExists(tmpFile);
        if (exists) {
            yield fs_extra_1.default.remove(tmpFile);
        }
        const fileWriterStream = new stream_writer_file_1.FileWriterStream();
        yield fileWriterStream.open(tmpFile);
        try {
            yield process(layout, fileWriterStream);
        }
        catch (e) {
            yield fileWriterStream.close();
            return Promise.reject(e);
        }
        yield fileWriterStream.close();
        const bakExists = yield fs_extra_1.default.pathExists(bakFile);
        if (keepBackup) {
            if (!bakExists) {
                yield fs_extra_1.default.rename(filename, bakFile);
            }
            else {
                yield fs_extra_1.default.remove(filename);
            }
        }
        else if (!bakExists) {
            yield fs_extra_1.default.rename(filename, bakFile);
        }
        yield fs_extra_1.default.rename(tmpFile, filename);
        if (!keepBackup && !bakExists) {
            yield fs_extra_1.default.remove(bakFile);
        }
    });
}
exports.updateFile = updateFile;
//# sourceMappingURL=update-file.js.map