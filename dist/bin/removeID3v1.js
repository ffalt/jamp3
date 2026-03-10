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
const commander_1 = require("commander");
const mp3_1 = require("../lib/mp3/mp3");
const tool_1 = require("../lib/common/tool");
const package_json_1 = __importDefault(require("../../package.json"));
commander_1.program
    .version(package_json_1.default.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder to remove ID3v1')
    .option('-r, --recursive', 'scan the folder recursive')
    .option('-o, --onlyIfId3v2', 'remove ID3v1 only if ID3v2 exists')
    .option('-b, --keepBackup', 'keep original file as .bak file')
    .option('-s, --silent', 'report changed files only')
    .parse(process.argv);
const mp3 = new mp3_1.MP3();
function log(msg, filename, important) {
    if (!commander_1.program.opts().silent || important) {
        console.log(filename);
        console.log(msg);
    }
}
function onFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commander_1.program.opts().onlyIfId3v2) {
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
        const result = yield mp3.removeTags(filename, { id3v1: true, id3v2: false, keepBackup: commander_1.program.opts().keepBackup });
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
        yield (0, tool_1.runTool)(commander_1.program, onFile);
    });
}
run().catch(error => {
    console.error(error);
});
//# sourceMappingURL=removeID3v1.js.map