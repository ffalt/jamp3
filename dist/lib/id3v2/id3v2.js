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
const fs_extra_1 = __importDefault(require("fs-extra"));
const id3v2_reader_1 = require("./id3v2_reader");
const id3v2_writer_1 = require("./id3v2_writer");
const id3v2_frames_1 = require("./id3v2_frames");
const streams_1 = require("../common/streams");
const utils_1 = require("../common/utils");
const update_file_1 = require("../common/update-file");
const types_1 = require("../common/types");
const mp3_frame_1 = require("../mp3/mp3_frame");
const id3v2_raw_1 = require("./id3v2_raw");
const id3v2_check_1 = require("./id3v2_check");
const id3v2_simplify_1 = require("./id3v2_simplify");
class ID3v2 {
    static check(tag) {
        return id3v2_check_1.checkID3v2(tag);
    }
    static simplify(tag, dropIDsList) {
        return id3v2_simplify_1.simplifyTag(tag, dropIDsList);
    }
    read(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new id3v2_reader_1.ID3v2Reader();
            const tag = yield reader.read(filename);
            if (tag) {
                return yield id3v2_raw_1.buildID3v2(tag);
            }
        });
    }
    readStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new id3v2_reader_1.ID3v2Reader();
            const tag = yield reader.readStream(stream);
            if (tag) {
                return yield id3v2_raw_1.buildID3v2(tag);
            }
        });
    }
    readRaw(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new id3v2_reader_1.ID3v2Reader();
            const tag = yield reader.read(filename);
            if (tag) {
                return yield utils_1.fileRangeToBuffer(filename, tag.start, tag.end);
            }
        });
    }
    remove(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let removed = false;
            yield update_file_1.updateFile(filename, { id3v2: true, mpegQuick: true }, !!options.keepBackup, () => true, (layout, fileWriter) => __awaiter(this, void 0, void 0, function* () {
                let start = 0;
                let specEnd = 0;
                for (const tag of layout.tags) {
                    if (tag.id === types_1.ITagID.ID3v2) {
                        if (start < tag.end) {
                            specEnd = tag.head.size + tag.start + 10;
                            start = tag.end;
                            removed = true;
                        }
                    }
                }
                if (layout.frameheaders.length > 0) {
                    const mediastart = mp3_frame_1.rawHeaderOffSet(layout.frameheaders[0]);
                    start = specEnd < mediastart ? specEnd : mediastart;
                }
                else {
                    start = Math.max(start, specEnd);
                }
                yield fileWriter.copyFrom(filename, start);
            }));
            return removed;
        });
    }
    writeBuilder(filename, builder, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.write(filename, { frames: builder.buildFrames() }, builder.version(), builder.rev(), options);
        });
    }
    write(filename, tag, version, rev, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof options !== 'object') {
                throw Error('Invalid options object, update your code');
            }
            const opts = Object.assign({ keepBackup: false, paddingSize: 100 }, options);
            const head = {
                ver: version,
                rev: rev,
                size: 0,
                valid: true,
                flagBits: tag.head ? tag.head.flagBits : undefined
            };
            if (tag.head) {
                if (version === 4 && tag.head.v4) {
                    head.v4 = tag.head.v4;
                }
                if (version === 3 && tag.head.v3) {
                    head.v3 = tag.head.v3;
                }
                if (version <= 2 && tag.head.v2) {
                    head.v2 = tag.head.v2;
                }
            }
            const raw_frames = yield id3v2_frames_1.writeToRawFrames(tag.frames, head, options.defaultEncoding);
            const exists = yield fs_extra_1.default.pathExists(filename);
            if (!exists) {
                yield this.writeTag(filename, raw_frames, head);
            }
            else {
                yield this.replaceTag(filename, raw_frames, head, opts);
            }
        });
    }
    writeTag(filename, frames, head) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = new streams_1.FileWriterStream();
            yield stream.open(filename);
            const writer = new id3v2_writer_1.ID3v2Writer();
            try {
                yield writer.write(stream, frames, head, { paddingSize: 0 });
            }
            catch (e) {
                yield stream.close();
                return Promise.reject(e);
            }
            yield stream.close();
        });
    }
    replaceTag(filename, frames, head, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield update_file_1.updateFile(filename, { id3v2: true, mpegQuick: true }, !!options.keepBackup, () => true, (layout, fileWriter) => __awaiter(this, void 0, void 0, function* () {
                const writer = new id3v2_writer_1.ID3v2Writer();
                yield writer.write(fileWriter, frames, head, options);
                let start = 0;
                let specEnd = 0;
                for (const tag of layout.tags) {
                    if (tag.id === types_1.ITagID.ID3v2) {
                        if (start < tag.end) {
                            specEnd = tag.head.size + tag.start + 10;
                            start = tag.end;
                        }
                    }
                }
                if (layout.frameheaders.length > 0) {
                    const mediastart = mp3_frame_1.rawHeaderOffSet(layout.frameheaders[0]);
                    start = specEnd < mediastart ? specEnd : mediastart;
                }
                else {
                    start = Math.max(start, specEnd);
                }
                yield fileWriter.copyFrom(filename, start);
            }));
        });
    }
}
exports.ID3v2 = ID3v2;
//# sourceMappingURL=id3v2.js.map