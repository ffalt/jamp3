module.exports = {
	src: [
		'./src/lib/mp3/mp3.ts',
		'./src/lib/id3v2/id3v2.ts',
		'./src/lib/id3v1/id3v1.ts',
		'./src/lib/mp3/mp3__types.ts',
		'./src/lib/mp3/mp3_analyzer.ts',
		'./src/lib/id3v2/id3v2__types.ts',
		'./src/lib/id3v2/id3v2_builder24.ts',
		'./src/lib/id3v1/id3v1__types.ts'
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
