"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function quoteJSONProperty(str) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    return str.match(/^".*"$/) ? str : '"' + str.replace(/"/g, '\\"') + '"';
}
function prettyJSONify(obj, level, flat, flatNodes, space) {
    if (flat) {
        return JSON.stringify(obj);
    }
    const lines = [];
    if (obj instanceof Array) {
        obj.forEach((c) => {
            lines.push(space.repeat(level + 1) + prettyJSONify(c, level + 1, false, flatNodes, space));
        });
        if (lines.length === 0) {
            return '[]';
        }
        return '[\n' + lines.join(',\n') + '\n' + space.repeat(level) + ']';
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj, null, space);
    }
    if (obj instanceof Buffer) {
        return JSON.stringify(obj);
    }
    Object.keys(obj).forEach(prop => {
        const val = obj[prop];
        if (val !== undefined) {
            const str = quoteJSONProperty(prop) + ': ' + prettyJSONify(val, level + 1, flatNodes.indexOf(prop) >= 0, flatNodes, space);
            lines.push(space.repeat(level + 1) + str);
        }
    });
    if (lines.length === 0) {
        return '{}';
    }
    return '{\n' + lines.join(',\n') + '\n' + space.repeat(level) + '}';
}
exports.prettyJSONify = prettyJSONify;
function toPrettyJsonWithBin(o) {
    return prettyJSONify(o, 0, false, ['head'], ' ');
}
exports.toPrettyJsonWithBin = toPrettyJsonWithBin;
//# sourceMappingURL=pretty-json.js.map