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
const fs_extra_1 = __importDefault(require("fs-extra"));
const commander_1 = __importDefault(require("commander"));
const tool_1 = require("../lib/common/tool");
const id3v2_1 = require("../lib/id3v2/id3v2");
const pretty_json_1 = require("../lib/common/pretty-json");
const pack = require('../../package.json');
commander_1.default
    .version(pack.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder')
    .option('-r, --recursive', 'dump the folder recursive')
    .option('-f, --full', 'full tag output (simple otherwise)')
    .option('-d, --dest <file>', 'destination analyze result file')
    .parse(process.argv);
const id3v2 = new id3v2_1.ID3v2();
const result = [];
function onFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = yield id3v2.read(filename);
        let dump;
        if (tag) {
            dump = { filename, tag: commander_1.default.full ? tag : id3v2_1.ID3v2.simplify(tag) };
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
        yield tool_1.runTool(commander_1.default, onFile);
        if (commander_1.default.dest) {
            yield fs_extra_1.default.writeFile(commander_1.default.dest, pretty_json_1.toPrettyJsonWithBin(result));
        }
    });
}
run().catch(e => {
    console.error(e);
});
//# sourceMappingURL=dumpID3v2.js.map