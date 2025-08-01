import fse from 'fs-extra';
import tmp from 'tmp';

import { ID3v2 } from '../../src/lib/id3v2/id3v2';
import { IID3V2 } from '../../src/lib/id3v2/id3v2.types';
import { MP3 } from '../../src/lib/mp3/mp3';
import { BufferUtils } from '../../src/lib/common/buffer';
import { rawHeaderOffSet } from '../../src/lib/mp3/mp3.mpeg.frame';
import { matchFrame } from '../../src/lib/id3v2/frames/id3v2.frame.match';
import { ensureID3v2FrameVersionDef } from '../../src/lib/id3v2/frames/id3v2.frame.version';
import { omit } from '../common/common';

export async function compareID3v2Tags(a: IID3V2.Tag, b: IID3V2.Tag): Promise<void> {
	expect(b.frames.length).toBe(a.frames.length); // 'Not the same frame count: ' + b.frames.map(f => f.id) + ' vs. ' + a.frames.map(f => f.id));
	if (!a.head) {
		return Promise.reject('invalid tag header');
	}
	const ver = a.head.ver;
	for (const [index, af] of a.frames.entries()) {
		const bf = b.frames[index];
		// update tag id if original file included mixed 2.2 and 2.3/4 frames in one tag (id3v2-writer auto corrects this)
		const orgID = af.id;
		const id = ensureID3v2FrameVersionDef(af.id, ver) || af.id;
		expect(bf.id).toBe(id);

		expect(omit(bf.head, ['size'])).toEqual(omit(af.head, ['size']));
		// expect(bf.head).excludingEvery(['size']).to.deep.equal(af.head);

		expect(bf.groupId).toBe(af.groupId);
		expect(omit({ sub: bf.subframes }, ['size', 'bin', 'invalid']))
			.toEqual(omit({ sub: af.subframes }, ['size', 'bin', 'invalid']));
		// expect({sub: bf.subframes}).excludingEvery(['size', 'bin', 'invalid']).to.to.deep.equal({sub: af.subframes});
		if (orgID === id) {
			expect(omit(bf.value, ['bin'])).toEqual(omit(af.value, ['bin']));
			// expect(bf.value).excludingEvery(['bin']).to.deep.equal(af.value);
		} else {
			const orgFrameImpl = matchFrame(af.id);
			if (orgFrameImpl.upgradeValue) {
				const upgradevalue = orgFrameImpl.upgradeValue(af.value);
				expect(omit(bf.value, ['bin'])).toEqual(omit(upgradevalue, ['bin']));
				// expect(bf.value).excludingEvery(['bin']).to.deep.equal(upgradevalue);
			}
		}
		// compare binary on our own, mocha/jasemine/jest are *very* slow with it and the tests are timing out :P
		if (Object.hasOwn(af.value, 'bin')) {
			expect(BufferUtils.compareBuffer((af.value as any).bin, (bf.value as any).bin)).toBe(true); // 'Binary is not equal');
		}
	}
}

export async function compareID3v2Save(filename: string, tag: IID3V2.Tag): Promise<void> {
	const mp3 = new MP3();
	const file = tmp.fileSync();
	await fse.remove(file.name);
	await fse.copy(filename, file.name);
	await mp3.removeTags(file.name, { id3v1: true, id3v2: true, keepBackup: false });
	const before = await mp3.read(file.name, { mpegQuick: true });
	const paddingSize = 10;
	try {
		const id3 = new ID3v2();
		const version = tag.head ? tag.head.ver : 4;
		const revision = tag.head ? tag.head.rev : 0;
		await id3.write(file.name, tag, version, revision, { keepBackup: false, paddingSize });
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	try {
		const data = await mp3.read(file.name, { id3v2: true, mpegQuick: true });
		expect(data).toBeTruthy();
		if (!data) {
			return;
		}
		expect(data.id3v2).toBeTruthy();
		if (!data.id3v2) {
			return;
		}
		expect(data.id3v2.head).toBeTruthy();
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
			expect(startOfAudio).toBe(endOfID3v2spec); // 'id3v2 header size declaration seems to be wrong');
			// expect(startOfAudio).toBe(data.id3v2.end + paddingSize, 'id3v2 padding seems to be wrong');
		}
		await compareID3v2Tags(tag, data.id3v2);
	} catch (error) {
		file.removeCallback();
		return Promise.reject(error);
	}
	file.removeCallback();
}
