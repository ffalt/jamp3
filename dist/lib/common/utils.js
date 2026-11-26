import fs from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';
export function isBitSetAt(byte, bit) {
    return (byte & 1 << bit) !== 0;
}
export function flags(names, values) {
    const result = {};
    for (const [i, name] of names.entries()) {
        result[name] = !!values[i];
    }
    return result;
}
export function unflags(names, flagsObj) {
    return names.map(name => flagsObj && flagsObj[name] ? 1 : 0);
}
export function synchsafe(input) {
    let current = input;
    let out;
    let mask = 0x7F;
    while (mask ^ 2147483647) {
        out = current & ~mask;
        out <<= 1;
        out |= (current & mask);
        mask = ((mask + 1) << 8) - 1;
        current = out;
    }
    if (out === undefined) {
        return 0;
    }
    return out;
}
export function unsynchsafe(input) {
    let out = 0, mask = 2130706432;
    while (mask) {
        out >>= 1;
        out |= (input & mask);
        mask >>= 8;
    }
    if (out === undefined) {
        return 0;
    }
    return out;
}
export function bitarray(byte) {
    return [128, 64, 32, 16, 8, 4, 2, 1].map(offset => (byte & offset) === offset ? 1 : 0);
}
export function unbitarray(bitsarray) {
    let result = 0;
    for (let i = 0; i < 8; ++i) {
        result = (result * 2) + (bitsarray[i] ? 1 : 0);
    }
    return result;
}
export function bitarray2(byte) {
    const b = [];
    for (let i = 0; i < 8; ++i) {
        b[7 - i] = (byte >> i) & 1;
    }
    return b;
}
export function isBit(field, nr) {
    return !!(field & nr);
}
export function removeZeroString(s) {
    for (let j = 0; j < s.length; j++) {
        if (s.codePointAt(j) === 0) {
            return s.slice(0, j);
        }
    }
    return s;
}
export function neededStoreBytes(num, min) {
    let result = Math.ceil(Math.floor(Math.log2(num) + 1) / 8);
    result = Math.max(result, min);
    return result;
}
export async function fileRangeToBuffer(filename, start, end) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        try {
            const readStream = fs.createReadStream(filename, { start, end });
            readStream.on('data', chunk => {
                chunks.push(chunk);
            });
            readStream.on('error', e => {
                reject(e);
            });
            readStream.on('close', () => {
                resolve(Buffer.concat(chunks));
            });
        }
        catch (error) {
            return reject(error);
        }
    });
}
export async function collectFiles(dir, ext, recursive, onFileCB) {
    const files1 = await fse.readdir(dir);
    for (const f of files1) {
        const sub = path.join(dir, f);
        const stat = await fse.stat(sub);
        if (stat.isDirectory()) {
            if (recursive) {
                await collectFiles(sub, ext, recursive, onFileCB);
            }
        }
        else if ((ext.includes(path.extname(f).toLowerCase()))) {
            await onFileCB(sub);
        }
    }
}
export function validCharKeyCode(c) {
    return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
//# sourceMappingURL=utils.js.map