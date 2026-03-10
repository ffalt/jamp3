import { IID3V2 } from './id3v2.types';
import { COMMMap, DateUpgradeMap, FramesMap, PRIVMap, SplitFrameMap, TXXXMap, UFIDMap } from './id3v2.simplify.maps';
import { ensureID3v2FrameVersionDef, upgrade23DateFramesTov24Date } from './frames/id3v2.frame.version';
import { matchFrame } from './frames/id3v2.frame.match';

function slugIDValue(id: string, value: { id: string }, mapping: Record<string, string>): string | undefined {
	if (value && value.id) {
		return mapping[value.id] || mapping[value.id.toUpperCase()] || (`${id}|${value.id}`);
	}
	if (value) {
		return id;
	}
}

export function simplifyInvolvedPeopleList(id: string, frame: IID3V2.Frame): Array<{ slug: string; text: string }> | undefined {
	const value = frame.value as IID3V2.FrameValue.TextList;
	const knownSections: Record<string, string> = {
		'arranger': 'ARRANGER',
		'engineer': 'ENGINEER',
		'DJ-mix': 'DJMIXER',
		'mix': 'MIXER',
		'producer': 'PRODUCER',
		'instrument': 'PERFORMER'
	};
	const list = [];
	let i = 0;
	while (i < value.list.length - 1) {
		const slug = knownSections[value.list[i]];
		const val = knownSections[value.list[i]];
		if (val) {
			if (slug) {
				list.push({ slug, text: val });
			} else {
				list.push({ slug: `${id}|${value.list[i]}`, text: val });
			}
		}
		i += 2;
	}
	return list;
}

function simplifyValue(id: string, slug: string, frame: IID3V2.Frame): Array<{ slug: string; text: string }> | undefined {
	const frameDef = matchFrame(id);
	const text = frameDef.impl.simplify(frame.value);
	if (!text) {
		return;
	}
	if (SplitFrameMap[id]) {
		const names = SplitFrameMap[id];
		const split = text.split('/');
		const result = [];
		if (split[0]) {
			result.push({ slug: names[0], text: split[0] });
		}
		if (split[1]) {
			result.push({ slug: names[1], text: split[1] });
		}
		return result;
	}
	return [{ slug, text }];
}

export function simplifyFrame(frame: IID3V2.Frame, dropIDsList?: Array<string>): Array<{ slug: string; text: string }> | undefined {
	const id = ensureID3v2FrameVersionDef(frame.id, 4) || frame.id;
	if (dropIDsList && dropIDsList.includes(frame.id)) {
		return;
	}
	let slug: string | undefined = FramesMap[id];
	switch (id) {
		case 'UFID': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.IdText, UFIDMap);
			break;
		}
		case 'TXXX': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.IdText, TXXXMap);
			break;
		}
		case 'COMM': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.LangDescText, COMMMap);
			break;
		}
		case 'PRIV': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.IdBin, PRIVMap);
			break;
		}
		case 'WXXX': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.IdText, {});
			break;
		}
		case 'LINK': {
			slug = slugIDValue(id, frame.value as IID3V2.FrameValue.LinkedInfo, {});
			break;
		}
		case 'TIPL':
		case 'TMCL': {
			return simplifyInvolvedPeopleList(id, frame);
		}
	}
	if (slug) {
		return simplifyValue(id, slug, frame);
	}
}

export function simplifyTag(tag: IID3V2.Tag, dropIDsList?: Array<string>): IID3V2.TagSimplified {
	const result: IID3V2.TagSimplified = {};
	const slugCounter: Record<string, number> = {};
	const frames = tag.frames.filter(f => !DateUpgradeMap[f.id]);
	const dateFrames = tag.frames.filter(f => !!DateUpgradeMap[f.id]);
	const dateFrame = upgrade23DateFramesTov24Date(dateFrames);
	if (dateFrame) {
		frames.push(dateFrame);
	}
	for (const frame of frames) {
		const simples = simplifyFrame(frame, dropIDsList);
		if (simples) {
			for (const simple of simples) {
				const count = (slugCounter[simple.slug] || 0) + 1;
				slugCounter[simple.slug] = count;
				const name = simple.slug + (count > 1 ? `|${count}` : '');
				(result as any)[name] = simple.text;
			}
		}
	}
	return result;
}
