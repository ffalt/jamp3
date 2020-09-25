"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3V2ValueTypes = void 0;
const ID3v2_ValuePicTypes = {
    '0': 'Other',
    '1': '32x32 pixels \'file icon\' (PNG only)',
    '2': 'Other file icon',
    '3': 'Cover (front)',
    '4': 'Cover (back)',
    '5': 'Leaflet page',
    '6': 'Media (e.g. lable side of CD)',
    '7': 'Lead artist/lead performer/soloist',
    '8': 'Artist/performer',
    '9': 'Conductor',
    '10': 'Band/Orchestra',
    '11': 'Composer',
    '12': 'Lyricist/text writer',
    '13': 'Recording Location',
    '14': 'During recording',
    '15': 'During performance',
    '16': 'Movie/video screen capture',
    '17': 'A bright coloured fish',
    '18': 'Illustration',
    '19': 'Band/artist logotype',
    '20': 'Publisher/Studio logotype'
};
const ID3v2_ValueRelativeVolumeAdjustment2ChannelTypes = {
    '0': 'Other',
    '1': 'Master volume',
    '2': 'Front right',
    '3': 'Front left',
    '4': 'Back right',
    '5': 'Back left',
    '6': 'Front centre',
    '7': 'Back centre',
    '8': 'Subwoofer'
};
exports.ID3V2ValueTypes = {
    pictureType: ID3v2_ValuePicTypes,
    relativeVolumeAdjustment2ChannelTypes: ID3v2_ValueRelativeVolumeAdjustment2ChannelTypes
};
//# sourceMappingURL=id3v2.consts.js.map