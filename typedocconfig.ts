module.exports = {
	inputFiles: [
		'./src/lib/common/types.ts',
		'./src/lib/mp3/mp3.ts',
		'./src/lib/id3v2/id3v2.ts',
		'./src/lib/id3v1/id3v1.ts',
		'./src/lib/mp3/mp3.types.ts',
		'./src/lib/mp3/mp3.analyzer.ts',
		'./src/lib/mp3/mp3.analyzer.types.ts',
		'./src/lib/id3v2/id3v2.consts.ts',
		'./src/lib/id3v2/id3v2.types.ts',
		'./src/lib/id3v2/id3v2.builder.v24.ts',
		'./src/lib/id3v1/id3v1.types.ts',
		'./src/lib/id3v1/id3v1.consts.ts'
	],
	includes: [
		'./examples/'
	],
	mode: 'file',
	includeDeclarations: true,
	tsconfig: 'tsconfig.json',
	out: './docs',
	theme: 'minimal',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'README.md',
	name: 'jamp3',
	ignoreCompilerErrors: true,
	plugin: 'none',
	listInvalidSymbolLinks: true,
};
