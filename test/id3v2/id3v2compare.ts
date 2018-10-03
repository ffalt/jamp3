import {expect, should, use} from 'chai';
import tmp from 'tmp';
import 'mocha';
import {ID3v2} from '../../src/lib/id3v2/id3v2';
import {IID3V2} from '../../src';
import chaiExclude = require('chai-exclude');
import {BufferUtils} from '../../src/lib/common/buffer';
import {ensureID3v2FrameVersionDef, matchFrame} from '../../src/lib/id3v2/id3v2_frames';
import Debug from 'debug';
import {fileDelete} from '../../src/lib/common/utils';

const debug = Debug('id3v2-compare');

use(chaiExclude);

export async function compareID3v2Tags(a: IID3V2.Tag, b: IID3V2.Tag): Promise<void> {
	expect(b.frames.length).to.equal(a.frames.length, 'Not the same frame count: ' + b.frames.map(f => f.id) + ' vs. ' + a.frames.map(f => f.id));
	expect(b.head).excluding(['syncSaveSize', 'size']).to.deep.equal(a.head);
	a.frames.forEach((af, index) => {
		const bf = b.frames[index];
		// update tag id if original file included mixed 2.2 and 2.3/4 frames in one tag (id3v2-writer auto corrects this)
		const orgID = af.id;
		const id = ensureID3v2FrameVersionDef(af.id, a.head.ver) || af.id;
		expect(bf.id).to.equal(id);
		expect(bf.head).excludingEvery(['size']).to.deep.equal(af.head);
		expect(bf.groupId).to.equal(af.groupId);
		expect({sub: bf.subframes}).excludingEvery(['size', 'bin', 'invalid']).to.to.deep.equal({sub: af.subframes});
		if (orgID !== id) {
			const orgFrameImpl = matchFrame(af.id);
			if (orgFrameImpl.upgradeValue) {
				const upgradevalue = orgFrameImpl.upgradeValue(af.value);
				expect(bf.value).excludingEvery(['bin']).to.deep.equal(upgradevalue);
			}
		} else {
			expect(bf.value).excludingEvery(['bin']).to.deep.equal(af.value);
		}
		// compare binary on our own, mocha is very slow with it and the tests are timing out :P
		if (af.value.hasOwnProperty('bin')) {
			expect(BufferUtils.compareBuffer((<any>af.value).bin, (<any>bf.value).bin)).to.be.equal(true, 'Binary is not equal');
		}
	});
}

export async function compareID3v2Save(filename: string, tag: IID3V2.Tag): Promise<void> {
	const file = tmp.fileSync();
	await fileDelete(file.name);
	debug('writing', file.name);
	try {
		const id3 = new ID3v2();
		await id3.write(file.name, tag, tag.head.ver, tag.head.rev);
	} catch (e) {
		file.removeCallback();
		return Promise.reject(e);
	}
	try {
		debug('id3v2test', 'loading', file.name);
		const id3 = new ID3v2();
		const tag2 = await id3.read(file.name);
		should().exist(tag2);
		if (tag2) {
			await compareID3v2Tags(tag, tag2);
		}
	} catch (e) {
		file.removeCallback();
		return Promise.reject(e);
	}
}
