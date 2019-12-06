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
const mp3_reader_1 = require("./mp3.reader");
const mp3_mpeg_frame_1 = require("./mp3.mpeg.frame");
const __1 = require("../..");
const update_file_1 = require("../common/update-file");
const mp3_result_1 = require("./mp3.result");
class MP3 {
    readStream(stream, options, streamSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new mp3_reader_1.MP3Reader();
            const layout = yield reader.readStream(stream, Object.assign({ streamSize }, options));
            return yield mp3_result_1.prepareResult(options, layout);
        });
    }
    read(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new mp3_reader_1.MP3Reader();
            const layout = yield reader.read(filename, options);
            return yield mp3_result_1.prepareResult(options, layout);
        });
    }
    removeTags(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield fs_extra_1.default.stat(filename);
            const opts = {
                streamSize: stat.size,
                id3v2: options.id3v2,
                detectDuplicateID3v2: options.id3v2,
                id3v1: options.id3v1,
                mpegQuick: options.id3v2
            };
            let id2v1removed = false;
            let id2v2removed = false;
            yield update_file_1.updateFile(filename, opts, !!options.keepBackup, layout => {
                for (const tag of layout.tags) {
                    if (options.id3v2 && tag.id === __1.ITagID.ID3v2 && tag.end > 0) {
                        return true;
                    }
                    else if (options.id3v1 && tag.id === __1.ITagID.ID3v1 && tag.end === stat.size && tag.start < stat.size) {
                        return true;
                    }
                }
                return false;
            }, (layout, fileWriter) => __awaiter(this, void 0, void 0, function* () {
                let start = 0;
                let finish = stat.size;
                let specEnd = 0;
                for (const tag of layout.tags) {
                    if (tag.id === __1.ITagID.ID3v2 && options.id3v2) {
                        if (start < tag.end) {
                            specEnd = tag.head.size + tag.start + 10;
                            start = tag.end;
                            id2v2removed = true;
                        }
                    }
                    else if (tag.id === __1.ITagID.ID3v1 && options.id3v1 && tag.end === stat.size) {
                        if (finish > tag.start) {
                            finish = tag.start;
                            id2v1removed = true;
                        }
                    }
                }
                if (options.id3v2) {
                    if (layout.frameheaders.length > 0) {
                        start = mp3_mpeg_frame_1.rawHeaderOffSet(layout.frameheaders[0]);
                    }
                    else {
                        start = Math.max(start, specEnd);
                    }
                }
                if (finish > start) {
                    yield fileWriter.copyRange(filename, start, finish);
                }
            }));
            return id2v2removed || id2v1removed ? { id3v2: id2v2removed, id3v1: id2v1removed } : undefined;
        });
    }
}
exports.MP3 = MP3;
//# sourceMappingURL=mp3.js.map