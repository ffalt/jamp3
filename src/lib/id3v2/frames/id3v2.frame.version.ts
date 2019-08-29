import {IID3V2} from '../id3v2.types';
import {FrameDefs} from './id3v2.frame.defs';

export function upgrade23DateFramesTov24Date(dateFrames: Array<IID3V2.Frame>): IID3V2.Frame | undefined {
	const year = dateFrames.find(f => ['TYER', 'TYE'].indexOf(f.id) >= 0);
	const date = dateFrames.find(f => ['TDAT', 'TDA'].indexOf(f.id) >= 0);
	const time = dateFrames.find(f => ['TIME', 'TIM'].indexOf(f.id) >= 0);
	if (!year && !date && !time) {
		return;
	}
	const result: Array<string> = [];
	if (year && year.value && year.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>year.value).text);
	}
	if (date && date.value && date.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>date.value).text);
	}
	if (time && time.value && time.value.hasOwnProperty('text')) {
		result.push((<IID3V2.FrameValue.Text>time.value).text);
	}
	return {
		id: 'TDRC',
		title: 'Recording time',
		value: {text: result.join('-')}
	};
}

export function ensureID3v2FrameVersionDef(id: string, dest: number): string | null {
	const def = FrameDefs[id];
	if (!def) {
		// TODO: matcher
		return null;
	}
	if (def.versions.indexOf(dest) >= 0) {
		return id;
	}
	if (def.versions[0] > dest) {
		const downgradeKey = Object.keys(FrameDefs).find(key => {
			return FrameDefs[key].upgrade === id;
		});
		if (!downgradeKey) {
			// debug('ensureID3v2FrameVersionDef', 'Missing v2.' + def.versions + ' -> v2.' + dest + ' mapping', id);
			return null;
		}
		const f2 = FrameDefs[downgradeKey];
		if (f2.versions.indexOf(dest) < 0) {
			if (f2.versions[0] > dest) {
				return ensureID3v2FrameVersionDef(downgradeKey, dest);
			} else {
				return null;
			}
		} else {
			return downgradeKey;
		}
	} else {
		if (!def.upgrade) {
			// debug('ensureID3v2FrameVersionDef', 'Missing v2.' + def.versions + ' -> v2.' + dest + ' mapping', id);
			return null;
		}
		const upgradeKey = def.upgrade;
		const f2 = FrameDefs[upgradeKey];
		if (f2.versions.indexOf(dest) < 0) {
			if (f2.versions[0] < dest) {
				return ensureID3v2FrameVersionDef(upgradeKey, dest);
			} else {
				return null;
			}
		} else {
			return upgradeKey;
		}
	}
}
