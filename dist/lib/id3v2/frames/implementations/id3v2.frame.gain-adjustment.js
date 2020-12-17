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
exports.FrameRGAD = void 0;
exports.FrameRGAD = {
    parse: (reader) => __awaiter(void 0, void 0, void 0, function* () {
        const peak = reader.readUInt4Byte();
        const radioAdjustment = reader.readSInt2Byte();
        const audiophileAdjustment = reader.readSInt2Byte();
        const value = { peak, radioAdjustment, audiophileAdjustment };
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        yield stream.writeUInt4Byte(value.peak);
        yield stream.writeSInt2Byte(value.radioAdjustment);
        yield stream.writeSInt2Byte(value.audiophileAdjustment);
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.gain-adjustment.js.map