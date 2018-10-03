import {IMP3} from './mp3__types';

// Joint extension - use [layerIdx][extensionIdx]
export const mpeg_layer_joint_extension: Array<Array<IMP3.FrameHeaderJointExtension | undefined>> = [
	[undefined, undefined, undefined, undefined],
	[{intensity: 0, ms: 0}, {intensity: 1, ms: 0}, {intensity: 0, ms: 1}, {intensity: 1, ms: 1}], // Layer 3
	[{bands_min: 4, bands_max: 31}, {bands_min: 8, bands_max: 31}, {bands_min: 12, bands_max: 31}, {bands_min: 16, bands_max: 31}], // Layer 2
	[{bands_min: 4, bands_max: 31}, {bands_min: 8, bands_max: 31}, {bands_min: 12, bands_max: 31}, {bands_min: 16, bands_max: 31}] // Layer 1
];

// Samples per frame - use [version][layer]
export const mpeg_frame_samples: Array<Array<number>> = [
//    Rsvd     3     2     1  < Layer  v Version
	[0, 576, 1152, 384], //       2.5
	[0, 0, 0, 0], //       Reserved
	[0, 576, 1152, 384], //       2
	[0, 1152, 1152, 384]  //       1
];
// Slot size (MPEG unit of measurement) - use [layer]
export const mpeg_slot_size: Array<number> = [0, 1, 1, 4]; // Rsvd, 3, 2, 1

// Sample rates - use [versionIdx][sampleIdx]
export const mpeg_srates: Array<Array<number>> = [
	[11025, 12000, 8000, 0], // MPEG 2.5
	[0, 0, 0, 0], // Reserved
	[22050, 24000, 16000, 0], // MPEG 2
	[44100, 48000, 32000, 0]  // MPEG 1
];

// Bitrates - use [versionIdx][layerIdx][bitrateIdx]
export const mpeg_bitrates: Array<Array<Array<number>>> = [
	[ // Version 2.5
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Reserved
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer 3
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer 2
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0]  // Layer 1
	],
	[ // Reserved
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Invalid
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Invalid
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Invalid
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // Invalid
	],
	[ // Version 2
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Reserved
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer 3
		[0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer 2
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0]  // Layer 1
	],
	[ // Version 1
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Reserved
		[0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], // Layer 3
		[0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0], // Layer 2
		[0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0], // Layer 1
	]
];

// MPEG versions - use [versionIdx]
export const mpeg_versions: Array<number | undefined> = [2.5, undefined, 2, 1];
export const mpeg_version_names: Array<string> = ['2.5', '', '2', '1'];
export const mpeg_version_names_long: Array<string> = ['2.5', '', '2 (ISO/IEC 13818-3)', '1 (ISO/IEC 11172-3)'];

// Layer versions - use [layerIdx]
export const mpeg_layers: Array<number | undefined> = [undefined, 3, 2, 1];
export const mpeg_layer_names: Array<string> = ['', '3', '2', '1'];
export const mpeg_layer_names_long: Array<string> = ['', 'MPEG audio layer 3', 'MPEG audio layer 2', 'MPEG audio layer 1'];

// Channel Modes - use [modeIdx]
export const mpeg_channel_modes: Array<string> = ['stereo', 'stereo', 'stereo', 'mono'];
export const mpeg_channel_mode_types: Array<string> = ['', 'joint', 'dual', 'single'];
export const mpeg_channel_count: Array<number> = [2, 2, 2, 1];
export const mpeg_channel_mode_jointstereoIdx = 1;

// Emphasis versions - use [emphasisIdx]
export const mpeg_emphasis: Array<string> = ['none', '50/15 ms', '', 'CCIT J.17'];

