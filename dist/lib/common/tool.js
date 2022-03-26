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
exports.runTool = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
function runTool(program, onFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let input = program.opts().input;
        if (!input && program.args[0]) {
            input = program.args[0];
        }
        if (!input || input.length === 0) {
            return Promise.reject(Error('must specify a filename/directory'));
        }
        const stat = yield fs_extra_1.default.stat(input);
        if (stat.isDirectory()) {
            yield (0, utils_1.collectFiles)(input, ['.mp3'], program.opts().recursive, onFile);
        }
        else {
            yield onFile(input);
        }
    });
}
exports.runTool = runTool;
//# sourceMappingURL=tool.js.map