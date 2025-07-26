export const ID3v2_MARKER = 'ID3';

export const ID3v2_HEADER: {
	SYNCSAVEINT: Array<number>;
	SIZE: number;
} = {
	SYNCSAVEINT: [3, 4],
	SIZE: 10
};

export const ID3v2_HEADER_FLAGS: Record<number, Array<string>> = {
	2: [
		'unsynchronisation',
		'compression'
	],
	3: [
		'unsynchronisation',
		'extendedheader',
		'experimental'
	],
	4: [
		'unsynchronisation',
		'extendedheader',
		'experimental',
		'footer'
	]
};

export const ID3v2_ENCODINGS: Record<number, Record<string, string>> = {
	2: {
		'0': 'iso-8859-1',
		'1': 'ucs2'
	},
	3: {
		'0': 'iso-8859-1',
		'1': 'ucs2',
		'254': 'ucs2'
	},
	4: {
		'0': 'iso-8859-1',
		'1': 'ucs2',
		'2': 'utf16-be',
		'3': 'utf8'
	}
};

export const ID3v2_UnifiedENCODINGS: Record<string, string> = {
	'0': 'iso-8859-1',
	'1': 'ucs2',
	'2': 'utf16-be',
	'3': 'utf8',
	'254': 'ucs2'
};

export const ID3v2_FRAME_HEADER: { SYNCSAVEINT: Array<number> } = {
	SYNCSAVEINT: [4]
};

export const ID3v2_FRAME_HEADER_LENGTHS: Record<string, Record<number, number>> = {
	SIZE: {
		2: 3,
		3: 4,
		4: 4
	},
	MARKER: {
		2: 3,
		3: 4,
		4: 4
	},
	FLAGS: {
		2: 0,
		3: 2,
		4: 2
	}
};

export const ID3v2_FRAME_FLAGS2: Record<number, Array<string>> = {
	3: [
		'compressed',
		'encrypted',
		'grouping'
	],
	4: [
		'reserved',
		'grouping',
		'reserved2',
		'reserved3',
		'compressed',
		'encrypted',
		'unsynchronised',
		'dataLengthIndicator'
	]
};
export const ID3v2_FRAME_FLAGS1: Record<number, Array<string>> = {
	3: [
		'tagAlterPreservation',
		'fileAlterPreservation',
		'readOnly'
	],
	4: [
		'reserved',
		'tagAlterPreservation',
		'fileAlterPreservation',
		'readOnly'
	]
};

export const ID3v2_EXTHEADER: {
	3: {
		FLAGS1: Array<string>;
		FLAGS2: Array<string>;
		CRCDATASIZE: number;
	};
	4: { FLAGS: Array<string> };
	SYNCSAVEINT: Array<number>;
} = {
	3: {
		FLAGS1: ['crc'],
		FLAGS2: [],
		CRCDATASIZE: 4
	},
	4: {
		FLAGS: [
			'reserved',
			'update',
			'crc',
			'restrictions'
		]
	},
	SYNCSAVEINT: [4]
};
