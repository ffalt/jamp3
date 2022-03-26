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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3v2HeaderReader = void 0;
const utils_1 = require("../common/utils");
const marker_1 = require("../common/marker");
const id3v2_header_consts_1 = require("./id3v2.header.consts");
class ID3v2HeaderReader {
    readID3ExtendedHeaderV3(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const headdata = yield reader.read(4);
            let size = headdata.readInt32BE(0);
            if (size > 10) {
                size = 6;
            }
            const data = yield reader.read(size);
            const exthead = {
                size,
                flags1: (0, utils_1.flags)(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS1, (0, utils_1.bitarray)(data[0])),
                flags2: (0, utils_1.flags)(id3v2_header_consts_1.ID3v2_EXTHEADER[3].FLAGS2, (0, utils_1.bitarray)(data[1])),
                sizeOfPadding: data.readUInt32BE(2)
            };
            if (exthead.flags1.crc && data.length > 6) {
                exthead.crcData = data.readUInt32BE(6);
            }
            return { exthead };
        });
    }
    readID3ExtendedHeaderV4(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const headdata = yield reader.read(4);
            let size = headdata.readInt32BE(0);
            size = (0, utils_1.unsynchsafe)(size);
            if (size > 10) {
                size = 6;
            }
            const data = yield reader.read(size);
            const exthead = {
                size,
                flags: (0, utils_1.flags)(id3v2_header_consts_1.ID3v2_EXTHEADER[4].FLAGS, (0, utils_1.bitarray)(data[0]))
            };
            let pos = 1;
            if (exthead.flags.crc) {
                const crcSize = data[pos];
                pos++;
                exthead.crc32 = (0, utils_1.unsynchsafe)(data.readInt32BE(pos));
                pos += crcSize;
            }
            if (exthead.flags.restrictions) {
                pos++;
                const r = (0, utils_1.bitarray)(data[pos]);
                exthead.restrictions = {
                    tagSize: r[0].toString() + r[1].toString(),
                    textEncoding: r[2].toString(),
                    textSize: r[3].toString() + r[4].toString(),
                    imageEncoding: r[5].toString(),
                    imageSize: r[6].toString() + r[7].toString()
                };
            }
            return { exthead };
        });
    }
    readID3v22Header(head, flagBits) {
        head.v2 = {
            sizeAsSyncSafe: (0, utils_1.unsynchsafe)(head.size),
            flags: {
                unsynchronisation: flagBits[0] === 1,
                compression: flagBits[1] === 1,
            }
        };
    }
    readID3v23Header(head, flagBits) {
        head.v3 = {
            flags: {
                unsynchronisation: flagBits[0] === 1,
                extendedheader: flagBits[1] === 1,
                experimental: flagBits[2] === 1
            }
        };
    }
    readID3v24Header(head, flagBits) {
        head.v4 = {
            flags: {
                unsynchronisation: flagBits[0] === 1,
                extendedheader: flagBits[1] === 1,
                experimental: flagBits[2] === 1,
                footer: flagBits[3] === 1
            }
        };
    }
    readID3v2Header(buffer, offset) {
        if ((!marker_1.Markers.isMarker(buffer, offset, marker_1.Markers.MARKERS.id3)) || (buffer.length < 10)) {
            return;
        }
        const flagBits = (0, utils_1.bitarray)(buffer[5]);
        const head = {
            ver: buffer[offset + 3],
            rev: buffer[offset + 4],
            size: buffer.readInt32BE(offset + 6),
            flagBits,
            valid: false
        };
        if (head.ver > 2) {
            head.size = (0, utils_1.unsynchsafe)(head.size);
        }
        if (head.ver === 4) {
            this.readID3v24Header(head, flagBits);
        }
        else if (head.ver === 3) {
            this.readID3v23Header(head, flagBits);
        }
        else if (head.ver <= 2) {
            this.readID3v22Header(head, flagBits);
        }
        head.valid = head.size >= 0 && head.ver <= 4;
        return head;
    }
    readHeader(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield reader.read(id3v2_header_consts_1.ID3v2_HEADER.SIZE);
            const header = this.readID3v2Header(data, 0);
            if (!header || !header.valid) {
                return { rest: data };
            }
            if (header.v3 && header.v3.flags.extendedheader) {
                const extended = yield this.readID3ExtendedHeaderV3(reader);
                header.v3.extended = extended.exthead;
                return { header, rest: extended.rest };
            }
            else if (header.v4 && header.v4.flags.extendedheader) {
                const extended = yield this.readID3ExtendedHeaderV4(reader);
                header.v4.extended = extended.exthead;
                return { header, rest: extended.rest };
            }
            return { header };
        });
    }
}
exports.ID3v2HeaderReader = ID3v2HeaderReader;
//# sourceMappingURL=id3v2.reader.header.js.map