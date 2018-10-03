function quoteJSONProperty(str: any): string {
	if (typeof str !== 'string') {
		str = str.toString();
	}
	return str.match(/^\".*\"$/) ? str : '"' + str.replace(/"/g, '\\"') + '"';
}

function prettyJSONify(obj: any, level: number, flat: boolean, flatNodes: Array<string>, space: string): string {
	if (flat) {
		return JSON.stringify(obj);
	}
	const lines: Array<string> = [];
	if (obj instanceof Array) {
		obj.forEach((c: any) => {
			lines.push('\t'.repeat(level + 1) + prettyJSONify(c, level + 1, false, flatNodes, space));
		});
		if (lines.length === 0) {
			return '[]';
		}
		return '[\n' + lines.join(',\n') + '\n' + space.repeat(level) + ']';
	}
	if (typeof obj !== 'object') {
		return JSON.stringify(obj);
	}
	if (obj instanceof Buffer) {
		return JSON.stringify(obj);
	}
	Object.keys(obj).forEach(prop => {
		const val = obj[prop];
		if (val !== undefined) {
			const str = quoteJSONProperty(prop) + ': ' + prettyJSONify(val, level + 1, flatNodes.indexOf(prop) >= 0, flatNodes, space);
			lines.push('\t'.repeat(level + 1) + str);
		}
	});
	if (lines.length === 0) {
		return '{}';
	}
	return '{\n' + lines.join(',\n') + '\n' + space.repeat(level) + '}';
}

export function toPrettyJsonWithBin(o: any): string {
	return prettyJSONify(o, 0, false, ['head'], '\t');
}
