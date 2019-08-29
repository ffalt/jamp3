import {expect, should, use} from 'chai';
import fse from 'fs-extra';
import tmp from 'tmp';
import chaiExclude from 'chai-exclude';
import Debug from 'debug';

import {ID3v2} from '../../src/lib/id3v2/id3v2';
import {IID3V2} from '../../src/lib/id3v2/id3v2.types';
import {MP3} from '../../src/lib/mp3/mp3';
import {BufferUtils} from '../../src/lib/common/buffer';
import {rawHeaderOffSet} from '../../src/lib/mp3/mp3.mpeg.frame';
import {matchFrame} from '../../src/lib/id3v2/frames/id3v2.frame.match';
import {ensureID3v2FrameVersionDef} from '../../src/lib/id3v2/frames/id3v2.frame.version';

use(chaiExclude);
const debug = Debug('id3v2-compare');

export async function compareID3v2Tags(a: IID3V2.Tag, b: IID3V2.Tag): Promise<void> {
	expect(b.frames.length).to.equal(a.frames.length, 'Not the same frame count: ' + b.frames.map(f => f.id) + ' vs. ' + a.frames.map(f => f.id));
	if (!a.head) {
		return Promise.reject('invalid tag header');
	}
	const ver = a.head.ver;
	a.frames.forEach((af, index) => {
		const bf = b.frames[index];
		// update tag id if original file included mixed 2.2 and 2.3/4 frames in one tag (id3v2-writer auto corrects this)
		const orgID = af.id;
		const id = ensureID3v2FrameVersionDef(af.id, ver) || af.id;
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
	const mp3 = new MP3();
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copy(filename, file.name);
	await mp3.removeTags(file.name, {id3v1: true, id3v2: true, keepBackup: false});
	const before = await mp3.read(file.name, {mpegQuick: true});
	const paddingSize = 10;
	debug('writing', file.name);
	try {
		const id3 = new ID3v2();
		const ver = tag.head ? tag.head.ver : 4;
		const rev = tag.head ? tag.head.rev : 0;
		await id3.write(file.name, tag, ver, rev, {keepBackup: false, paddingSize});
	} catch (e) {
		file.removeCallback();
		return Promise.reject(e);
	}
	try {
		debug('id3v2test', 'loading', file.name);
		const data = await mp3.read(file.name, {id3v2: true, mpegQuick: true});
		should().exist(data);
		if (!data) {
			return;
		}
		should().exist(data.id3v2);
		if (!data.id3v2) {
			return;
		}
		should().exist(data.id3v2.head);
		if (!data.id3v2.head) {
			return;
		}
		if (data.frames && data.frames.audio.length > 0) {
			const trashInFile = (before && before.frames ? rawHeaderOffSet(before.frames.audio[0]) : 0);
			const startOfAudio = rawHeaderOffSet(data.frames.audio[0]) - trashInFile;
			const headerSize = 10;
			const size = data.id3v2.head.size;
			const endOfID3v2spec = data.id3v2.start + size + headerSize;
			if (startOfAudio !== endOfID3v2spec) {
				console.log('trashInFile', trashInFile);
				console.log('startOfAudio', startOfAudio);
				console.log('endOfID3v2 spec', endOfID3v2spec);
				console.log('endOfID3v2 real', data.id3v2.end + paddingSize);
				console.log('id3v2.start', data.id3v2.start);
				console.log('id3v2.size', data.id3v2.head.size);
				console.log('id3v2.head', data.id3v2.head);
				console.log('---');
			}
			expect(startOfAudio).to.equal(endOfID3v2spec, 'id3v2 header size declaration seems to be wrong');
			// expect(startOfAudio).to.equal(data.id3v2.end + paddingSize, 'id3v2 padding seems to be wrong');
		}
		await compareID3v2Tags(tag, data.id3v2);
	} catch (e) {
		file.removeCallback();
		return Promise.reject(e);
	}
	file.removeCallback();
}
