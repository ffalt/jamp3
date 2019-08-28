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
const __1 = require("..");
const utils_1 = require("../lib/common/utils");
const commander_1 = __importDefault(require("commander"));
const pack = require('../../package.json');
const fs_extra_1 = __importDefault(require("fs-extra"));
commander_1.default
    .version(pack.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder to remove ID3v1')
    .option('-r, --recursive', 'scan the folder recursive')
    .option('-o, --onlyIfId3v2', 'remove ID3v1 only if ID3v2 exists')
    .option('-b, --keepBackup', 'keep original file as .bak file')
    .option('-s, --silent', 'report changed files only')
    .parse(process.argv);
const mp3 = new __1.MP3();
function log(msg, filename, important) {
    if (!commander_1.default.silent || important) {
        console.log(filename);
        console.log(msg);
    }
}
function onFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commander_1.default.onlyIfId3v2) {
            const tag = yield mp3.read(filename, { id3v2: true, id3v1: true });
            if (!tag.id3v2) {
                log('ℹ️ No ID3v2 found. Ignoring this file.', filename);
                return;
            }
            if (!tag.id3v1) {
                log('ℹ️ No ID3v1 found.', filename);
                return;
            }
        }
        const result = yield mp3.removeTags(filename, { id3v1: true, id3v2: false, keepBackup: commander_1.default.keepBackup });
        if (result) {
            if (result.id3v1) {
                log('👍 ID3v1 removed.', filename, true);
            }
            else {
                log('ℹ️ No ID3v1 found.', filename);
            }
        }
        else {
            log('ℹ️ No ID3v1 found.', filename);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let input = commander_1.default.input;
        if (!input) {
            if (commander_1.default.args[0]) {
                input = commander_1.default.args[0];
            }
        }
        if (!input || input.length === 0) {
            return Promise.reject(Error('must specify a filename/directory'));
        }
        const stat = yield fs_extra_1.default.stat(input);
        if (stat.isDirectory()) {
            yield utils_1.collectFiles(input, ['.mp3'], commander_1.default.recursive, onFile);
        }
        else {
            yield onFile(input);
        }
    });
}
run().catch(e => {
    console.error(e);
});
//# sourceMappingURL=removeID3v1.js.map