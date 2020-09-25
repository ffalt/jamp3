"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrettyJsonWithBin = exports.prettyJSONify = void 0;
function quoteJSONProperty(str) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    return str.match(/^".*"$/) ? str : '"' + str.replace(/"/g, '\\"') + '"';
}
function objToString(obj, level, options) {
    const lines = [];
    Object.keys(obj).forEach(prop => {
        const val = obj[prop];
        if (val !== undefined) {
            const str = quoteJSONProperty(prop) + ': ' + prettyJSONify(val, level + 1, options.flatNodes.indexOf(prop) >= 0, options);
            lines.push(options.space.repeat(level + 1) + str);
        }
    });
    return (lines.length === 0) ? '{}' : '{\n' + lines.join(',\n') + '\n' + options.space.repeat(level) + '}';
}
function arrayToString(obj, level, options) {
    const lines = [];
    obj.forEach((c) => {
        lines.push(options.space.repeat(level + 1) + prettyJSONify(c, level + 1, false, options));
    });
    if (lines.length === 0) {
        return '[]';
    }
    return '[\n' + lines.join(',\n') + '\n' + options.space.repeat(level) + ']';
}
function prettyJSONify(obj, level, flat, options) {
    if (flat || obj instanceof Buffer) {
        return JSON.stringify(obj);
    }
    if (obj instanceof Array) {
        return arrayToString(obj, level, options);
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj, null, options.space);
    }
    return objToString(obj, level, options);
}
exports.prettyJSONify = prettyJSONify;
function toPrettyJsonWithBin(o) {
    return prettyJSONify(o, 0, false, { flatNodes: ['head'], space: ' ' });
}
exports.toPrettyJsonWithBin = toPrettyJsonWithBin;
//# sourceMappingURL=pretty-json.js.map