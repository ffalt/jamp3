"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mpeg_emphasis = exports.mpeg_channel_mode_jointstereoIdx = exports.mpeg_channel_count = exports.mpeg_channel_mode_types = exports.mpeg_channel_modes = exports.mpeg_layer_names_long = exports.mpeg_layer_names = exports.mpeg_layers = exports.mpeg_version_names_long = exports.mpeg_version_names = exports.mpeg_versions = exports.mpeg_bitrates = exports.mpeg_srates = exports.mpeg_slot_size = exports.mpeg_frame_samples = exports.mpeg_layer_joint_extension = void 0;
exports.mpeg_layer_joint_extension = [
    [undefined, undefined, undefined, undefined],
    [{ intensity: 0, ms: 0 }, { intensity: 1, ms: 0 }, { intensity: 0, ms: 1 }, { intensity: 1, ms: 1 }],
    [{ bands_min: 4, bands_max: 31 }, { bands_min: 8, bands_max: 31 }, { bands_min: 12, bands_max: 31 }, { bands_min: 16, bands_max: 31 }],
    [{ bands_min: 4, bands_max: 31 }, { bands_min: 8, bands_max: 31 }, { bands_min: 12, bands_max: 31 }, { bands_min: 16, bands_max: 31 }]
];
exports.mpeg_frame_samples = [
    [0, 576, 1152, 384],
    [0, 0, 0, 0],
    [0, 576, 1152, 384],
    [0, 1152, 1152, 384]
];
exports.mpeg_slot_size = [0, 1, 1, 4];
exports.mpeg_srates = [
    [11025, 12000, 8000, 0],
    [0, 0, 0, 0],
    [22050, 24000, 16000, 0],
    [44100, 48000, 32000, 0]
];
exports.mpeg_bitrates = [
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0],
        [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0],
    ]
];
exports.mpeg_versions = [2.5, undefined, 2, 1];
exports.mpeg_version_names = ['2.5', '', '2', '1'];
exports.mpeg_version_names_long = ['2.5', '', '2 (ISO/IEC 13818-3)', '1 (ISO/IEC 11172-3)'];
exports.mpeg_layers = [undefined, 3, 2, 1];
exports.mpeg_layer_names = ['', '3', '2', '1'];
exports.mpeg_layer_names_long = ['', 'MPEG audio layer 3', 'MPEG audio layer 2', 'MPEG audio layer 1'];
exports.mpeg_channel_modes = ['stereo', 'stereo', 'stereo', 'mono'];
exports.mpeg_channel_mode_types = ['', 'joint', 'dual', 'single'];
exports.mpeg_channel_count = [2, 2, 2, 1];
exports.mpeg_channel_mode_jointstereoIdx = 1;
exports.mpeg_emphasis = ['none', '50/15 ms', '', 'CCIT J.17'];
//# sourceMappingURL=mp3.mpeg.consts.js.map