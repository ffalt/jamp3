"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyTag = exports.simplifyFrame = exports.simplifyInvolvedPeopleList = void 0;
const id3v2_simplify_maps_1 = require("./id3v2.simplify.maps");
const id3v2_frame_version_1 = require("./frames/id3v2.frame.version");
const id3v2_frame_match_1 = require("./frames/id3v2.frame.match");
function slugIDValue(id, value, mapping) {
    if (value && value.id) {
        return mapping[value.id] || mapping[value.id.toUpperCase()] || (id + '|' + value.id);
    }
    if (value) {
        return id;
    }
}
function simplifyInvolvedPeopleList(id, frame) {
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
        const val = knownSections[value.list[i]];
        if (val) {
            if (slug) {
                list.push({ slug, text: val });
            }
            else {
                list.push({ slug: id + '|' + value.list[i], text: val });
            }
        }
        i += 2;
    }
    return list;
}
exports.simplifyInvolvedPeopleList = simplifyInvolvedPeopleList;
function simplifyValue(id, slug, frame) {
    const frameDef = (0, id3v2_frame_match_1.matchFrame)(id);
    const text = frameDef.impl.simplify(frame.value);
    if (!text) {
        return;
    }
    if (id3v2_simplify_maps_1.SplitFrameMap[id]) {
        const names = id3v2_simplify_maps_1.SplitFrameMap[id];
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
function simplifyFrame(frame, dropIDsList) {
    const id = (0, id3v2_frame_version_1.ensureID3v2FrameVersionDef)(frame.id, 4) || frame.id;
    if (dropIDsList && dropIDsList.indexOf(frame.id) >= 0) {
        return;
    }
    let slug = id3v2_simplify_maps_1.FramesMap[id];
    if (id === 'UFID') {
        slug = slugIDValue(id, frame.value, id3v2_simplify_maps_1.UFIDMap);
    }
    else if (id === 'TXXX') {
        slug = slugIDValue(id, frame.value, id3v2_simplify_maps_1.TXXXMap);
    }
    else if (id === 'COMM') {
        slug = slugIDValue(id, frame.value, id3v2_simplify_maps_1.COMMMap);
    }
    else if (id === 'PRIV') {
        slug = slugIDValue(id, frame.value, id3v2_simplify_maps_1.PRIVMap);
    }
    else if (id === 'WXXX') {
        slug = slugIDValue(id, frame.value, {});
    }
    else if (id === 'LINK') {
        slug = slugIDValue(id, frame.value, {});
    }
    else if (id === 'TIPL' || id === 'TMCL') {
        return simplifyInvolvedPeopleList(id, frame);
    }
    if (slug) {
        return simplifyValue(id, slug, frame);
    }
}
exports.simplifyFrame = simplifyFrame;
function simplifyTag(tag, dropIDsList) {
    const result = {};
    const slugcounter = {};
    const frames = tag.frames.filter(f => !id3v2_simplify_maps_1.DateUpgradeMap[f.id]);
    const dateframes = tag.frames.filter(f => !!id3v2_simplify_maps_1.DateUpgradeMap[f.id]);
    const dateFrame = (0, id3v2_frame_version_1.upgrade23DateFramesTov24Date)(dateframes);
    if (dateFrame) {
        frames.push(dateFrame);
    }
    frames.forEach((frame) => {
        const simples = simplifyFrame(frame, dropIDsList);
        if (simples) {
            for (const simple of simples) {
                const count = (slugcounter[simple.slug] || 0) + 1;
                slugcounter[simple.slug] = count;
                const name = simple.slug + (count > 1 ? '|' + count : '');
                result[name] = simple.text;
            }
        }
    });
    return result;
}
exports.simplifyTag = simplifyTag;
//# sourceMappingURL=id3v2.simplify.js.map