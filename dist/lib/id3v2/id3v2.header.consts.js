export const ID3v2_MARKER = 'ID3';
export const ID3v2_FOOTER_MARKER = '3DI';
export const ID3v2_HEADER = {
    SYNCSAVEINT: [3, 4],
    SIZE: 10
};
export const ID3v2_HEADER_FLAGS = {
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
export const ID3v2_ENCODINGS = {
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
export const ID3v2_UnifiedENCODINGS = {
    '0': 'iso-8859-1',
    '1': 'ucs2',
    '2': 'utf16-be',
    '3': 'utf8',
    '254': 'ucs2'
};
export const ID3v2_FRAME_HEADER = {
    SYNCSAVEINT: [4]
};
export const ID3v2_FRAME_HEADER_LENGTHS = {
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
export const ID3v2_FRAME_FLAGS2 = {
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
export const ID3v2_FRAME_FLAGS1 = {
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
export const ID3v2_EXTHEADER = {
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
//# sourceMappingURL=id3v2.header.consts.js.map