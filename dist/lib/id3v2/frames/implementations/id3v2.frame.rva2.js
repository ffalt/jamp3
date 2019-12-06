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
const encodings_1 = require("../../../common/encodings");
const utils_1 = require("../../../common/utils");
exports.FrameRelativeVolumeAdjustment2 = {
    parse: (reader, frame) => __awaiter(void 0, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const id = reader.readStringTerminated(encodings_1.ascii);
        const channels = [];
        while (reader.unread() >= 3) {
            const type = reader.readByte();
            const adjustment = reader.readSInt(2);
            const channel = { type, adjustment };
            while (reader.unread() >= 1) {
                const bitspeakvolume = reader.readByte();
                const bytesInPeak = bitspeakvolume > 0 ? Math.ceil(bitspeakvolume / 8) : 0;
                if (bytesInPeak > 0 && reader.unread() >= bytesInPeak) {
                    channel.peak = reader.readUInt(bytesInPeak);
                }
            }
            channels.push(channel);
        }
        const value = { id, channels };
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeStringTerminated(value.id, encodings_1.ascii);
        value.channels.forEach(channel => {
            stream.writeByte(channel.type);
            stream.writeSInt(channel.adjustment, 2);
            const bytes = channel.peak === undefined ? 0 : utils_1.neededStoreBytes(channel.peak, 2);
            stream.writeUInt(bytes * 8, 2);
            if (channel.peak !== undefined && bytes > 0) {
                stream.writeUInt(channel.peak, bytes);
            }
        });
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.rva2.js.map