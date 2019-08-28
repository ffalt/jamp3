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
const id3v2_frames_1 = require("./id3v2_frames");
function buildID3v2(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const frames = [];
        for (const frame of tag.frames) {
            const f = yield id3v2_frames_1.readID3v2Frame(frame, tag.head);
            frames.push(f);
        }
        return {
            id: tag.id,
            start: tag.start,
            end: tag.end,
            head: tag.head,
            frames: frames
        };
    });
}
exports.buildID3v2 = buildID3v2;
//# sourceMappingURL=id3v2_raw.js.map