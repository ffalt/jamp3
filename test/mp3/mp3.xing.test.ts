import fse from 'fs-extra';
import tmp from 'tmp';
import { describe, expect, it } from '@jest/globals';

import { MP3 } from '../../src/lib/mp3/mp3.js';
import { expandMPEGFrameFlags, sideInfoSize } from '../../src/lib/mp3/mp3.mpeg.frame.js';

// MPEG 1, Layer III, 128 kbps, 44100 Hz, mono, no padding
// => frame size 417 bytes, side information 17 bytes, Xing header at offset 4 + 17 = 21
const FRAME_HEADER = Buffer.from([0xFF, 0xFB, 0x90, 0xC0]);
const FRAME_SIZE = 417;
const XING_OFFSET = 4 + 17;

function frameWithXing(): Buffer {
	const frame = Buffer.alloc(FRAME_SIZE);
	FRAME_HEADER.copy(frame, 0);
	frame.write('Xing', XING_OFFSET, 'ascii');
	frame.writeUInt32BE(0x03, XING_OFFSET + 4); // frames + bytes fields present
	frame.writeUInt32BE(10, XING_OFFSET + 8); // number of frames
	frame.writeUInt32BE(4170, XING_OFFSET + 12); // number of bytes
	return frame;
}

function frameWithFalseMarkers(): Buffer {
	// audio payload of a later frame that coincidentally contains the marker strings
	// within the first 40 bytes (where the old code scanned for them)
	const frame = Buffer.alloc(FRAME_SIZE);
	FRAME_HEADER.copy(frame, 0);
	frame.write('Info', 4, 'ascii');
	frame.writeUInt32BE(0x0F, 8); // garbage flags: all fields "present"
	frame.write('VBRI', 36, 'ascii');
	frame.writeUInt16BE(1, 40); // garbage vbri version
	return frame;
}

describe('MPEG vbr header detection', () => {
	it('computes the Layer III side information size', () => {
		const mpeg1Stereo = expandMPEGFrameFlags(0xFF_FB, 0x90_00, 0); // MPEG1 L3 stereo (mode 00)
		const mpeg1Mono = expandMPEGFrameFlags(0xFF_FB, 0x90_C0, 0); // MPEG1 L3 mono (mode 11)
		const mpeg2Stereo = expandMPEGFrameFlags(0xFF_F3, 0x90_00, 0); // MPEG2 L3 stereo
		const mpeg2Mono = expandMPEGFrameFlags(0xFF_F3, 0x90_C0, 0); // MPEG2 L3 mono
		expect(mpeg1Stereo && sideInfoSize(mpeg1Stereo)).toBe(32);
		expect(mpeg1Mono && sideInfoSize(mpeg1Mono)).toBe(17);
		expect(mpeg2Stereo && sideInfoSize(mpeg2Stereo)).toBe(17);
		expect(mpeg2Mono && sideInfoSize(mpeg2Mono)).toBe(9);
	});

	it('detects the Xing header only in the first frame, ignoring marker strings in later frame payloads', async () => {
		const file = tmp.fileSync({ postfix: '.mp3' });
		try {
			await fse.writeFile(file.name, Buffer.concat([frameWithXing(), frameWithFalseMarkers()]));
			const mp3 = new MP3();
			const result = await mp3.read(file.name, { mpeg: true });
			expect(result.frames?.headers.length).toBe(1);
			expect(result.frames?.headers[0].mode).toBe('Xing');
			expect(result.mpeg?.frameCountDeclared).toBe(10);
			expect(result.mpeg?.audioBytesDeclared).toBe(4170);
		} finally {
			file.removeCallback();
		}
	});

	it('still detects the Xing header when a junk header precedes the first real frame', async () => {
		const file = tmp.fileSync({ postfix: '.mp3' });
		try {
			// 200 junk bytes containing a false frame-sync-like header without a vbr header
			const junk = Buffer.alloc(200, 0xAA);
			junk.set([0xFF, 0xFB, 0x90, 0xC0], 50);
			await fse.writeFile(file.name, Buffer.concat([junk, frameWithXing(), frameWithFalseMarkers()]));
			const mp3 = new MP3();
			const result = await mp3.read(file.name, { mpeg: true });
			expect(result.frames?.headers.length).toBe(1);
			expect(result.frames?.headers[0].mode).toBe('Xing');
		} finally {
			file.removeCallback();
		}
	});
});
