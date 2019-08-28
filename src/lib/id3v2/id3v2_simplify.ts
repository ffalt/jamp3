import {upgrade23DateFramesTov24Date} from './id3v2_frames';
import {IID3V2} from './id3v2__types';
import {DateUpgradeMap, simplifyFrame} from './id3v2_simplify_maps';

export function simplifyTag(tag: IID3V2.Tag, dropIDsList?: Array<string>): IID3V2.TagSimplified {
	const result: IID3V2.TagSimplified = {};
	const slugcounter: { [name: string]: number } = {};
	const frames = tag.frames.filter(f => !DateUpgradeMap[f.id]);
	const dateframes = tag.frames.filter(f => !!DateUpgradeMap[f.id]);
	const dateFrame = upgrade23DateFramesTov24Date(dateframes);
	if (dateFrame) {
		frames.push(dateFrame);
	}
	frames.forEach((frame: IID3V2.Frame) => {
		const simples = simplifyFrame(frame, dropIDsList);
		if (simples) {
			for (const simple of simples) {
				const count = (slugcounter[simple.slug] || 0) + 1;
				slugcounter[simple.slug] = count;
				const name = simple.slug + (count > 1 ? '|' + count : '');
				(<any>result)[name] = simple.text;
			}
		}
	});
	return result;
}
