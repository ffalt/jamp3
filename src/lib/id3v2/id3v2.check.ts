import {IID3V2} from './id3v2.types';
import {findId3v2FrameDef} from './frames/id3v2.frame.match';

export function checkID3v2(id3v2: IID3V2.ID3v2Tag): Array<IID3V2.Warning> {
	const result: Array<IID3V2.Warning> = [];
	for (const frame of id3v2.frames) {
		const def = findId3v2FrameDef(frame.id);
		if (def && id3v2.head && def.versions.indexOf(id3v2.head.ver) < 0) {
			result.push({msg: 'ID3v2: invalid version for frame ' + frame.id, expected: def.versions.join('|'), actual: id3v2.head.ver});
		}
	}
	return result;
}
