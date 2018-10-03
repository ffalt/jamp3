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
const streams_1 = require("../common/streams");
const marker_1 = require("../common/marker");
const id3v1_consts_1 = require("./id3v1_consts");
const buffer_1 = require("../common/buffer");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('id3v1-reader');
class ID3v1Reader {
    readTag(data) {
        if (data.length < 128 || !marker_1.Markers.isMarker(data, 0, marker_1.Markers.MARKERS.tag)) {
            return null;
        }
        const tag = { id: 'ID3v1', start: 0, end: 0, version: 0, value: {} };
        const reader = new streams_1.DataReader(data);
        reader.position = 3;
        const value = {};
        value.title = reader.readFixedAutodectectString(30);
        value.artist = reader.readFixedAutodectectString(30);
        value.album = reader.readFixedAutodectectString(30);
        value.year = reader.readFixedAutodectectString(4);
        if ((data[125] === 0) && (data[126] !== 0)) {
            value.comment = reader.readFixedAutodectectString(29);
            tag.version = 1;
            value.track = reader.readByte();
        }
        else {
            value.comment = reader.readFixedAutodectectString(30);
            tag.version = 0;
        }
        value.genreIndex = reader.readByte();
        tag.value = value;
        return tag;
    }
    readStream(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reader.end) {
                return;
            }
            const index = yield reader.scan(buffer_1.BufferUtils.fromString(id3v1_consts_1.ID3v1_MARKER));
            debug('index', index);
            if (index < 0) {
                return;
            }
            const data = yield reader.read(400);
            if (!data || (data.length < 128)) {
                return;
            }
            if (data.length !== 128) {
                reader.unshift(data.slice(1));
                return yield this.readStream(reader);
            }
            const tag = this.readTag(data);
            if (tag) {
                return tag;
            }
            else {
                reader.unshift(data.slice(1));
                return yield this.readStream(reader);
            }
        });
    }
    read(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new streams_1.ReaderStream();
            try {
                yield reader.open(filename);
            }
            catch (e) {
                return Promise.reject(e);
            }
            const tag = yield this.readStream(reader);
            reader.close();
            return tag;
        });
    }
}
exports.ID3v1Reader = ID3v1Reader;
//# sourceMappingURL=id3v1_reader.js.map