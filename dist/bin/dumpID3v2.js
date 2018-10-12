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
const pretty_json_1 = require("../lib/common/pretty-json");
const commander_1 = __importDefault(require("commander"));
const pack = require('../../package.json');
commander_1.default
    .version(pack.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder')
    .option('-r, --recursive', 'dump the folder recursive')
    .option('-f, --full', 'full tag output (simple otherwise)')
    .option('-d, --dest <file>', 'destination analyze result file')
    .parse(process.argv);
const id3v2 = new __1.ID3v2();
const result = [];
function onFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = yield id3v2.read(filename);
        let dump;
        if (tag) {
            dump = { filename, tag: commander_1.default.full ? tag : __1.simplifyTag(tag) };
        }
        else {
            dump = { error: 'No tag found', filename };
        }
        if (commander_1.default.dest) {
            result.push(dump);
        }
        else if (commander_1.default.full) {
            console.log(pretty_json_1.toPrettyJsonWithBin(dump));
        }
        else {
            console.log(JSON.stringify(dump, null, '\t'));
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
        const stat = yield utils_1.fsStat(input);
        if (stat.isDirectory()) {
            yield utils_1.collectFiles(input, ['.mp3'], commander_1.default.recursive, onFile);
        }
        else {
            yield onFile(input);
        }
        if (commander_1.default.dest) {
            yield utils_1.fileWrite(commander_1.default.dest, pretty_json_1.toPrettyJsonWithBin(result));
        }
    });
}
run().catch(e => {
    console.error(e);
});
//# sourceMappingURL=dumpID3v2.js.map