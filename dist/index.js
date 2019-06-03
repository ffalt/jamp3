"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var id3v1_1 = require("./lib/id3v1/id3v1");
exports.ID3v1 = id3v1_1.ID3v1;
var id3v2_1 = require("./lib/id3v2/id3v2");
exports.ID3v2 = id3v2_1.ID3v2;
var mp3_1 = require("./lib/mp3/mp3");
exports.MP3 = mp3_1.MP3;
var mp3_analyzer_1 = require("./lib/mp3/mp3_analyzer");
exports.MP3Analyzer = mp3_analyzer_1.MP3Analyzer;
var id3v2_simplify_1 = require("./lib/id3v2/id3v2_simplify");
exports.simplifyTag = id3v2_simplify_1.simplifyTag;
__export(require("./lib/common/types"));
__export(require("./lib/id3v2/id3v2_builder"));
__export(require("./lib/id3v2/id3v2__types"));
__export(require("./lib/id3v1/id3v1_consts"));
//# sourceMappingURL=index.js.map