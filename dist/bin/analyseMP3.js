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
const mp3_analyser_1 = require("../lib/mp3/mp3_analyser");
const utils_1 = require("../lib/common/utils");
const commander_1 = __importDefault(require("commander"));
const pack = require('../../package.json');
commander_1.default
    .version(pack.version, '-v, --version')
    .usage('[options] <fileOrDir>')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder')
    .option('-r, --recursive', 'scan the folder recursive')
    .option('-w, --warnings', 'show results only for files with warnings')
    .option('-f, --format <format>', 'format of analyse result (plain|json)', /^(plain|json)$/i, 'plain')
    .option('-d, --dest <file>', 'destination analyse result file')
    .parse(process.argv);
const result = [];
const options = { mpeg: true, xing: true, id3v2: true, id3v1: true };
function toPlain(report) {
    const sl = [report.filename];
    const features = [];
    if (report.frames) {
        features.push(report.frames + ' Frames');
    }
    if (report.durationMS) {
        features.push('Duration ' + report.durationMS + 'ms');
    }
    if (report.mode) {
        features.push(report.mode + (report.bitRate ? ' ' + report.bitRate : ''));
    }
    if (report.format) {
        features.push(report.format);
    }
    if (report.channels) {
        features.push('Channels ' + report.channels + (report.channelMode ? ' (' + report.channelMode + ')' : ''));
    }
    if (report.header) {
        features.push(report.header);
    }
    if (report.id3v1) {
        features.push('ID3v1');
    }
    if (report.id3v2) {
        features.push('ID3v2');
    }
    sl.push(features.join(', '));
    if (report.msgs.length > 0) {
        sl.push('WARNINGS:');
        report.msgs.forEach(msg => {
            sl.push(msg.msg + ' (expected: ' + msg.expected + ', actual: ' + msg.actual + ')');
        });
    }
    return sl.join('\n');
}
function onFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const probe = new mp3_analyser_1.MP3Analyser();
        const info = yield probe.read(filename, options);
        if (!commander_1.default.warnings || info.msgs.length > 0) {
            if (commander_1.default.dest) {
                result.push(info);
            }
            else if (commander_1.default.format === 'plain') {
                console.log(toPlain(info) + '\n');
            }
            else {
                console.log(JSON.stringify(info, null, '\t'));
            }
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
            if (commander_1.default.format === 'plain') {
                yield utils_1.fileWrite(commander_1.default.dest, result.map(r => toPlain(r)).join('\n'));
            }
            else {
                yield utils_1.fileWrite(commander_1.default.dest, JSON.stringify(result, null, '\t'));
            }
        }
    });
}
run().catch(e => {
    console.error(e);
});
//# sourceMappingURL=analyseMP3.js.map