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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBitSetAt = isBitSetAt;
exports.flags = flags;
exports.unflags = unflags;
exports.synchsafe = synchsafe;
exports.unsynchsafe = unsynchsafe;
exports.bitarray = bitarray;
exports.unbitarray = unbitarray;
exports.bitarray2 = bitarray2;
exports.isBit = isBit;
exports.removeZeroString = removeZeroString;
exports.neededStoreBytes = neededStoreBytes;
exports.fileRangeToBuffer = fileRangeToBuffer;
exports.collectFiles = collectFiles;
exports.validCharKeyCode = validCharKeyCode;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function isBitSetAt(byte, bit) {
    return (byte & 1 << bit) !== 0;
}
function flags(names, values) {
    const result = {};
    for (const [i, name] of names.entries()) {
        result[name] = !!values[i];
    }
    return result;
}
function unflags(names, flagsObj) {
    return names.map(name => flagsObj && flagsObj[name] ? 1 : 0);
}
function synchsafe(input) {
    let current = input;
    let out;
    let mask = 0x7F;
    while (mask ^ 2147483647) {
        out = current & ~mask;
        out = out << 1;
        out = out | (current & mask);
        mask = ((mask + 1) << 8) - 1;
        current = out;
    }
    if (out === undefined) {
        return 0;
    }
    return out;
}
function unsynchsafe(input) {
    let out = 0, mask = 2130706432;
    while (mask) {
        out = out >> 1;
        out = out | (input & mask);
        mask = mask >> 8;
    }
    if (out === undefined) {
        return 0;
    }
    return out;
}
function bitarray(byte) {
    return [128, 64, 32, 16, 8, 4, 2, 1].map(offset => (byte & offset) === offset ? 1 : 0);
}
function unbitarray(bitsarray) {
    let result = 0;
    for (let i = 0; i < 8; ++i) {
        result = (result * 2) + (bitsarray[i] ? 1 : 0);
    }
    return result;
}
function bitarray2(byte) {
    const b = [];
    for (let i = 0; i < 8; ++i) {
        b[7 - i] = (byte >> i) & 1;
    }
    return b;
}
function isBit(field, nr) {
    return !!(field & nr);
}
function removeZeroString(s) {
    for (let j = 0; j < s.length; j++) {
        if (s.codePointAt(j) === 0) {
            return s.slice(0, j);
        }
    }
    return s;
}
function neededStoreBytes(num, min) {
    let result = Math.ceil((Math.floor(Math.log2(num) + 1) + 1) / 8);
    result = Math.max(result, min);
    return result;
}
function fileRangeToBuffer(filename, start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        return new Promise((resolve, reject) => {
            try {
                const readStream = node_fs_1.default.createReadStream(filename, { start, end });
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
    });
}
function collectFiles(dir, ext, recursive, onFileCB) {
    return __awaiter(this, void 0, void 0, function* () {
        const files1 = yield fs_extra_1.default.readdir(dir);
        for (const f of files1) {
            const sub = node_path_1.default.join(dir, f);
            const stat = yield fs_extra_1.default.stat(sub);
            if (stat.isDirectory()) {
                if (recursive) {
                    yield collectFiles(sub, ext, recursive, onFileCB);
                }
            }
            else if ((ext.includes(node_path_1.default.extname(f).toLowerCase()))) {
                yield onFileCB(sub);
            }
        }
    });
}
function validCharKeyCode(c) {
    return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
//# sourceMappingURL=utils.js.map