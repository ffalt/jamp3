// make typedoc 0.28.x work with minimatch 11 (GHSA-g3hv-75wg-m249).
//
// minimatch 11 made Minimatch#matchOne() internal; typedoc's glob() still calls
// it to prune directory walks ("mini.matchOne is not a function"). The
// documented minimatch 11 replacement for that job is the `partial` option, and
// `flipNegate` keeps the old behaviour of ignoring a leading `!`, so this swaps
//   mini.set.some((row) => mini.matchOne(childPath, row, true))
// for
//   partialMini.match(childPath.join("/"))
// with partialMini = new Minimatch(pattern, { partial: true, flipNegate: true }).
//
// Fails the install if typedoc's code no longer matches, so a typedoc bump
// cannot silently drop the patch.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(
	new URL("../../node_modules/typedoc/dist/node-utils.js", import.meta.url),
);

if (!existsSync(file)) {
	// typedoc is a devDependency; nothing to patch in a production install.
	process.exit(0);
}

const MARKER = "partialMini";
const src = readFileSync(file, "utf8");
if (src.includes(MARKER)) {
	process.exit(0);
}

const edits = [
	[
		/( *)const mini = new Minimatch2\(pattern\);\n/,
		(m, indent) =>
			`${m}${indent}const ${MARKER} = new Minimatch2(pattern, { partial: true, flipNegate: true });\n`,
	],
	[
		/return mini\.set\.some\(\(row\) => mini\.matchOne\(\s*childPath,\s*row,\s*\/\* partial \*\/\s*true\s*\)\);/,
		() => `return ${MARKER}.match(childPath.join("/"));`,
	],
];

let out = src;
for (const [pattern, replace] of edits) {
	if (!pattern.test(out)) {
		console.error(
			`patch-typedoc: ${file} no longer contains ${pattern}; ` +
			"re-check typedoc's glob() against minimatch 11 (see .github/scripts/patch-typedoc.mjs)",
		);
		process.exit(1);
	}
	out = out.replace(pattern, replace);
}
writeFileSync(file, out);
console.log("patch-typedoc: glob() now uses minimatch's partial option");
