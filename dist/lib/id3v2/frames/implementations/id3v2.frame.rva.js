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
const utils_1 = require("../../../common/utils");
exports.FrameRelativeVolumeAdjustment = {
    parse: (reader, frame) => __awaiter(void 0, void 0, void 0, function* () {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const flags = reader.readBitsByte();
        const bitLength = reader.readBitsByte();
        const byteLength = bitLength / 8;
        if (byteLength <= 1 || byteLength > 4) {
            return Promise.reject(Error('Unsupported description bit size of: ' + bitLength));
        }
        let val = reader.readUInt(byteLength);
        const right = (utils_1.isBitSetAt(flags, 0) || (val === 0) ? 1 : -1) * val;
        val = reader.readUInt(byteLength);
        const left = (utils_1.isBitSetAt(flags, 1) || (val === 0) ? 1 : -1) * val;
        const value = {
            right, left
        };
        if (reader.unread() >= byteLength * 2) {
            value.peakRight = reader.readUInt(byteLength);
            value.peakLeft = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.peakRight = reader.readUInt(byteLength);
            value.peakLeft = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.rightBack = (utils_1.isBitSetAt(flags, 4) ? 1 : -1) * reader.readUInt(byteLength);
            value.leftBack = (utils_1.isBitSetAt(flags, 8) ? 1 : -1) * reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.peakRightBack = reader.readUInt(byteLength);
            value.peakLeftBack = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.center = (utils_1.isBitSetAt(flags, 10) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakCenter = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.bass = (utils_1.isBitSetAt(flags, 20) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakBass = reader.readUInt(byteLength);
        }
        return { value };
    }),
    write: (frame, stream) => __awaiter(void 0, void 0, void 0, function* () {
        const value = frame.value;
        const flags = [
            0,
            0,
            value.bass !== undefined ? (value.bass >= 0 ? 0 : 1) : 0,
            value.center !== undefined ? (value.center >= 0 ? 0 : 1) : 0,
            value.leftBack !== undefined ? (value.leftBack >= 0 ? 0 : 1) : 0,
            value.rightBack !== undefined ? (value.rightBack >= 0 ? 0 : 1) : 0,
            value.left < 0 ? 0 : 1,
            value.right < 0 ? 0 : 1
        ];
        stream.writeBitsByte(flags);
        let byteLength = 2;
        Object.keys(value).forEach(key => {
            const num = value[key];
            if (!isNaN(num)) {
                byteLength = Math.max(utils_1.neededStoreBytes(Math.abs(num), 2), byteLength);
            }
        });
        stream.writeByte(byteLength * 8);
        stream.writeUInt(Math.abs(value.right), byteLength);
        stream.writeUInt(Math.abs(value.left), byteLength);
        if (value.peakRight !== undefined && value.peakLeft !== undefined) {
            stream.writeUInt(value.peakRight, byteLength);
            stream.writeUInt(value.peakLeft, byteLength);
        }
        else {
            return;
        }
        if (value.rightBack !== undefined && value.leftBack !== undefined) {
            stream.writeUInt(Math.abs(value.rightBack), byteLength);
            stream.writeUInt(Math.abs(value.leftBack), byteLength);
        }
        else {
            return;
        }
        if (value.peakRightBack !== undefined && value.peakLeftBack !== undefined) {
            stream.writeUInt(value.peakRightBack, byteLength);
            stream.writeUInt(value.peakLeftBack, byteLength);
        }
        else {
            return;
        }
        if (value.center !== undefined && value.peakCenter !== undefined) {
            stream.writeUInt(Math.abs(value.center), byteLength);
            stream.writeUInt(value.peakLeftBack, byteLength);
        }
        else {
            return;
        }
        if (value.bass !== undefined && value.peakBass !== undefined) {
            stream.writeUInt(Math.abs(value.center), byteLength);
            stream.writeUInt(value.peakCenter, byteLength);
        }
    }),
    simplify: (value) => {
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.rva.js.map