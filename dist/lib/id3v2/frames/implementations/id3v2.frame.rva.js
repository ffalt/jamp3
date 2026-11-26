import { isBitSetAt, neededStoreBytes } from '../../../common/utils.js';
export const FrameRelativeVolumeAdjustment = {
    parse: async (reader, frame) => {
        if (frame.data.length === 0) {
            return { value: {} };
        }
        const flags = reader.readBitsByte();
        const bitLength = reader.readBitsByte();
        const byteLength = bitLength / 8;
        if (byteLength <= 1 || byteLength > 4) {
            return Promise.reject(new Error(`Unsupported description bit size of: ${bitLength}`));
        }
        let val = reader.readUInt(byteLength);
        const right = ((val === 0) || isBitSetAt(flags, 0) ? 1 : -1) * val;
        val = reader.readUInt(byteLength);
        const left = ((val === 0) || isBitSetAt(flags, 1) ? 1 : -1) * val;
        const value = {
            right,
            left
        };
        if (reader.unread() >= byteLength * 2) {
            value.peakRight = reader.readUInt(byteLength);
            value.peakLeft = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.rightBack = (isBitSetAt(flags, 2) ? 1 : -1) * reader.readUInt(byteLength);
            value.leftBack = (isBitSetAt(flags, 3) ? 1 : -1) * reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.peakRightBack = reader.readUInt(byteLength);
            value.peakLeftBack = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.center = (isBitSetAt(flags, 4) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakCenter = reader.readUInt(byteLength);
        }
        if (reader.unread() >= byteLength * 2) {
            value.bass = (isBitSetAt(flags, 5) ? 1 : -1) * reader.readUInt(byteLength);
            value.peakBass = reader.readUInt(byteLength);
        }
        return { value };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        const flags = [
            0,
            0,
            (value.bass === undefined) || (value.bass >= 0) ? 0 : 1,
            (value.center === undefined) || (value.center >= 0) ? 0 : 1,
            (value.leftBack === undefined) || (value.leftBack >= 0) ? 0 : 1,
            (value.rightBack === undefined) || (value.rightBack >= 0) ? 0 : 1,
            value.left < 0 ? 0 : 1,
            value.right < 0 ? 0 : 1
        ];
        await stream.writeBitsByte(flags);
        let byteLength = 2;
        for (const num of Object.values(value)) {
            if (!Number.isNaN(num)) {
                byteLength = Math.max(neededStoreBytes(Math.abs(num), 2), byteLength);
            }
        }
        await stream.writeByte(byteLength * 8);
        await stream.writeUInt(Math.abs(value.right), byteLength);
        await stream.writeUInt(Math.abs(value.left), byteLength);
        if (value.peakRight === undefined || value.peakLeft === undefined) {
            return;
        }
        await stream.writeUInt(value.peakRight, byteLength);
        await stream.writeUInt(value.peakLeft, byteLength);
        if (value.rightBack === undefined || value.leftBack === undefined) {
            return;
        }
        await stream.writeUInt(Math.abs(value.rightBack), byteLength);
        await stream.writeUInt(Math.abs(value.leftBack), byteLength);
        if (value.peakRightBack === undefined || value.peakLeftBack === undefined) {
            return;
        }
        await stream.writeUInt(value.peakRightBack, byteLength);
        await stream.writeUInt(value.peakLeftBack, byteLength);
        if (value.center === undefined || value.peakCenter === undefined) {
            return;
        }
        await stream.writeUInt(Math.abs(value.center), byteLength);
        await stream.writeUInt(value.peakCenter, byteLength);
        if (value.bass === undefined || value.peakBass === undefined) {
            return;
        }
        await stream.writeUInt(Math.abs(value.bass), byteLength);
        await stream.writeUInt(value.peakBass, byteLength);
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        const parts = [`right=${value.right}`, `left=${value.left}`];
        if (value.peakRight !== undefined) {
            parts.push(`peakRight=${value.peakRight}`);
        }
        if (value.peakLeft !== undefined) {
            parts.push(`peakLeft=${value.peakLeft}`);
        }
        if (value.rightBack !== undefined) {
            parts.push(`rightBack=${value.rightBack}`);
        }
        if (value.leftBack !== undefined) {
            parts.push(`leftBack=${value.leftBack}`);
        }
        if (value.peakRightBack !== undefined) {
            parts.push(`peakRightBack=${value.peakRightBack}`);
        }
        if (value.peakLeftBack !== undefined) {
            parts.push(`peakLeftBack=${value.peakLeftBack}`);
        }
        if (value.center !== undefined) {
            parts.push(`center=${value.center}`);
        }
        if (value.peakCenter !== undefined) {
            parts.push(`peakCenter=${value.peakCenter}`);
        }
        if (value.bass !== undefined) {
            parts.push(`bass=${value.bass}`);
        }
        if (value.peakBass !== undefined) {
            parts.push(`peakBass=${value.peakBass}`);
        }
        return parts.join(';');
    }
};
//# sourceMappingURL=id3v2.frame.rva.js.map