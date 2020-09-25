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
exports.FrameETCO = void 0;
exports.FrameETCO = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const format = reader.readBitsByte();
        const events = [];
        while (reader.unread() >= 5) {
            const type = reader.readBitsByte();
            const timestamp = reader.readUInt4Byte();
            events.push({ type, timestamp });
        }
        const value = { format, events };
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        stream.writeByte(value.format);
        (value.events || []).forEach(event => {
            stream.writeByte(event.type);
            stream.writeUInt4Byte(event.timestamp);
        });
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.event-timing.js.map