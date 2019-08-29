import {IID3V2} from './id3v2.types';
import {COMMMap, DateUpgradeMap, FramesMap, PRIVMap, SplitFrameMap, TXXXMap, UFIDMap} from './id3v2.simplify.maps';
import {ensureID3v2FrameVersionDef, upgrade23DateFramesTov24Date} from './frames/id3v2.frame.version';
import {matchFrame} from './frames/id3v2.frame.match';

export function simplifyFrame(frame: IID3V2.Frame, dropIDsList?: Array<string>): Array<{ slug: string; text: string; }> | null {
	const id = ensureID3v2FrameVersionDef(frame.id, 4) || frame.id;
	if (dropIDsList && dropIDsList.indexOf(frame.id) >= 0) {
		return null;
	}
	let slug = FramesMap[id];
	if (id === 'UFID') {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id) {
			slug = UFIDMap[value.id] || ('UFID|' + value.id);
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'TXXX') {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id) {
			slug = TXXXMap[value.id] || TXXXMap[value.id.toUpperCase()] || ('TXXX|' + value.id);
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'COMM') {
		const value = <IID3V2.FrameValue.LangDescText>frame.value;
		if (value && value.id) {
			slug = COMMMap[value.id] || ('COMM|' + value.id);
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'PRIV') {
		const value = <IID3V2.FrameValue.IdBin>frame.value;
		if (value && value.id) {
			slug = PRIVMap[value.id] || ('PRIV|' + value.id);
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'WXXX') {
		const value = <IID3V2.FrameValue.IdText>frame.value;
		if (value && value.id) {
			slug = 'WXXX|' + value.id;
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'LINK') {
		const value = <IID3V2.FrameValue.LinkedInfo>frame.value;
		if (value && value.id) {
			slug = 'LINK|' + value.id;
		} else if (value) {
			slug = id;
		} else {
			return null;
		}
	} else if (id === 'TIPL' || id === 'TMCL') {
		const value = <IID3V2.FrameValue.TextList>frame.value;
		const knownSections: { [key: string]: string } = {
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
			slug = knownSections[value.list[i]];
			const val = knownSections[value.list[i]];
			if (val) {
				if (slug) {
					list.push({slug, text: val});
				} else {
					list.push({slug: id + '|' + value.list[i], text: val});
				}
			}
			i += 2;
		}
		return list;
	}
	if (!slug) {
		return null;
	}
	const frameDef = matchFrame(id);
	const text = frameDef.impl.simplify(frame.value);
	if (text && SplitFrameMap[id]) {
		const names = SplitFrameMap[id];
		const split = text.split('/');
		const result = [];
		if (split[0]) {
			result.push({slug: names[0], text: split[0]});
		}
		if (split[1]) {
			result.push({slug: names[1], text: split[1]});
		}
		return result;
	}
	if (text) {
		return [{slug, text}];
	}
	return null;
}

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
