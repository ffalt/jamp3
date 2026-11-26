import iconv from 'iconv-lite';
import { ascii } from '../../../common/encodings.js';
import { PRIVGuidOwners, PRIVNumericOwners, PRIVWideStringOwners } from '../../id3v2.simplify.maps.js';
export function bufToGuid(buf) {
    const d1 = buf.readUInt32LE(0).toString(16).padStart(8, '0');
    const d2 = buf.readUInt16LE(4).toString(16).padStart(4, '0');
    const d3 = buf.readUInt16LE(6).toString(16).padStart(4, '0');
    const d4a = buf.subarray(8, 10).toString('hex');
    const d4b = buf.subarray(10, 16).toString('hex');
    return `${d1}-${d2}-${d3}-${d4a}-${d4b}`.toUpperCase();
}
export function guidToBuf(guid) {
    const hex = guid.replaceAll('-', '');
    const buf = Buffer.alloc(16);
    buf.writeUInt32LE(Number.parseInt(hex.slice(0, 8), 16), 0);
    buf.writeUInt16LE(Number.parseInt(hex.slice(8, 12), 16), 4);
    buf.writeUInt16LE(Number.parseInt(hex.slice(12, 16), 16), 6);
    Buffer.from(hex.slice(16), 'hex').copy(buf, 8);
    return buf;
}
export const FramePriv = {
    parse: async (reader) => {
        const id = reader.readStringTerminated(ascii);
        if (PRIVNumericOwners.has(id)) {
            const buf = reader.rest();
            const num = buf.length >= 4 ? buf.readUInt32LE(0) : 0;
            const value = { id, num };
            return { value, encoding: ascii };
        }
        if (PRIVGuidOwners.has(id)) {
            const buf = reader.rest();
            const guid = buf.length >= 16 ? bufToGuid(buf) : '00000000-0000-0000-0000-000000000000';
            const value = { id, guid };
            return { value, encoding: ascii };
        }
        if (PRIVWideStringOwners.has(id)) {
            const buf = reader.rest();
            let end = buf.length;
            while (end >= 2 && buf[end - 2] === 0 && buf[end - 1] === 0) {
                end -= 2;
            }
            const text = iconv.decode(buf.subarray(0, end), 'ucs2');
            const value = { id, text };
            return { value, encoding: ascii };
        }
        const bin = reader.rest();
        const value = { id, bin };
        return { value, encoding: ascii };
    },
    write: async (frame, stream) => {
        const value = frame.value;
        await stream.writeStringTerminated(value.id, ascii);
        if ('num' in value) {
            const buf = Buffer.alloc(4);
            buf.writeUInt32LE(value.num, 0);
            await stream.writeBuffer(buf);
        }
        else if ('guid' in value) {
            await stream.writeBuffer(guidToBuf(value.guid));
        }
        else if ('text' in value) {
            await stream.writeBuffer(iconv.encode(value.text, 'ucs2'));
            await stream.writeBuffer(Buffer.from([0, 0]));
        }
        else {
            await stream.writeBuffer(value.bin);
        }
    },
    simplify: (value) => {
        if (!value) {
            return null;
        }
        if ('num' in value) {
            return value.num.toString();
        }
        if ('guid' in value) {
            return value.guid;
        }
        if ('text' in value) {
            return value.text || null;
        }
        if (value.bin && value.bin.length > 0) {
            return `<bin ${value.bin.length}bytes>`;
        }
        return null;
    }
};
//# sourceMappingURL=id3v2.frame.priv.js.map