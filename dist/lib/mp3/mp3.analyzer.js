import { MP3 } from './mp3.js';
import { rawHeaderOffSet, rawHeaderSize } from './mp3.mpeg.frame.js';
import { ITagID } from '../common/types.js';
import { checkID3v2 } from '../id3v2/id3v2.check.js';
export class MP3Analyzer {
    analyzeID3v2(data) {
        if (!data.id3v2) {
            return [];
        }
        return checkID3v2(data.id3v2);
    }
    analyzeID3v1(data) {
        const result = [];
        const lastFrame = data.frames && data.frames.audio.length > 0 ? data.frames.audio.at(-1) : undefined;
        if (lastFrame && data.raw) {
            const audioEnd = rawHeaderOffSet(lastFrame) + rawHeaderSize(lastFrame);
            let id3v1s = data.raw.tags.filter(t => t.id === ITagID.ID3v1 && t.start >= audioEnd);
            if (id3v1s.length > 0) {
                if (id3v1s.length > 1) {
                    id3v1s = id3v1s.filter(t => t.value && t.value.title && (t.value.title[0] !== 'E' || t.value.title[1] !== 'X'));
                }
                if (id3v1s.length > 1) {
                    result.push({ msg: 'ID3v1: Multiple tags', expected: 1, actual: id3v1s.length });
                }
                if (id3v1s.length > 0) {
                    const id3v1 = id3v1s.at(-1);
                    if (id3v1 && id3v1.end !== data.size) {
                        result.push({ msg: 'ID3v1: Invalid tag position, not at end of file', expected: (data.size - 128), actual: id3v1.start });
                    }
                }
            }
        }
        return result;
    }
    analyzeMPEG(data) {
        const result = [];
        if (!data.frames || data.frames.audio.length === 0) {
            result.push({ msg: 'MPEG: No frames found', expected: '>0', actual: 0 });
            return result;
        }
        let nextdata = rawHeaderOffSet(data.frames.audio[0]) + rawHeaderSize(data.frames.audio[0]);
        for (const [index, f] of data.frames.audio.slice(1).entries()) {
            if (nextdata !== rawHeaderOffSet(f)) {
                result.push({ msg: `MPEG: stream error at position ${nextdata}, gap after frame ${index + 1}`, expected: 0, actual: rawHeaderOffSet(f) - nextdata });
            }
            nextdata = rawHeaderOffSet(f) + rawHeaderSize(f);
        }
        const audiostart = rawHeaderOffSet(data.frames.audio[0]);
        if (data.id3v2 && data.id3v2.head) {
            const shouldaudiostart = data.id3v2.start + data.id3v2.head.size + 10;
            if (audiostart !== shouldaudiostart) {
                result.push({ msg: 'MPEG: Unknown data found between ID3v2 and audio', expected: 0, actual: audiostart - shouldaudiostart });
            }
        }
        else if (audiostart !== 0) {
            result.push({ msg: 'MPEG: Unknown data found before audio', expected: 0, actual: audiostart });
        }
        return result;
    }
    analyzeXING(data, ignoreXingOffOne) {
        if (!data.mpeg || !data.frames) {
            return [];
        }
        const head = data.frames.headers[0];
        const result = [];
        if (!head) {
            if (data.mpeg.encoded === 'VBR') {
                result.push({ msg: 'XING: VBR detected, but no VBR head frame found', expected: 'VBR Header', actual: 'nothing' });
            }
            return result;
        }
        if (head.mode === 'Xing' && data.mpeg.encoded === 'CBR') {
            result.push({ msg: 'XING: Wrong MPEG head frame for CBR', expected: 'Info', actual: 'Xing' });
        }
        if (head.mode === 'Info' && data.mpeg.encoded === 'VBR') {
            result.push({ msg: 'XING: Wrong head frame for VBR', expected: 'Xing', actual: 'Info' });
        }
        if (!ignoreXingOffOne &&
            (data.mpeg.frameCount - data.mpeg.frameCountDeclared === 1) &&
            (data.mpeg.audioBytes - data.mpeg.audioBytesDeclared === head.header.size)) {
            result.push({ msg: `XING: Wrong ${head.mode} declaration (frameCount and audioBytes must include the ${head.mode} Header itself)`, expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared });
        }
        else {
            if (data.mpeg.frameCount !== data.mpeg.frameCountDeclared &&
                (!ignoreXingOffOne || Math.abs(data.mpeg.frameCount - data.mpeg.frameCountDeclared) !== 1)) {
                result.push({ msg: `XING: Wrong number of frames declared in ${head.mode} Header`, expected: data.mpeg.frameCount, actual: data.mpeg.frameCountDeclared });
            }
            if (data.mpeg.audioBytes !== data.mpeg.audioBytesDeclared &&
                (!ignoreXingOffOne || data.mpeg.audioBytes + head.header.size === data.mpeg.audioBytesDeclared)) {
                result.push({ msg: `XING: Wrong number of data bytes declared in ${head.mode} Header`, expected: data.mpeg.audioBytes, actual: data.mpeg.audioBytesDeclared });
            }
        }
        return result;
    }
    async read(filename, options) {
        const mp3 = new MP3();
        const data = await mp3.read(filename, { id3v1: true, id3v2: true, mpeg: true, raw: true });
        if (!data || !data.mpeg || !data.frames) {
            return Promise.reject(new Error(`No mpeg data in file:${filename}`));
        }
        const head = data.frames.headers[0];
        const info = {
            filename,
            mode: data.mpeg.encoded,
            bitRate: data.mpeg.bitRate,
            channelMode: data.mpeg.mode && data.mpeg.mode.length > 0 ? data.mpeg.mode : undefined,
            channels: data.mpeg.channels,
            durationMS: data.mpeg.durationRead * 1000,
            format: data.mpeg.version && data.mpeg.version.length > 0 ? (`MPEG ${data.mpeg.version} ${data.mpeg.layer}`).trim() : 'unknown',
            header: head ? head.mode : undefined,
            frames: data.mpeg.frameCount,
            id3v1: !!data.id3v1,
            id3v2: !!data.id3v2,
            warnings: [],
            tags: { id3v1: data.id3v1, id3v2: data.id3v2 }
        };
        if (options.mpeg) {
            info.warnings = [...info.warnings, ...this.analyzeMPEG(data)];
        }
        if (options.xing) {
            info.warnings = [...info.warnings, ...this.analyzeXING(data, !!options.ignoreXingOffOne)];
        }
        if (options.id3v1) {
            info.warnings = [...info.warnings, ...this.analyzeID3v1(data)];
        }
        if (options.id3v2 && data.id3v2) {
            info.warnings = [...info.warnings, ...this.analyzeID3v2(data)];
        }
        return info;
    }
}
//# sourceMappingURL=mp3.analyzer.js.map