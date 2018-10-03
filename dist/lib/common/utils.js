"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
    const b = [];
    b[0] = ((byte & 128) === 128 ? 1 : 0);
    b[1] = ((byte & 64) === 64 ? 1 : 0);
    b[2] = ((byte & 32) === 32 ? 1 : 0);
    b[3] = ((byte & 16) === 16 ? 1 : 0);
    b[4] = ((byte & 8) === 8 ? 1 : 0);
    b[5] = ((byte & 4) === 4 ? 1 : 0);
    b[6] = ((byte & 2) === 2 ? 1 : 0);
    b[7] = ((byte & 1) === 1 ? 1 : 0);
    return b;
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
function trimNull(s) {
    s = s.trim();
    return s.slice(0, s.indexOf('\u0000'));
}
exports.trimNull = trimNull;
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
            catch (e) {
                return reject(e);
            }
        });
    });
}
exports.fileRangeToBuffer = fileRangeToBuffer;
function collectFiles(dir, ext, recursive, onFileCB) {
    return __awaiter(this, void 0, void 0, function* () {
        const files1 = yield dirRead(dir);
        for (const f of files1) {
            const sub = path_1.default.join(dir, f);
            const stat = yield fsStat(sub);
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
function fileWrite(pathName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(pathName, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.fileWrite = fileWrite;
function fsStat(pathName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(pathName, (err, stat) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stat);
                }
            });
        });
    });
}
exports.fsStat = fsStat;
function fileDelete(pathName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.unlink(pathName, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.fileDelete = fileDelete;
function fileReadJson(pathName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(pathName, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    });
}
exports.fileReadJson = fileReadJson;
function fileRename(pathName, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.rename(pathName, dest, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.fileRename = fileRename;
function dirRead(pathName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.readdir(pathName, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    });
}
exports.dirRead = dirRead;
function fileExists(pathName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stat = yield fsStat(pathName);
            return stat.isFile();
        }
        catch (e) {
            if (e && e.code === 'ENOENT') {
                return false;
            }
            else {
                return Promise.reject(e);
            }
        }
    });
}
exports.fileExists = fileExists;
//# sourceMappingURL=utils.js.map