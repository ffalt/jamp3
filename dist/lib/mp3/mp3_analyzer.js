"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const id3v2_frames_1 = require("../id3v2/id3v2_frames");
const mp3_1 = require("./mp3");
const mp3_frame_1 = require("./mp3_frame");
class MP3Analyzer {
    analyseID3v2(id3v2) {
        const result = [];
        id3v2.frames.forEach(frame => {
            const def = id3v2_frames_1.findId3v2FrameDef(frame.id);
            if (def && id3v2.head && def.versions.indexOf(id3v2.head.ver) < 0) {
                result.push({ msg: 'ID3v2: invalid version for frame ' + frame.id, expected: def.versions.join('|'), actual: id3v2.head.ver });
            }
        });
        return result;
    }
    read(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const mp3 = new mp3_1.MP3();
            const data = yield mp3.read(filename, { id3v1: true, id3v2: true, mpeg: true, raw: true });
            if (!data || !data.mpeg || !data.frames) {
                return Promise.reject(Error('No mpeg data in file:' + filename));
            }
            const head = data.frames.headers[0];
            const info = {
                filename,
                mode: data.mpeg.encoded,
                bitRate: data.mpeg.bitRate,
                channelMode: data.mpeg.mode && data.mpeg.mode.length > 0 ? data.mpeg.mode : undefined,
                channels: data.mpeg.channels,
                durationMS: data.mpeg.durationRead * 1000,
                format: data.mpeg.version && data.mpeg.version.length > 0 ? ('MPEG ' + data.mpeg.version + ' ' + data.mpeg.layer).trim() : 'unknown',
                header: head ? head.mode : undefined,
                frames: data.mpeg.frameCount,
                id3v1: !!data.id3v1,
                id3v2: !!data.id3v2,
                msgs: [],
                tags: {
                    id3v1: data.id3v1,
                    id3v2: data.id3v2,
                }
            };
            if (head && options.xing) {
                if (head.mode === 'Xing' && data.mpeg.encoded === 'CBR') {
                    info.msgs.push({ msg: 'XING: Wrong MPEG head frame for CBR', expected: 'Info', actual: 'Xing' });
                }
                if (head.mode === 'Info' && data.mpeg.encoded === 'VBR') {
                    info.msgs.push({ msg: 'XING: Wrong head frame for VBR', expected: 'Xing', actual: 'Info' });
                }
                if (!options.ignoreXingOffOne &&
                    (data.mpeg.frameCount - data.mpeg.frameCountDeclared === 1) &&
                    (data.mpeg.audioBytes - data.mpeg.audioBytesDeclared === head.header.size)) {
                    info.msgs.push({ msg: 'XING: Wrong ' + head.mode + ' declaration (frameCount and audioBytes must include the ' + head.mode + ' Header itself)', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared });
                }
                else {
                    if (data.mpeg.frameCount !== data.mpeg.frameCountDeclared) {
                        if (!options.ignoreXingOffOne || Math.abs(data.mpeg.frameCount - data.mpeg.frameCountDeclared) !== 1) {
                            info.msgs.push({ msg: 'XING: Wrong number of frames declared in ' + head.mode + ' Header', expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared });
                        }
                    }
                    if (data.mpeg.audioBytes !== data.mpeg.audioBytesDeclared) {
                        if (!options.ignoreXingOffOne || data.mpeg.audioBytes + head.header.size - data.mpeg.audioBytesDeclared === 0) {
                            info.msgs.push({ msg: 'XING: Wrong number of data bytes declared in ' + head.mode + ' Header', expected: data.mpeg.audioBytes, actual: data.mpeg.audioBytesDeclared });
                        }
                    }
                }
            }
            if (!head && data.mpeg.encoded === 'VBR') {
                info.msgs.push({ msg: 'XING: VBR detected, but no VBR head frame found', expected: 'VBR Header', actual: 'nothing' });
            }
            const lastframe = data.frames.audio.length > 0 ? data.frames.audio[data.frames.audio.length - 1] : undefined;
            if (data.raw && lastframe) {
                const audioEnd = mp3_frame_1.rawHeaderOffSet(lastframe) + mp3_frame_1.rawHeaderSize(lastframe);
                let id3v1s = data.raw.tags.filter(t => t.id === 'ID3v1' && t.start >= audioEnd);
                if (options.id3v1 && id3v1s.length > 0) {
                    if (id3v1s.length > 1) {
                        id3v1s = id3v1s.filter(t => {
                            return t.value && t.value.title && t.value.title[0] !== 'E' && t.value.title[1] !== 'X' && t.end !== data.size;
                        });
                    }
                    if (id3v1s.length > 1) {
                        info.msgs.push({ msg: 'ID3v1: Multiple tags', expected: 1, actual: id3v1s.length });
                    }
                    if (id3v1s.length > 0) {
                        const id3v1 = id3v1s[id3v1s.length - 1];
                        if (id3v1.end !== data.size) {
                            info.msgs.push({ msg: 'ID3v1: Invalid tag position, not at end of file', expected: (data.size - 128), actual: id3v1.start });
                        }
                    }
                }
            }
            if (options.mpeg) {
                if (data.frames.audio.length === 0) {
                    info.msgs.push({ msg: 'MPEG: No frames found', expected: '>0', actual: 0 });
                }
                else {
                    let nextdata = mp3_frame_1.rawHeaderOffSet(data.frames.audio[0]) + mp3_frame_1.rawHeaderSize(data.frames.audio[0]);
                    data.frames.audio.slice(1).forEach((f, index) => {
                        if (nextdata !== mp3_frame_1.rawHeaderOffSet(f)) {
                            info.msgs.push({ msg: 'MPEG: stream error at position ' + nextdata + ', gap after frame ' + (index + 1), expected: 0, actual: mp3_frame_1.rawHeaderOffSet(f) - nextdata });
                        }
                        nextdata = mp3_frame_1.rawHeaderOffSet(f) + mp3_frame_1.rawHeaderSize(f);
                    });
                }
            }
            if (options.id3v2 && data.id3v2) {
                info.msgs = info.msgs.concat(this.analyseID3v2(data.id3v2));
            }
            return info;
        });
    }
}
exports.MP3Analyzer = MP3Analyzer;
//# sourceMappingURL=mp3_analyzer.js.map