export const mpeg_layer_joint_extension = [
    [undefined, undefined, undefined, undefined],
    [{ intensity: 0, ms: 0 }, { intensity: 1, ms: 0 }, { intensity: 0, ms: 1 }, { intensity: 1, ms: 1 }],
    [{ bands_min: 4, bands_max: 31 }, { bands_min: 8, bands_max: 31 }, { bands_min: 12, bands_max: 31 }, { bands_min: 16, bands_max: 31 }],
    [{ bands_min: 4, bands_max: 31 }, { bands_min: 8, bands_max: 31 }, { bands_min: 12, bands_max: 31 }, { bands_min: 16, bands_max: 31 }]
];
export const mpeg_frame_samples = [
    [0, 576, 1152, 384],
    [0, 0, 0, 0],
    [0, 576, 1152, 384],
    [0, 1152, 1152, 384]
];
export const mpeg_slot_size = [0, 1, 1, 4];
export const mpeg_srates = [
    [11025, 12000, 8000, 0],
    [0, 0, 0, 0],
    [22050, 24000, 16000, 0],
    [44100, 48000, 32000, 0]
];
export const mpeg_bitrates = [
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
        [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0]
    ]
];
export const mpeg_versions = [2.5, undefined, 2, 1];
export const mpeg_version_names = ['2.5', '', '2', '1'];
export const mpeg_version_names_long = ['2.5', '', '2 (ISO/IEC 13818-3)', '1 (ISO/IEC 11172-3)'];
export const mpeg_layers = [undefined, 3, 2, 1];
export const mpeg_layer_names = ['', '3', '2', '1'];
export const mpeg_layer_names_long = ['', 'MPEG audio layer 3', 'MPEG audio layer 2', 'MPEG audio layer 1'];
export const mpeg_channel_modes = ['stereo', 'stereo', 'stereo', 'mono'];
export const mpeg_channel_mode_types = ['', 'joint', 'dual', 'single'];
export const mpeg_channel_count = [2, 2, 2, 1];
export const mpeg_channel_mode_jointstereoIdx = 1;
export const mpeg_emphasis = ['none', '50/15 ms', '', 'CCIT J.17'];
//# sourceMappingURL=mp3.mpeg.consts.js.map