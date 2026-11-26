import { COMMMap, DateUpgradeMap, FramesMap, PRIVMap, SplitFrameMap, TXXXMap, UFIDMap } from './id3v2.simplify.maps.js';
import { ensureID3v2FrameVersionDef, upgrade23DateFramesTov24Date } from './frames/id3v2.frame.version.js';
import { matchFrame } from './frames/id3v2.frame.match.js';
function slugIDValue(id, value, mapping) {
    if (value && value.id) {
        return mapping[value.id] || mapping[value.id.toUpperCase()] || (`${id}|${value.id}`);
    }
    if (value) {
        return id;
    }
}
export function simplifyInvolvedPeopleList(id, frame) {
    const value = frame.value;
    const knownSections = {
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
        const val = value.list[i + 1];
        if (val) {
            if (slug) {
                list.push({ slug, text: val });
            }
            else {
                list.push({ slug: `${id}|${value.list[i]}`, text: val });
            }
        }
        i += 2;
    }
    return list;
}
function simplifyValue(id, slug, frame) {
    const frameDef = matchFrame(id);
    const text = frameDef.impl.simplify(frame.value);
    if (!text) {
        return;
    }
    if (SplitFrameMap[id]) {
        const names = SplitFrameMap[id];
        const split = text.split('\n', 1)[0].split('/');
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
export function simplifyFrame(frame, dropIDsList) {
    const id = ensureID3v2FrameVersionDef(frame.id, 4) || frame.id;
    if (dropIDsList && dropIDsList.includes(frame.id)) {
        return;
    }
    let slug = FramesMap[id];
    switch (id) {
        case 'UFID': {
            slug = slugIDValue(id, frame.value, UFIDMap);
            break;
        }
        case 'TXXX': {
            slug = slugIDValue(id, frame.value, TXXXMap);
            break;
        }
        case 'COMM': {
            slug = slugIDValue(id, frame.value, COMMMap);
            break;
        }
        case 'PRIV': {
            slug = slugIDValue(id, frame.value, PRIVMap);
            break;
        }
        case 'WXXX': {
            slug = slugIDValue(id, frame.value, {});
            break;
        }
        case 'LINK': {
            slug = slugIDValue(id, frame.value, {});
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
export function simplifyTag(tag, dropIDsList) {
    const result = {};
    const slugCounter = {};
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
                result[name] = simple.text;
            }
        }
    }
    return result;
}
//# sourceMappingURL=id3v2.simplify.js.map