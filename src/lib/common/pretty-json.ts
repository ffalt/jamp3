function quoteJSONProperty(value: any): string {
	const str = typeof value === 'string' ? value : value.toString();
	return /^".*"$/.test(str) ? str : `"${str.replaceAll('"', String.raw`\"`)}"`;
}

function objToString(obj: any, level: number, options: { flatNodes: Array<string>; space: string }): string {
	const lines: Array<string> = [];
	for (const prop of Object.keys(obj)) {
		const val = obj[prop];
		if (val !== undefined) {
			const str = `${quoteJSONProperty(prop)}: ${prettyJSONify(val, level + 1, options.flatNodes.includes(prop), options)}`;
			lines.push(options.space.repeat(level + 1) + str);
		}
	}
	return (lines.length === 0) ? '{}' : `{\n${lines.join(',\n')}\n${options.space.repeat(level)}}`;
}

function arrayToString(obj: Array<any>, level: number, options: { flatNodes: Array<string>; space: string }): string {
	const lines: Array<string> = [];
	for (const c of obj) {
		lines.push(options.space.repeat(level + 1) + prettyJSONify(c, level + 1, false, options));
	}
	if (lines.length === 0) {
		return '[]';
	}
	return `[\n${lines.join(',\n')}\n${options.space.repeat(level)}]`;
}

export function prettyJSONify(obj: any, level: number, flat: boolean, options: { flatNodes: Array<string>; space: string }): string {
	if (flat || obj instanceof Buffer) {
		return JSON.stringify(obj);
	}
	if (Array.isArray(obj)) {
		return arrayToString(obj, level, options);
	}
	if (typeof obj !== 'object') {
		return JSON.stringify(obj, null, options.space);
	}
	return objToString(obj, level, options);
}

export function toPrettyJsonWithBin(o: any): string {
	return prettyJSONify(o, 0, false, { flatNodes: ['head'], space: ' ' });
}
