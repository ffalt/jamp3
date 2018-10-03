"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3v2_MARKER = 'ID3';
exports.ID3v2_HEADER = {
    SYNCSAVEINT: [3, 4],
    SIZE: 10
};
exports.ID3v2_HEADER_FLAGS = {
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
exports.ID3v2_ENCODINGS = {
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
exports.ID3v2_UnifiedENCODINGS = {
    '0': 'iso-8859-1',
    '1': 'ucs2',
    '2': 'utf16-be',
    '3': 'utf8',
    '254': 'ucs2'
};
exports.ID3v2_FRAME_HEADER = {
    SYNCSAVEINT: [4]
};
exports.ID3v2_FRAME_HEADER_LENGTHS = {
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
exports.ID3v2_FRAME_FLAGS2 = {
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
        'data_length_indicator'
    ]
};
exports.ID3v2_FRAME_FLAGS1 = {
    3: [
        'tag_alter_preservation',
        'file_alter_preservation',
        'read_only'
    ],
    4: [
        'reserved',
        'tag_alter_preservation',
        'file_alter_preservation',
        'read_only'
    ]
};
exports.ID3v2_EXTHEADER = {
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
//# sourceMappingURL=id3v2_consts.js.map