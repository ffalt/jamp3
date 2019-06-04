"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mp3_reader_1 = require("../mp3/mp3_reader");
const fs_extra_1 = __importDefault(require("fs-extra"));
const streams_1 = require("./streams");
function updateFile(filename, opts, keepBackup, canProcess, process) {
    return __awaiter(this, void 0, void 0, function* () {
        const reader = new mp3_reader_1.MP3Reader();
        const layout = yield reader.read(filename, opts);
        if (!canProcess(layout)) {
            return;
        }
        let exists = yield fs_extra_1.default.pathExists(filename + '.tempmp3');
        if (exists) {
            yield fs_extra_1.default.remove(filename + '.tempmp3');
        }
        const fileWriterStream = new streams_1.FileWriterStream();
        yield fileWriterStream.open(filename + '.tempmp3');
        try {
            yield process(layout, fileWriterStream);
        }
        catch (e) {
            yield fileWriterStream.close();
            return Promise.reject(e);
        }
        yield fileWriterStream.close();
        exists = yield fs_extra_1.default.pathExists(filename + '.bak');
        if (keepBackup) {
            if (!exists) {
                yield fs_extra_1.default.rename(filename, filename + '.bak');
            }
            else {
                yield fs_extra_1.default.remove(filename);
            }
        }
        else {
            if (exists) {
                yield fs_extra_1.default.remove(filename + '.bak');
            }
            yield fs_extra_1.default.rename(filename, filename + '.bak');
        }
        yield fs_extra_1.default.rename(filename + '.tempmp3', filename);
        if (!keepBackup) {
            yield fs_extra_1.default.remove(filename + '.bak');
        }
    });
}
exports.updateFile = updateFile;
//# sourceMappingURL=update-file.js.map