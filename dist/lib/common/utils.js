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
exports.validCharKeyCode = exports.collectFiles = exports.fileRangeToBuffer = exports.neededStoreBytes = exports.removeZeroString = exports.isBit = exports.bitarray2 = exports.unbitarray = exports.bitarray = exports.log2 = exports.unsynchsafe = exports.synchsafe = exports.unflags = exports.flags = exports.isBitSetAt = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function isBitSetAt(byte, bit) {
    return (byte & 1 << bit) !== 0;
}
exports.isBitSetAt = isBitSetAt;
function flags(names, values) {
    const result = {};
    names.forEach((name, i) => {
        result[name] = !!values[i];
    });
    return result;
}
exports.flags = flags;
function unflags(names, flagsObj) {
    return names.map(name => {
        return flagsObj && flagsObj[name] ? 1 : 0;
    });
}
exports.unflags = unflags;
function synchsafe(input) {
    let out;
    let mask = 0x7F;
    while (mask ^ 0x7FFFFFFF) {
        out = input & ~mask;
        out = out << 1;
        out = out | (input & mask);
        mask = ((mask + 1) << 8) - 1;
        input = out;
    }
    if (out === undefined) {
        return 0;
    }
    return out;
}
exports.synchsafe = synchsafe;
function unsynchsafe(input) {
    let out = 0, mask = 0x7F000000;
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
exports.unsynchsafe = unsynchsafe;
function log2(x) {
    return Math.log(x) * Math.LOG2E;
}
exports.log2 = log2;
function bitarray(byte) {
    return [128, 64, 32, 16, 8, 4, 2, 1].map(offset => (byte & offset) === offset ? 1 : 0);
}
exports.bitarray = bitarray;
function unbitarray(bitsarray) {
    let result = 0;
    for (let i = 0; i < 8; ++i) {
        result = (result * 2) + (bitsarray[i] ? 1 : 0);
    }
    return result;
}
exports.unbitarray = unbitarray;
function bitarray2(byte) {
    const b = [];
    for (let i = 0; i < 8; ++i) {
        b[7 - i] = (byte >> i) & 1;
    }
    return b;
}
exports.bitarray2 = bitarray2;
function isBit(field, nr) {
    return !!(field & nr);
}
exports.isBit = isBit;
function removeZeroString(s) {
    for (let j = 0; j < s.length; j++) {
        if (s.charCodeAt(j) === 0) {
            s = s.slice(0, j);
            break;
        }
    }
    return s;
}
exports.removeZeroString = removeZeroString;
function neededStoreBytes(num, min) {
    let result = Math.ceil((Math.floor(log2(num) + 1) + 1) / 8);
    result = Math.max(result, min);
    return result;
}
exports.neededStoreBytes = neededStoreBytes;
function fileRangeToBuffer(filename, start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        return new Promise((resolve, reject) => {
            try {
                const readStream = fs_1.default.createReadStream(filename, { start, end });
                readStream.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                readStream.on('error', e => {
                    reject(e);
                });
                readStream.on('close', () => {
                    resolve(Buffer.concat(chunks));
                });
            }
            catch (e) {
                return reject(e);
            }
        });
    });
}
exports.fileRangeToBuffer = fileRangeToBuffer;
function collectFiles(dir, ext, recursive, onFileCB) {
    return __awaiter(this, void 0, void 0, function* () {
        const files1 = yield fs_extra_1.default.readdir(dir);
        for (const f of files1) {
            const sub = path_1.default.join(dir, f);
            const stat = yield fs_extra_1.default.stat(sub);
            if (stat.isDirectory()) {
                if (recursive) {
                    yield collectFiles(sub, ext, recursive, onFileCB);
                }
            }
            else if ((ext.indexOf(path_1.default.extname(f).toLowerCase()) >= 0)) {
                yield onFileCB(sub);
            }
        }
    });
}
exports.collectFiles = collectFiles;
function validCharKeyCode(c) {
    return ((c >= 48) && (c < 58)) || ((c >= 65) && (c < 91));
}
exports.validCharKeyCode = validCharKeyCode;
//# sourceMappingURL=utils.js.map