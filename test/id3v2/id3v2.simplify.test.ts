import { describe, expect, it } from '@jest/globals';

import { simplifyFrame, simplifyInvolvedPeopleList, simplifyTag } from '../../src/lib/id3v2/id3v2.simplify.js';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types.js';
import { ITagID } from '../../src/lib/common/types.js';
import { BufferUtils } from '../../src/lib/common/buffer.js';

function textListFrame(id: string, list: Array<string>): IID3V2.Frame {
	return { id, value: { list } as IID3V2.FrameValue.TextList };
}

function textFrame(id: string, text: string): IID3V2.Frame {
	return { id, value: { text } as IID3V2.FrameValue.Text };
}

function tag(frames: Array<IID3V2.Frame>): IID3V2.Tag {
	return { id: ITagID.ID3v2, start: 0, end: 0, frames };
}

describe('simplifyInvolvedPeopleList', () => {
	it('maps a known key to its slug with the actual paired value text', () => {
		const frame = textListFrame('TIPL', ['producer', 'Steve Albini', 'engineer', 'Steve Albini']);
		const result = simplifyInvolvedPeopleList('TIPL', frame);
		expect(result).toEqual([
			{ slug: 'PRODUCER', text: 'Steve Albini' },
			{ slug: 'ENGINEER', text: 'Steve Albini' }
		]);
	});

	it('builds a generic slug for keys that are not in the known-sections map', () => {
		const frame = textListFrame('TMCL', ['guitar', 'Jimmy Page']);
		const result = simplifyInvolvedPeopleList('TMCL', frame);
		expect(result).toEqual([{ slug: 'TMCL|guitar', text: 'Jimmy Page' }]);
	});

	it('drops a trailing key without a paired value', () => {
		const frame = textListFrame('TIPL', ['producer', 'Steve Albini', 'engineer']);
		const result = simplifyInvolvedPeopleList('TIPL', frame);
		expect(result).toEqual([{ slug: 'PRODUCER', text: 'Steve Albini' }]);
	});
});

describe('simplifyFrame', () => {
	it('maps a plain text frame via the known frame-id table', () => {
		const result = simplifyFrame(textFrame('TIT2', 'My Title'));
		expect(result).toEqual([{ slug: 'TITLE', text: 'My Title' }]);
	});

	it('upgrades an older-version frame id before mapping it', () => {
		const result = simplifyFrame(textFrame('TT2', 'Old Title'));
		expect(result).toEqual([{ slug: 'TITLE', text: 'Old Title' }]);
	});

	it('splits a combined number/total frame into two entries', () => {
		const result = simplifyFrame(textFrame('TRCK', '3/12'));
		expect(result).toEqual([
			{ slug: 'TRACKNUMBER', text: '3' },
			{ slug: 'TRACKTOTAL', text: '12' }
		]);
	});

	it('omits the total entry of a split frame when no total is present', () => {
		const result = simplifyFrame(textFrame('TRCK', '3'));
		expect(result).toEqual([{ slug: 'TRACKNUMBER', text: '3' }]);
	});

	it('maps a known TXXX description via the TXXX map', () => {
		const frame: IID3V2.Frame = { id: 'TXXX', value: { id: 'REPLAYGAIN_TRACK_GAIN', text: '-3.20 dB' } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'REPLAYGAIN_TRACK_GAIN', text: '-3.20 dB' }]);
	});

	it('builds a generic slug for an unknown TXXX description', () => {
		const frame: IID3V2.Frame = { id: 'TXXX', value: { id: 'MyCustomTag', text: 'hello' } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'TXXX|MyCustomTag', text: 'hello' }]);
	});

	it('maps a known COMM description via the COMM map', () => {
		const frame: IID3V2.Frame = { id: 'COMM', value: { id: 'comment', language: 'eng', text: 'Great song' } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'COMMENT', text: 'Great song' }]);
	});

	it('maps a known PRIV owner via the PRIV map', () => {
		const frame: IID3V2.Frame = { id: 'PRIV', value: { id: 'AverageLevel', bin: BufferUtils.fromString('x') } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'AVERAGELEVEL', text: '<bin 1bytes>' }]);
	});

	it('builds a generic slug for a WXXX frame with a description', () => {
		const frame: IID3V2.Frame = { id: 'WXXX', value: { id: 'MyLink', text: 'https://example.com' } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'WXXX|MyLink', text: 'https://example.com' }]);
	});

	it('falls back to the bare frame id for a WXXX frame without a description', () => {
		const frame: IID3V2.Frame = { id: 'WXXX', value: { id: '', text: 'https://example.com' } };
		expect(simplifyFrame(frame)).toEqual([{ slug: 'WXXX', text: 'https://example.com' }]);
	});

	it('delegates TIPL frames to simplifyInvolvedPeopleList', () => {
		const frame = textListFrame('TIPL', ['producer', 'Steve Albini']);
		expect(simplifyFrame(frame)).toEqual(simplifyInvolvedPeopleList('TIPL', frame));
	});

	it('delegates TMCL frames to simplifyInvolvedPeopleList', () => {
		const frame = textListFrame('TMCL', ['guitar', 'Jimmy Page']);
		expect(simplifyFrame(frame)).toEqual(simplifyInvolvedPeopleList('TMCL', frame));
	});

	it('returns undefined for a frame id that has no mapping', () => {
		const frame: IID3V2.Frame = { id: 'ZZZZ', value: {} };
		expect(simplifyFrame(frame)).toBeUndefined();
	});

	it('returns undefined when the frame value simplifies to empty text', () => {
		expect(simplifyFrame(textFrame('TIT2', ''))).toBeUndefined();
	});

	it('returns undefined for a frame id included in dropIDsList', () => {
		expect(simplifyFrame(textFrame('TIT2', 'My Title'), ['TIT2'])).toBeUndefined();
	});
});

describe('simplifyTag', () => {
	it('returns an empty object for a tag without frames', () => {
		expect(simplifyTag(tag([]))).toEqual({});
	});

	it('collects simplified values from multiple frames under their slugs', () => {
		const result = simplifyTag(tag([
			textFrame('TIT2', 'My Title'),
			textFrame('TPE1', 'My Artist'),
			textListFrame('TIPL', ['producer', 'Steve Albini'])
		]));
		expect(result).toEqual({
			TITLE: 'My Title',
			ARTIST: 'My Artist',
			PRODUCER: 'Steve Albini'
		});
	});

	it('suffixes the slug of a repeated tag with a counter', () => {
		const frame1: IID3V2.Frame = { id: 'TXXX', value: { id: 'CustomThing', text: 'first' } };
		const frame2: IID3V2.Frame = { id: 'TXXX', value: { id: 'CustomThing', text: 'second' } };
		const result = simplifyTag(tag([frame1, frame2]));
		expect(result).toEqual({
			'TXXX|CustomThing': 'first',
			'TXXX|CustomThing|2': 'second'
		});
	});

	it('respects dropIDsList when collecting frames', () => {
		const result = simplifyTag(tag([textFrame('TIT2', 'My Title'), textFrame('TPE1', 'My Artist')]), ['TIT2']);
		expect(result).toEqual({ ARTIST: 'My Artist' });
	});

	it('merges v2.3 TYER/TDAT/TIME frames into a single v2.4 DATE value', () => {
		const result = simplifyTag(tag([
			textFrame('TYER', '2020'),
			textFrame('TDAT', '0203'),
			textFrame('TIME', '1200')
		]));
		expect(result).toEqual({ DATE: '2020-0203-1200' });
	});
});
