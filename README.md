# jamp3

An id3 & mp3 library written in Typescript for NodeJS

[![NPM](https://nodei.co/npm/jamp3.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jamp3/)

[![dependencies](https://img.shields.io/david/ffalt/jamp3.svg)](https://www.npmjs.com/package/jamp3) 
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9053f3b64ab847a39a1a4be470759bb7)](https://app.codacy.com/app/ffalt/jamp3?utm_source=github.com&utm_medium=referral&utm_content=ffalt/jamp3&utm_campaign=Badge_Grade_Dashboard)
[![CodeClimate Badge](https://api.codeclimate.com/v1/badges/c1bc863edffe1b4047e9/maintainability)](https://codeclimate.com/github/ffalt/jamp3/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/github/ffalt/jamp3/badge.svg)](https://snyk.io/test/github/ffalt/jamp3)
[![build status](https://travis-ci.org/ffalt/jamp3.svg?branch=master)](https://travis-ci.org/ffalt/jamp3)
[![total downloads](https://badgen.net/npm/dt/jamp3)](https://badgen.net/npm/dt/xlsx-extract)
[![license](https://img.shields.io/github/license/ffalt/jamp3.svg)](http://opensource.org/licenses/MIT)

Motivation for this yet-another-id3-library: 

* On the fly & async & only as much as needed
  
  Only loads small parts of the file stream at a time. So that 100MB of e.g. podcast-episode.mp3 is not read completely in memory to get 100kb for an ID3v2 at the beginning of a file.

* Native Node

  No external dependecies

* Read MPEG frames information

  While reading the tag, you may want read the duration/bitrate/... of the audio stream.

* Write support

  ID3v2/ID3v1 can be removed or written.

  For ID3v2.4 an easy-to-use build helper is available. For more complex use, you can write other versions and even non-standard combinations of ID3v2 frames.
  
  There haven't been many reported issues, but be advised to make & keep backups of your audio files in case of bugs. 

* Return ID3v2 frames as raw as needed

  No mangling or combination into a simplified tag object (but there is a helper function to do just that).
  
* Deal with unknown/not implemented ID3v2 Frames

  Such frames are loaded as binary blobs and can be also written as such.

* Error tolerance over Specification

  Tested with many broken/invalid files https://github.com/ffalt/jamp3-testfiles

**Table of Contents**
-   [Installation](#installation)
-   [Usage as Library](#usage-as-library)
    -   [ID3v1](#id3v1)
    -   [ID3v2](#id3v2)
    -   [ID3v1, ID3v2, MPEG](#id3v1-id3v2-mpeg)
-   [Command Line Tools](#command-line-tools)
    -   [mp3-analyze](#mp3-analyze)
    -   [id3v2-dump](#id3v2-dump)
    -   [id3v1-dump](#id3v1-dump)
-   [Development Commands](#development-commands)
    -   [Build](#build)
    -   [Test](#test)
    -   [Coverage](#coverage)
    -   [Lint](#lint)

## Installation

into project:

```bash
npm i jamp3
```

or global:
```bash
npm -g i jamp3
```

## Usage as Library

[Class Documentation](https://ffalt.github.io/jamp3/)

### ID3v1

[Class Documentation](https://ffalt.github.io/jamp3/classes/id3v1.html)

#### reading ID3v1

```typescript
import {ID3v1} from 'jamp3';

async function run(): Promise<void> {
    const id3v1 = new ID3v1();
    const filename = 'demo.mp3';
    const tag = await id3v1.read(filename);
    console.log(tag);
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_id3v1-read.ts) [javascript](examples/snippet_id3v1-read.js) 

Example result:
```json
{
  "id": "ID3v1",
  "version": 1,
  "value": {
     "title": "Title",
     "artist": "Artist",
     "album": "Album",
     "year": "2003",
     "comment": "Comment",
     "track": 12,
     "genreIndex": 7
  }
}
```

#### writing ID3v1

```typescript
import {ID3v1, IID3V1} from 'jamp3';

async function run(): Promise<void> {
    const id3v1 = new ID3v1();
    const filename = 'demo.mp3';
    const newTag: IID3V1.ID3v1Tag = {
        title: 'A Title', // max length 30
        artist: 'B Artist', // max length 30
        album: 'C Artist', // max length 30
        year: '2019', // length 4
        comment: 'D Comment', // max length 28 (v1.1) / 30 (v1.0)
        track: 5, // only in v1.1
        genreIndex: 1
    };
    const options: IID3V1.WriteOptions = {
        keepBackup: true // keep a filename.mp3.bak copy of the original file
    };
    const version = 1;  // version: 1 = v1.1; 0 = v1.0
    await id3v1.write(filename, newTag, version, options);
    console.log('id3v1.1 written');
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_id3v1-write.ts) [javascript](examples/snippet_id3v1-write.js) 

### ID3v2

[Class Documentation](https://ffalt.github.io/jamp3/classes/id3v2.html)

#### reading ID3v2

```typescript
import {ID3v2} from 'jamp3';

async function run(): Promise<void> {
    const id3v2 = new ID3v2();
    const filename = 'demo.mp3';
    const tag = await id3v2.read(filename);
    console.log('id3v2:', tag);
    console.log(ID3v2.simplify(tag)); // combine frames into one simple tag object
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_id3v2-read.ts) [javascript](examples/snippet_id3v2-read.js) 

Example result:
```json
{
  "id": "ID3v2",
  "start": 0,
  "end": 4096,
  "head": {"ver":3,"rev":0,"size":4086,"flagBits":[0,0,0,0,0,0,0,0],"valid":true,"v3":{"flags":{"unsynchronisation":false,"extendedheader":false,"experimental":false}}},
  "frames": [
    {
      "head": {"encoding":"ucs2","size":35},
      "id": "TALB",
      "title": "Album",
      "value": {
        "text": "Pieces of Africa"
      }
    },
    {
      "head": {"encoding":"ucs2","size":19},
      "id": "TPE1",
      "title": "Artist",
      "value": {
        "text": "Obo Addy"
      }
    },
    {
      "head": {"encoding":"ucs2","size":31},
      "id": "TPE2",
      "title": "Band",
      "value": {
        "text": "Kronos Quartet"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":5},
      "id": "TDAT",
      "title": "Date",
      "value": {
        "text": "1402"
      }
    },
    {
      "head": {"encoding":"ucs2","size":13},
      "id": "TCON",
      "title": "Genre",
      "value": {
        "text": "Other"
      }
    },
    {
      "head": {"encoding":"ucs2","size":53},
      "id": "IPLS",
      "title": "Involved people list",
      "value": {
        "list": [
          "orchestra",
          "Kronos Quartet"
        ]
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":3},
      "id": "TCMP",
      "title": "iTunes Compilation Flag",
      "value": {
        "bool": true
      }
    },
    {
      "head": {"encoding":"ucs2","size":19},
      "id": "TPUB",
      "title": "Publisher",
      "value": {
        "text": "Nonesuch"
      }
    },
    {
      "head": {"encoding":"ucs2","size":59},
      "id": "TIT2",
      "title": "Title",
      "value": {
        "text": "Wawshishijay (Our Beginning)"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":5},
      "id": "TRCK",
      "title": "Track number",
      "value": {
        "text": "6/12"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":59},
      "id": "UFID",
      "title": "Unique file identifier",
      "value": {
        "id": "http://musicbrainz.org",
        "text": "aed13cc6-89af-4b86-a62f-b3b193e930f6"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":5},
      "id": "TYER",
      "title": "Year",
      "value": {
        "text": "1992"
      }
    },
    {
      "head": {"encoding":"ucs2","size":65},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "ALBUMARTISTSORT",
        "text": "Kronos Quartet"
      }
    },
    {
      "head": {"encoding":"ucs2","size":35},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "ASIN",
        "text": "B000005J15"
      }
    },
    {
      "head": {"encoding":"ucs2","size":47},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "CATALOGNUMBER",
        "text": "79275-2"
      }
    },
    {
      "head": {"encoding":"ucs2","size":133},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Album Artist Id",
        "text": "f5586dfa-7031-4af0-8042-19b6a1170389"
      }
    },
    {
      "head": {"encoding":"ucs2","size":119},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Album Id",
        "text": "680c65e1-f3a1-48ee-997a-4b2a92f59650"
      }
    },
    {
      "head": {"encoding":"ucs2","size":77},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Album Release Country",
        "text": "US"
      }
    },
    {
      "head": {"encoding":"ucs2","size":71},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Album Status",
        "text": "official"
      }
    },
    {
      "head": {"encoding":"ucs2","size":61},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Album Type",
        "text": "album"
      }
    },
    {
      "head": {"encoding":"ucs2","size":121},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicBrainz Artist Id",
        "text": "bd297b96-57d1-434a-80d6-f07f1c6df0c4"
      }
    },
    {
      "head": {"encoding":"ucs2","size":103},
      "id": "TXXX",
      "title": "User defined text",
      "value": {
        "id": "MusicIP PUID",
        "text": "56376896-f6c3-344d-f9da-b1fc397521e2"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":5},
      "id": "TIME",
      "title": "Time",
      "value": {
        "text": "1346"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":14},
      "id": "PRIV",
      "title": "Private frame",
      "value": {
        "id": "PeakValue",
        "bin": {"type":"Buffer","data":[20,93,0,0]}
      }
    },
    {
      "head": {"encoding":"ucs2","size":21},
      "id": "XSOP",
      "title": "Performer sort order",
      "value": {
        "text": "Addy, Obo"
      }
    },
    {
      "head": {"encoding":"iso-8859-1","size":17},
      "id": "PRIV",
      "title": "Private frame",
      "value": {
        "id": "AverageLevel",
        "bin": {"type":"Buffer","data":[38,10,0,0]}
      }
    }
  ]
}
```

Example result simplified:
```json
{
    "ALBUM": "Pieces of Africa",
    "ARTIST": "Obo Addy",
    "ALBUMARTIST": "Kronos Quartet",
    "GENRE": "Other",
    "COMPILATION": "true",
    "LABEL": "Nonesuch",
    "TITLE": "Wawshishijay (Our Beginning)",
    "TRACKNUMBER": "6",
    "TRACKTOTAL": "12",
    "MUSICBRAINZ_TRACKID": "aed13cc6-89af-4b86-a62f-b3b193e930f6",
    "ALBUMARTISTSORT": "Kronos Quartet",
    "ASIN": "B000005J15",
    "CATALOGNUMBER": "79275-2",
    "MUSICBRAINZ_ALBUMARTISTID": "f5586dfa-7031-4af0-8042-19b6a1170389",
    "MUSICBRAINZ_ALBUMID": "680c65e1-f3a1-48ee-997a-4b2a92f59650",
    "RELEASECOUNTRY": "US",
    "RELEASESTATUS": "official",
    "RELEASETYPE": "album",
    "MUSICBRAINZ_ARTISTID": "bd297b96-57d1-434a-80d6-f07f1c6df0c4",
    "MUSICIP_PUID": "56376896-f6c3-344d-f9da-b1fc397521e2",
    "PRIV|PeakValue": "<bin 4bytes>",
    "ARTISTSORT": "Addy, Obo",
    "PRIV|AverageLevel": "<bin 4bytes>",
    "DATE": "1992-1402-1346"
}
```

#### writing ID3v2 with Helper
[Class Documentation](https://ffalt.github.io/jamp3/classes/id3v24tagbuilder.html)

```typescript
import {ID3v2, ID3V24TagBuilder, IID3V2} from 'jamp3';

async function run(): Promise<void> {
    const id3v2 = new ID3v2();
    const filename = 'demo.mp3';

    const builder = new ID3V24TagBuilder(ID3V24TagBuilder.encodings.utf8);
    builder
        .album('An album')
        .artist('An artist')
        .artistSort('artist, An')
        .title('A title');

    const options: IID3V2.WriteOptions = {
        keepBackup: true, // keep a filename.mp3.bak copy of the original file
        paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
    };
    await id3v2.writeBuilder(filename, builder, options);
    console.log('id3v2.4 written');
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_id3v2-build.ts) [javascript](examples/snippet_id3v2-build.js) 

#### writing ID3v2 Raw

```typescript
import {ID3v2, IID3V2} from 'jamp3';

async function run(): Promise<void> {
    const id3v2 = new ID3v2();
    const filename = 'demo.mp3';
    const tag: IID3V2.ID3v2Tag = {
        frames: [
            {
                id: 'TIT2',
                value: {text: 'A title'},
                head: {
                    encoding: 'utf8'
                }
            },
            {
                id: 'TALB',
                value: {text: 'An album'},
                head: {
                    encoding: 'ucs2'
                }
            }
        ]
    };
    const options: IID3V2.WriteOptions = {
        defaultEncoding: 'utf8', // encoding used if not specified in frame header
        keepBackup: true, // keep a filename.mp3.bak copy of the original file
        paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
    };
    const version = 4;  // version: 2 = v2.2; 3 = v2.3; 4 = v2.4
    await id3v2.write(filename, tag, version, 0, options);
    console.log('id3v2.4 written');
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_id3v2-write.ts) [javascript](examples/snippet_id3v2-write.js) 

### ID3v1, ID3v2, MPEG

[Class Documentation](https://ffalt.github.io/jamp3/classes/mp3.html)

#### reading MP3

```typescript
import {IMP3, MP3} from 'jamp3';

async function run(): Promise<void> {
    const mp3 = new MP3();
    const filename = 'demo.mp3';
    const options: IMP3.ReadOptions = {
        mpeg: true, // read mpeg information
        mpegQuick: true, // estimate mpeg information based on mpeg header (XING|Info) and stop reading if tags and header are found
        id3v2: true, // read ID3 v2 tag
        id3v1: false,  // read ID3 v1 tag
        id3v1IfNotID3v2: true,  // read ID3 v1 tag only if no ID3 v2 tag is found (stops reading otherwise)
        raw: false // do not parse frames & return all frames as binary blobs
    };
    const data = await mp3.read(filename, options);
    console.log('mp3:', data);
}

run().catch(e => {
    console.error(e);
});
```
Example as [typescript](examples/snippet_mp3-read.ts) [javascript](examples/snippet_mp3-read.js) 

Note: MP3 Duration

if the mp3 does include a VBR/CBR header, the declared header values are used for duration calculation

if the mp3 does NOT include a VBR/CBR header: 
  - with option {mpegQuick: true}: only a few audio frames are read and the duration is estimated 
  - with option {mpegQuick: false}: all audio frames are read and the duration is calculated 

Example result:
```json
{
  "size": 4096,
  "mpeg": {
    "durationEstimate": 1.044875, 
    "durationRead": 0,
    "channels": 2,
    "frameCount": 0,
    "frameCountDeclared": 0,
    "bitRate": 128000,
    "sampleRate": 44100,
    "sampleCount": 1152,
    "audioBytes": 0,
    "audioBytesDeclared": 0,
    "version": "1 (ISO/IEC 11172-3)",
    "layer": "MPEG audio layer 3",
    "encoded": "CBR",
    "mode": "joint"
  },
  "id3v1": { 
      "…": "see documentation above"  
  },
  "id3v2": {
      "…": "see documentation above"  
  }
}
```

## Command Line Tools

If you install this package global 'npm install -g' following tools are available in your command line.
If you install into your project the following tools are available in '{your project}/node_modules/.bin/'

### mp3-analyze

```bash
> mp3-analyze -h
Usage: mp3-analyze [options] <fileOrDir>

Options:

  -v, --version            output the version number
  -i, --input <fileOrDir>  mp3 file or folder
  -r, --recursive          scan the folder recursive
  -w, --warnings           show results only for files with warnings
  -f, --format <format>    format of analyze result (plain|json) (default: plain)
  -d, --dest <file>        destination analyze result file
  -h, --help               output usage information

> mp3-analyze SampleVBR.mp3
SampleVBR.mp3
1212 Frames, Duration 31.66ms, VBR 58930, MPEG 1 (ISO/IEC 11172-3) MPEG audio layer 3, Channels 2 (joint), Xing

> mp3-analyze -f json lame_cbr.mp3
{
  "filename": "lame_cbr.mp3",
  "mode": "CBR",
  "bitRate": 64000,
  "channelMode": "single",
  "channels": 1,
  "durationMS": 496,
  "format": "MPEG 1 (ISO/IEC 11172-3) MPEG audio layer 3",
  "header": "Info",
  "frames": 19,
  "id3v1": false,
  "id3v2": true,
  "msgs": [
    {
      "msg": "XING: Wrong number of frames declared in Info Header",
      "expected": 72243,
      "actual": 19
    },
    {
      "msg": "XING: Wrong number of data bytes declared in Info Header",
      "expected": 15097520,
      "actual": 3969
    }
  ]
}
```

### id3v2-dump

```bash
> id3v2-dump -h
Usage: id3v2-dump [options]

Options:

  -v, --version            output the version number
  -i, --input <fileOrDir>  mp3 file or folder
  -r, --recursive          dump the folder recursive
  -f, --full               full tag output (simple otherwise)
  -d, --dest <file>        destination analyze result file
  -h, --help               output usage information

> id3v2-dump Helium02.mp3
{
  "filename": "Helium02.mp3",
  "tag": {
    "COMM|MusicMatch_Bio": "A consummate musical chameleon, David Bowie created a career in the Sixties and Seventies that featured his many guises: folksinger, androgyne, alien, decadent, blue-eyed soul man, modern rock star-each one spawning a league of imitators. His late-Seventies collaborations with Brian Eno made Bowie one of the few older stars to be taken seriously by the new wave. In the Eighties, Let's Dance (#1, 1983), his entree into the mainstream, was followed by attempts to keep up with current trends.\r\n\r\nDavid Jones took up the saxophone at age 13, and when he left Bromley Technical High School (where a friend permanently paralyzed Jones' left pupil in a fight) to work as a commercial artist three years later, he had started playing in bands (the Konrads, the King Bees, David Jones and the Buzz). Three of Jones' early bands -- the King Bees, the Manish Boys (featuring session guitarist Jimmy Page), and Davey Jones and the Lower Third -- each recorded a single. \r\n\r\nIn 1966, after changing his name to David Bowie (after the knife) to avoid confusion with the Monkees' Davy Jones, he recorded three singles for Pye Records, then signed in 1967 with Deram, issuing several singles and The World of David Bowie (most of the songs from that album, and others from that time, are collected on Images).\r\n\r\nOn these early records, Bowie appears in the singer/songwriter mold; rock star seemed to be just another role for him. In 1967 he spent a few weeks at a Buddhist monastery in Scotland, then apprenticed in Lindsay Kemp's mime troupe. He started his own troupe, Feathers, in 1968. American-born Angela Barnett met Bowie in London's Speakeasy and married him on March 20, 1970. \r\n\r\nSon Zowie (now Joey) was born in June 1971; the couple divorced acrimoniously in 1980. After Feathers broke up, Bowie helped start the experimental Beckenham Arts Lab in 1969. To finance the project, he signed with Mercury. Man of Words, Man of Music included \"Space Oddity,\" its release timed for the U.S. moon landing. It became a European hit that year but did not make the U.S. charts until its rerelease in 1973, when it reached #15.\r\n\r\nMarc Bolan, an old friend, was beginning his rise as a glitter-rocker in T. Rex and introduced Bowie to his producer, Tony Visconti. Bowie mimed at some T. Rex concerts, and Bolan played guitar on Bowie's \"Karma Man\" and \"The Prettiest Star.\" Bowie, Visconti, guitarist Mick Ronson, and drummer John Cambridge toured briefly as Hype. \r\n\r\nRonson eventually recruited drummer Michael \"Woody\" Woodmansey, and with Visconti on bass they recorded The Man Who Sold the World, which included \"All the Madmen,\" inspired by Bowie's institutionalized brother, Terry. Hunky Dory (#93, 1972), Bowie's tribute to the New York City of Andy Warhol, the Velvet Underground, and Bob Dylan, included his ostensible theme song, \"Changes\" (#66, 1972, rereleased 1974, #41).\r\n\r\nBowie started changing his image in late 1971. He told Melody Maker he was gay in January 1972 and started work on a new, theatrical production. Enter Ziggy Stardust, Bowie's projection of a doomed messianic rock star. Bowie became Ziggy; Ronson, Woodmansey, and bassist Trevor Bolder became Ziggy's band, the Spiders from Mars. \r\n\r\nThe Rise and Fall of Ziggy Stardust and the Spiders from Mars (#75, 1972) and the rerelease of Man of Words as Space Oddity (#16, 1972) made Bowie the star he was portraying. The live show, with Bowie wearing futuristic costumes, makeup, and bright orange hair (at a time when the rock-star uniform was jeans), was a sensation in London and New York. It took Aladdin Sane (#17, 1973) to break Bowie in the U.S. Bolan and other British glitter-rock performers barely made the Atlantic crossing, but Bowie emerged a star. He produced albums for Lou Reed (Transformer and its hit \"Walk on the Wild Side\") and Iggy and the Stooges (Raw Power) and wrote and produced Mott the Hoople's glitter anthem \"All the Young Dudes.\"\r\n\r\nIn 1973 Bowie announced his retirement from live performing, disbanded the Spiders, and sailed to Paris to record Pin Ups (#23, 1973), a collection of covers of mid-Sixties British rock. That same year, the 1980 Floor Show, an invitation-only concert with Bowie and guests Marianne Faithfull and the Troggs, was taped for broadcast on the TV program The Midnight Special.\r\n\r\nMeanwhile, Bowie worked on a musical adaptation of George Orwell's 1984, but was denied the rights by Orwell's widow. He rewrote the material as Diamond Dogs (#5, 1974) and returned to the stage with an extravagant American tour. Midway though the tour, Bowie entered Philadelphia's Sigma Sound Studios (the then-current capital of black music) and recorded the tracks that would become Young Americans (#9, 1975). The session had a major effect on Bowie, as his sound and show were revised. \r\n\r\nBowie scrapped the dancers, sets, and costumes for a spare stage and baggy Oxford trousers; he cut his hair and colored it a more natural blond. His new band, led by former James Brown sideman Carlos Alomar, added soul standards (e.g., Eddie Floyd's \"Knock on Wood\") to his repertoire. David Live (#8, 1974), also recorded in Philadelphia, chronicles this incarnation.\r\n\r\n\"Fame,\" cowritten by Bowie, John Lennon, and Alomar, was Bowie's first American #1 (1975). Bowie moved to Los Angeles and became a fixture of American pop culture. He also played the title role in Nicolas Roeg's The Man Who Fell to Earth (1976). Station to Station (#3, 1976), another album of \"plastic soul\" recorded with the Young Americans band, portrayed Bowie as the Thin White Duke (also the title of his unpublished autobiography). His highest charting album, it contained his second Top Ten Single, \"Golden Years\" (#10, 1975). \r\n\r\nBowie complained life had become predictable and left Los Angeles. He returned to the U.K. for the first time in three years before settling in Berlin. He lived there in semi-seclusion, painting, studying art, and recording with Brian Eno. His work with Eno -- Low (#11, 1977), \"Heroes\" (#35, 1977), Lodger (#20, 1979) -- was distinguished by its appropriation of avant-garde electronic music and the \"cut-up\" technique made famous by William Burroughs. Composer Philip Glass wrote a symphony incorporating music from Low in 1993.\r\n\r\nBowie revitalized Iggy Pop's career by producing The Idiot and Lust for Life (both 1977) and toured Europe and America unannounced as Pop's pianist. He narrated Eugene Ormandy and the Philadelphia Orchestra's recording of Prokofiev's Peter and the Wolf and spent the rest of 1977 acting with Marlene Dietrich and Kim Novak in Just a Gigolo. The next year, he embarked on a massive world tour. A second live album, Stage (#44, 1978), was recorded on the U.S. leg of the tour. Work on Lodger was begun in New York, continued in Switzerland, and completed in Berlin.\r\n\r\nBowie settled in New York to record the paranoiac Scary Monsters (#12, 1980), updating \"Space Oddity\" in \"Ashes to Ashes.\" One of the first stars to understand the potential of video, he produced some innovative clips for songs from Lodger and Scary Monsters.\r\n\r\nAfter Scary Monsters, Bowie turned his attention away from his recording career. In 1980 he played the title role in The Elephant Man, appearing in Denver, in Chicago, and on Broadway. He collaborated with Queen in 1981's \"Under Pressure\" and provided lyrics and vocals for \"Cat People (Putting Out Fire)\" (#67, 1982), Giorgio Moroder's title tune for the soundtrack of Paul Schrader's remake of Cat People. His music was used on the soundtrack of Christiane F (1982) (he also appeared in the film). Also that year, Bowie starred in the BBC-TV production of Brecht's Baal, and as a 150-year-old vampire in the movie The Hunger.\r\n\r\nIn 1983 Bowie signed one of the most lucrative contracts in history, and moved from RCA to EMI. Let's Dance (#4, 1983), his first album in three years, returned him to the top of the charts. Produced by Nile Rodgers with Stevie Ray Vaughan on guitar, the album was a slick revision of Bowie's soul-man posture. It contained three Top Twenty singles -- \"Let's Dance\" (#1, 1983), \"China Girl\" (#10, 1983), and \"Modern Love\" (#14, 1983) -- which were supported with another set of innovative videos; the sold-out Serious Moonlight Tour followed. Bowie's career seemed to be revitalized.\r\n\r\nWhat first seemed like a return to form actually ushered in a period of mediocrity. Without Nile Rodgers' production savvy, Bowie's material sounded increasingly forced and hollow; his attention alternated between albums and film roles. Tonight (#11, 1984) had only one hit, \"Blue Jean\" (#8, 1984). Bowie and Mick Jagger dueted on a cover of Martha and the Vandellas' \"Dancing in the Street\" (#7, 1985) for Live Aid. Although Never Let Me Down (#34, 1987), with Peter Frampton on guitar, was roundly criticized, it made the charts with \"Day In, Day Out\" (#21, 1987) and the title song (#27, 1987). Bowie hit the road with another stadium extravaganza, the Glass Spiders tour; it was recorded for an ABC-TV special.\r\n\r\nBowie had scarcely better luck in his acting career: Into the Night (1985), Absolute Beginners (1986) (a Julien Temple musical featuring some Bowie songs), Labyrinth (1986), The Linguini Incident (1992), and Twin Peaks -- Fire Walk with Me (1992) were neither critical nor commercial successes.\r\n\r\nBowie set about reissuing his earlier albums on CD. Sound + Vision (#97, 1989), a greatest-hits collection, revived interest in Bowie's career; the set list for the accompanying tour was partially based on fan response to special phone lines requesting favorite Bowie songs. Bowie claimed it would be the last time he performed those songs live. Later reissues, with previously unreleased bonus tracks, brought the Ziggy-era Bowie back onto the charts.\r\n\r\nBowie formed Tin Machine in 1989. The band included Bowie discovery Reeves Gabrels on guitar and Hunt and Tony Sales, who had worked with Bowie on Iggy Pop's Lust for Life album and tour in the Seventies. Although Bowie claimed that the band was a democracy, Tin Machine was perceived as Bowie's next project. The group debuted with a series of club dates in New York and Los Angeles. Their eponymous album (#28, 1989), a rougher, more guitar-oriented collection than Bowie's previous albums, received better reviews than Bowie's last few recordings. A second album, Tin Machine II (#126, 1991), lacked the novelty of the debut and was quickiy forgotten.\r\n\r\nIn 1992 Bowie married Somalian supermodel Iman. Black Tie White Noise (#39, 1993), which Bowie called his wedding present to his wife, received generally positive reviews, but failed to excite the public.\r\n\r\nBorn David Robert Jones, January 8, 1947, London, England \r\n\r\n\r\n1967 -- The World of David Bowie (Deram, U.K.) \r\n1970 -- Man of Words, Man of Music (Mercury); The Man Who Sold the World \r\n1971 -- Hunky Dory (RCA) \r\n1972 -- The Rise and Fall of Ziggy Stardust and the Spiders from Mars \r\n1973 -- Aladdin Sane; Pin Ups; Images 1966-67 (London) \r\n1974 -- Diamond Dogs (RCA); David Live \r\n1975 -- Young Americans \r\n1976 -- Station to Station; ChangesOneBowie \r\n1977 -- Low; \"Heroes\" \r\n1978 -- Stage \r\n1979 -- Lodger \r\n1980 -- Scary Monsters \r\n1981 -- ChangesTwoBowie; Christiane F soundtrack \r\n1982 -- Cat People soundtrack; Baal \r\n1983 -- Let's Dance (EMI); Golden Years (RCA); Ziggy Stardust/The Motion Picture \r\n1984 -- Fame and Fashion; Tonight (EMI) \r\n1987 -- Never Let Me Down \r\n1989 -- Sound + Vision (Rykodisc) \r\n1990 -- ChangesBowie \r\n1993 -- Black Tie White Noise (Savage) \r\n1994 -- Sound + Vision with CD-ROM (Rykodisc) Tin Machine: (Formed 1989, Switzerland: Bowie; Reeves Gabrels [b. June 4, 1956, Staten Island, N.Y.], gtr.; Hunt Sales [b. Mar. 2, 1954, Detroit, Mich.], drums; Tony Sales [b. Sep. 26, 1951, Cleveland, Ohio], bass) \r\n1989 -- Tin Machine (EMI) \r\n1991 -- Tin Machine II (Victory) </TD></TR>\n\n<TR VALIGN=top><TD width=429 WIDTH=\"405\">",
    "PRIV|HeliumID": "<bin 7bytes>",
    "ALBUM": "Space Oddity",
    "GENRE": "Rock, Art",
    "COPYRIGHT": "Virgin / EMI",
    "ENCODINGTIME": "2002-01-10T21:21:05",
    "DATE": "1969-04-05",
    "RELEASETIME": "1969-04-05",
    "TITLE": "Space Oddity",
    "LANGUAGE": "English",
    "MEDIA": "CD",
    "ORIGINALFILENAME": "01 - Space Oddity.mp3",
    "FILEOWNER": "LunaC",
    "ARTIST": "David Bowie",
    "ALBUMSORT": "Space Oddity",
    "ARTISTSORT": "Bowie, David",
    "TITLESORT": "Space Oddity",
    "DISCSUBTITLE": "+ Bonus Tracks",
    "LYRICS": "Ground Control to Major Tom\r\nGround Control to Major Tom\r\nTake your protein pills and put your helmet on\r\n\r\nGround Control to Major Tom\r\nCommencing countdown, engines on\r\nCheck ignition and may God's love be with you\r\n\r\n(spoken)\r\nTen, Nine, Eight, Seven, Six, Five, Four, Three, Two, One, Liftoff\r\n\r\nThis is Ground Control to Major Tom\r\nYou've really made the grade\r\nAnd the papers want to know whose shirts you wear\r\nNow it's time to leave the capsule if you dare\r\n\r\n    \"This is Major Tom to Ground Control\r\n     I'm stepping through the door\r\n     And I'm floating in a most peculiar way\r\n     And the stars look very different today\r\n\r\n     For here\r\n     Am I sitting in a tin can\r\n     Far above the world\r\n     Planet Earth is blue\r\n     And there's nothing I can do\r\n\r\n     Though I'm past one hundred thousand miles\r\n     I'm feeling very still\r\n     And I think my spaceship knows which way to go\r\n     Tell my wife I love her very much she knows\"\r\n\r\nGround Control to Major Tom\r\nYour circuit's dead, there's something wrong\r\nCan you hear me, Major Tom?\r\nCan you hear me, Major Tom?\r\nCan you hear me, Major Tom?\r\nCan you....\r\n\r\n    \"Here am I floating round my tin can\r\n     Far above the Moon\r\n     Planet Earth is blue\r\n     And there's nothing I can do.\"\r\n\r\nTrivia\r\nSpace Oddity ranks as one of the best known Bowie songs, alongside Changes, Let's Dance and Fame. Supposedly inspired by the plight of the Apollo 8 astronauts, Bowie later returned to Major Tom in his 1980 hit, Ashes to Ashes from the album Scary Monsters. \r\nThe Space Oddity music was later used by Bowie in an Italian version, Ragazza Sola, Ragazzo Solo, which appears on the album Rare. ",
    "TAGGINGTIME": "2002-04-04T21:21:05",
    "PICTURE": "<pic Cover (back);image/jpg;18686bytes>",
    "PICTURE|2": "<pic Artist/performer;image/jpg;11389bytes>",
    "PICTURE|3": "<pic Cover (front);image/jpg;79549bytes>",
    "PICTURE|4": "<pic Cover (front);image/jpg;71669bytes>",
    "PICTURE|5": "<pic Cover (front);image/jpg;38784bytes>"
  }
}
> id3v2-dump -f Helium02.mp3

{
 "filename": "Helium02.mp3",
 "tag": {
  "id": "ID3v2",
  "start": 0,
  "end": 236427,
  "head": {"ver":3,"rev":0,"size":236417,"valid":true,"flags":{"unsynchronisation":false,"extendedheader":false,"experimental":false}},
  "frames": [
   {
    "id": "COMM",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":11913},
    "value": {
     "id": "MusicMatch_Bio",
     "language": "ENG",
     "text": "A consummate musical chameleon, David Bowie created a career in the Sixties and Seventies that featured his many guises: folksinger, androgyne, alien, decadent, blue-eyed soul man, modern rock star-each one spawning a league of imitators. His late-Seventies collaborations with Brian Eno made Bowie one of the few older stars to be taken seriously by the new wave. In the Eighties, Let's Dance (#1, 1983), his entree into the mainstream, was followed by attempts to keep up with current trends.\r\n\r\nDavid Jones took up the saxophone at age 13, and when he left Bromley Technical High School (where a friend permanently paralyzed Jones' left pupil in a fight) to work as a commercial artist three years later, he had started playing in bands (the Konrads, the King Bees, David Jones and the Buzz). Three of Jones' early bands -- the King Bees, the Manish Boys (featuring session guitarist Jimmy Page), and Davey Jones and the Lower Third -- each recorded a single. \r\n\r\nIn 1966, after changing his name to David Bowie (after the knife) to avoid confusion with the Monkees' Davy Jones, he recorded three singles for Pye Records, then signed in 1967 with Deram, issuing several singles and The World of David Bowie (most of the songs from that album, and others from that time, are collected on Images).\r\n\r\nOn these early records, Bowie appears in the singer/songwriter mold; rock star seemed to be just another role for him. In 1967 he spent a few weeks at a Buddhist monastery in Scotland, then apprenticed in Lindsay Kemp's mime troupe. He started his own troupe, Feathers, in 1968. American-born Angela Barnett met Bowie in London's Speakeasy and married him on March 20, 1970. \r\n\r\nSon Zowie (now Joey) was born in June 1971; the couple divorced acrimoniously in 1980. After Feathers broke up, Bowie helped start the experimental Beckenham Arts Lab in 1969. To finance the project, he signed with Mercury. Man of Words, Man of Music included \"Space Oddity,\" its release timed for the U.S. moon landing. It became a European hit that year but did not make the U.S. charts until its rerelease in 1973, when it reached #15.\r\n\r\nMarc Bolan, an old friend, was beginning his rise as a glitter-rocker in T. Rex and introduced Bowie to his producer, Tony Visconti. Bowie mimed at some T. Rex concerts, and Bolan played guitar on Bowie's \"Karma Man\" and \"The Prettiest Star.\" Bowie, Visconti, guitarist Mick Ronson, and drummer John Cambridge toured briefly as Hype. \r\n\r\nRonson eventually recruited drummer Michael \"Woody\" Woodmansey, and with Visconti on bass they recorded The Man Who Sold the World, which included \"All the Madmen,\" inspired by Bowie's institutionalized brother, Terry. Hunky Dory (#93, 1972), Bowie's tribute to the New York City of Andy Warhol, the Velvet Underground, and Bob Dylan, included his ostensible theme song, \"Changes\" (#66, 1972, rereleased 1974, #41).\r\n\r\nBowie started changing his image in late 1971. He told Melody Maker he was gay in January 1972 and started work on a new, theatrical production. Enter Ziggy Stardust, Bowie's projection of a doomed messianic rock star. Bowie became Ziggy; Ronson, Woodmansey, and bassist Trevor Bolder became Ziggy's band, the Spiders from Mars. \r\n\r\nThe Rise and Fall of Ziggy Stardust and the Spiders from Mars (#75, 1972) and the rerelease of Man of Words as Space Oddity (#16, 1972) made Bowie the star he was portraying. The live show, with Bowie wearing futuristic costumes, makeup, and bright orange hair (at a time when the rock-star uniform was jeans), was a sensation in London and New York. It took Aladdin Sane (#17, 1973) to break Bowie in the U.S. Bolan and other British glitter-rock performers barely made the Atlantic crossing, but Bowie emerged a star. He produced albums for Lou Reed (Transformer and its hit \"Walk on the Wild Side\") and Iggy and the Stooges (Raw Power) and wrote and produced Mott the Hoople's glitter anthem \"All the Young Dudes.\"\r\n\r\nIn 1973 Bowie announced his retirement from live performing, disbanded the Spiders, and sailed to Paris to record Pin Ups (#23, 1973), a collection of covers of mid-Sixties British rock. That same year, the 1980 Floor Show, an invitation-only concert with Bowie and guests Marianne Faithfull and the Troggs, was taped for broadcast on the TV program The Midnight Special.\r\n\r\nMeanwhile, Bowie worked on a musical adaptation of George Orwell's 1984, but was denied the rights by Orwell's widow. He rewrote the material as Diamond Dogs (#5, 1974) and returned to the stage with an extravagant American tour. Midway though the tour, Bowie entered Philadelphia's Sigma Sound Studios (the then-current capital of black music) and recorded the tracks that would become Young Americans (#9, 1975). The session had a major effect on Bowie, as his sound and show were revised. \r\n\r\nBowie scrapped the dancers, sets, and costumes for a spare stage and baggy Oxford trousers; he cut his hair and colored it a more natural blond. His new band, led by former James Brown sideman Carlos Alomar, added soul standards (e.g., Eddie Floyd's \"Knock on Wood\") to his repertoire. David Live (#8, 1974), also recorded in Philadelphia, chronicles this incarnation.\r\n\r\n\"Fame,\" cowritten by Bowie, John Lennon, and Alomar, was Bowie's first American #1 (1975). Bowie moved to Los Angeles and became a fixture of American pop culture. He also played the title role in Nicolas Roeg's The Man Who Fell to Earth (1976). Station to Station (#3, 1976), another album of \"plastic soul\" recorded with the Young Americans band, portrayed Bowie as the Thin White Duke (also the title of his unpublished autobiography). His highest charting album, it contained his second Top Ten Single, \"Golden Years\" (#10, 1975). \r\n\r\nBowie complained life had become predictable and left Los Angeles. He returned to the U.K. for the first time in three years before settling in Berlin. He lived there in semi-seclusion, painting, studying art, and recording with Brian Eno. His work with Eno -- Low (#11, 1977), \"Heroes\" (#35, 1977), Lodger (#20, 1979) -- was distinguished by its appropriation of avant-garde electronic music and the \"cut-up\" technique made famous by William Burroughs. Composer Philip Glass wrote a symphony incorporating music from Low in 1993.\r\n\r\nBowie revitalized Iggy Pop's career by producing The Idiot and Lust for Life (both 1977) and toured Europe and America unannounced as Pop's pianist. He narrated Eugene Ormandy and the Philadelphia Orchestra's recording of Prokofiev's Peter and the Wolf and spent the rest of 1977 acting with Marlene Dietrich and Kim Novak in Just a Gigolo. The next year, he embarked on a massive world tour. A second live album, Stage (#44, 1978), was recorded on the U.S. leg of the tour. Work on Lodger was begun in New York, continued in Switzerland, and completed in Berlin.\r\n\r\nBowie settled in New York to record the paranoiac Scary Monsters (#12, 1980), updating \"Space Oddity\" in \"Ashes to Ashes.\" One of the first stars to understand the potential of video, he produced some innovative clips for songs from Lodger and Scary Monsters.\r\n\r\nAfter Scary Monsters, Bowie turned his attention away from his recording career. In 1980 he played the title role in The Elephant Man, appearing in Denver, in Chicago, and on Broadway. He collaborated with Queen in 1981's \"Under Pressure\" and provided lyrics and vocals for \"Cat People (Putting Out Fire)\" (#67, 1982), Giorgio Moroder's title tune for the soundtrack of Paul Schrader's remake of Cat People. His music was used on the soundtrack of Christiane F (1982) (he also appeared in the film). Also that year, Bowie starred in the BBC-TV production of Brecht's Baal, and as a 150-year-old vampire in the movie The Hunger.\r\n\r\nIn 1983 Bowie signed one of the most lucrative contracts in history, and moved from RCA to EMI. Let's Dance (#4, 1983), his first album in three years, returned him to the top of the charts. Produced by Nile Rodgers with Stevie Ray Vaughan on guitar, the album was a slick revision of Bowie's soul-man posture. It contained three Top Twenty singles -- \"Let's Dance\" (#1, 1983), \"China Girl\" (#10, 1983), and \"Modern Love\" (#14, 1983) -- which were supported with another set of innovative videos; the sold-out Serious Moonlight Tour followed. Bowie's career seemed to be revitalized.\r\n\r\nWhat first seemed like a return to form actually ushered in a period of mediocrity. Without Nile Rodgers' production savvy, Bowie's material sounded increasingly forced and hollow; his attention alternated between albums and film roles. Tonight (#11, 1984) had only one hit, \"Blue Jean\" (#8, 1984). Bowie and Mick Jagger dueted on a cover of Martha and the Vandellas' \"Dancing in the Street\" (#7, 1985) for Live Aid. Although Never Let Me Down (#34, 1987), with Peter Frampton on guitar, was roundly criticized, it made the charts with \"Day In, Day Out\" (#21, 1987) and the title song (#27, 1987). Bowie hit the road with another stadium extravaganza, the Glass Spiders tour; it was recorded for an ABC-TV special.\r\n\r\nBowie had scarcely better luck in his acting career: Into the Night (1985), Absolute Beginners (1986) (a Julien Temple musical featuring some Bowie songs), Labyrinth (1986), The Linguini Incident (1992), and Twin Peaks -- Fire Walk with Me (1992) were neither critical nor commercial successes.\r\n\r\nBowie set about reissuing his earlier albums on CD. Sound + Vision (#97, 1989), a greatest-hits collection, revived interest in Bowie's career; the set list for the accompanying tour was partially based on fan response to special phone lines requesting favorite Bowie songs. Bowie claimed it would be the last time he performed those songs live. Later reissues, with previously unreleased bonus tracks, brought the Ziggy-era Bowie back onto the charts.\r\n\r\nBowie formed Tin Machine in 1989. The band included Bowie discovery Reeves Gabrels on guitar and Hunt and Tony Sales, who had worked with Bowie on Iggy Pop's Lust for Life album and tour in the Seventies. Although Bowie claimed that the band was a democracy, Tin Machine was perceived as Bowie's next project. The group debuted with a series of club dates in New York and Los Angeles. Their eponymous album (#28, 1989), a rougher, more guitar-oriented collection than Bowie's previous albums, received better reviews than Bowie's last few recordings. A second album, Tin Machine II (#126, 1991), lacked the novelty of the debut and was quickiy forgotten.\r\n\r\nIn 1992 Bowie married Somalian supermodel Iman. Black Tie White Noise (#39, 1993), which Bowie called his wedding present to his wife, received generally positive reviews, but failed to excite the public.\r\n\r\nBorn David Robert Jones, January 8, 1947, London, England \r\n\r\n\r\n1967 -- The World of David Bowie (Deram, U.K.) \r\n1970 -- Man of Words, Man of Music (Mercury); The Man Who Sold the World \r\n1971 -- Hunky Dory (RCA) \r\n1972 -- The Rise and Fall of Ziggy Stardust and the Spiders from Mars \r\n1973 -- Aladdin Sane; Pin Ups; Images 1966-67 (London) \r\n1974 -- Diamond Dogs (RCA); David Live \r\n1975 -- Young Americans \r\n1976 -- Station to Station; ChangesOneBowie \r\n1977 -- Low; \"Heroes\" \r\n1978 -- Stage \r\n1979 -- Lodger \r\n1980 -- Scary Monsters \r\n1981 -- ChangesTwoBowie; Christiane F soundtrack \r\n1982 -- Cat People soundtrack; Baal \r\n1983 -- Let's Dance (EMI); Golden Years (RCA); Ziggy Stardust/The Motion Picture \r\n1984 -- Fame and Fashion; Tonight (EMI) \r\n1987 -- Never Let Me Down \r\n1989 -- Sound + Vision (Rykodisc) \r\n1990 -- ChangesBowie \r\n1993 -- Black Tie White Noise (Savage) \r\n1994 -- Sound + Vision with CD-ROM (Rykodisc) Tin Machine: (Formed 1989, Switzerland: Bowie; Reeves Gabrels [b. June 4, 1956, Staten Island, N.Y.], gtr.; Hunt Sales [b. Mar. 2, 1954, Detroit, Mich.], drums; Tony Sales [b. Sep. 26, 1951, Cleveland, Ohio], bass) \r\n1989 -- Tin Machine (EMI) \r\n1991 -- Tin Machine II (Victory) </TD></TR>\n\n<TR VALIGN=top><TD width=429 WIDTH=\"405\">"
    },
    "title": "Comments"
   },
   {
    "id": "PRIV",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":16},
    "value": {
     "id": "HeliumID",
     "bin": {"type":"Buffer","data":[72,101,108,105,117,109,178]}
    },
    "title": "Private frame"
   },
   {
    "id": "TALB",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Space Oddity"
    },
    "title": "Album"
   },
   {
    "id": "TCON",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":10},
    "value": {
     "text": "Rock, Art"
    },
    "title": "Genre"
   },
   {
    "id": "TCOP",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Virgin / EMI"
    },
    "title": "Copyright message"
   },
   {
    "id": "TDEN",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":20},
    "value": {
     "text": "2002-01-10T21:21:05"
    },
    "title": "Encoding Time"
   },
   {
    "id": "TDRC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":11},
    "value": {
     "text": "1969-04-05"
    },
    "title": "Recording time"
   },
   {
    "id": "TDRL",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":11},
    "value": {
     "text": "1969-04-05"
    },
    "title": "Release time"
   },
   {
    "id": "TIT2",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Space Oddity"
    },
    "title": "Title"
   },
   {
    "id": "TLAN",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":8},
    "value": {
     "text": "English"
    },
    "title": "Languages"
   },
   {
    "id": "TMED",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":3},
    "value": {
     "text": "CD"
    },
    "title": "Media type"
   },
   {
    "id": "TOFN",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":22},
    "value": {
     "text": "01 - Space Oddity.mp3"
    },
    "title": "Original filename"
   },
   {
    "id": "TOWN",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":6},
    "value": {
     "text": "LunaC"
    },
    "title": "File owner"
   },
   {
    "id": "TPE1",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":12},
    "value": {
     "text": "David Bowie"
    },
    "title": "Artist"
   },
   {
    "id": "TPOS",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":4},
    "value": {
     "text": "1/1"
    },
    "title": "Part of a set"
   },
   {
    "id": "TRCK",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":5},
    "value": {
     "text": "1/13"
    },
    "title": "Track number"
   },
   {
    "id": "TSOA",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Space Oddity"
    },
    "title": "Album sort order"
   },
   {
    "id": "TSOP",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Bowie, David"
    },
    "title": "Performer sort order"
   },
   {
    "id": "TSOT",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":13},
    "value": {
     "text": "Space Oddity"
    },
    "title": "Title sort order"
   },
   {
    "id": "TSST",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":15},
    "value": {
     "text": "+ Bonus Tracks"
    },
    "title": "Set subtitle"
   },
   {
    "id": "USLT",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":1686},
    "value": {
     "id": "Space Oddity",
     "language": "eng",
     "text": "Ground Control to Major Tom\r\nGround Control to Major Tom\r\nTake your protein pills and put your helmet on\r\n\r\nGround Control to Major Tom\r\nCommencing countdown, engines on\r\nCheck ignition and may God's love be with you\r\n\r\n(spoken)\r\nTen, Nine, Eight, Seven, Six, Five, Four, Three, Two, One, Liftoff\r\n\r\nThis is Ground Control to Major Tom\r\nYou've really made the grade\r\nAnd the papers want to know whose shirts you wear\r\nNow it's time to leave the capsule if you dare\r\n\r\n    \"This is Major Tom to Ground Control\r\n     I'm stepping through the door\r\n     And I'm floating in a most peculiar way\r\n     And the stars look very different today\r\n\r\n     For here\r\n     Am I sitting in a tin can\r\n     Far above the world\r\n     Planet Earth is blue\r\n     And there's nothing I can do\r\n\r\n     Though I'm past one hundred thousand miles\r\n     I'm feeling very still\r\n     And I think my spaceship knows which way to go\r\n     Tell my wife I love her very much she knows\"\r\n\r\nGround Control to Major Tom\r\nYour circuit's dead, there's something wrong\r\nCan you hear me, Major Tom?\r\nCan you hear me, Major Tom?\r\nCan you hear me, Major Tom?\r\nCan you....\r\n\r\n    \"Here am I floating round my tin can\r\n     Far above the Moon\r\n     Planet Earth is blue\r\n     And there's nothing I can do.\"\r\n\r\nTrivia\r\nSpace Oddity ranks as one of the best known Bowie songs, alongside Changes, Let's Dance and Fame. Supposedly inspired by the plight of the Apollo 8 astronauts, Bowie later returned to Major Tom in his 1980 hit, Ashes to Ashes from the album Scary Monsters. \r\nThe Space Oddity music was later used by Bowie in an Italian version, Ragazza Sola, Ragazzo Solo, which appears on the album Rare. "
    },
    "title": "Unsychronized lyric/text transcription"
   },
   {
    "id": "TDTG",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":20},
    "value": {
     "text": "2002-04-04T21:21:05"
    },
    "title": "Tagging time"
   },
   {
    "id": "APIC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":18725},
    "value": {
     "mimeType": "image/jpg",
     "pictureType": 4,
     "description": "David Bowie - Space Oddity",
     "bin": {"type":"Buffer","data":[255,216,...]}
    },
    "title": "Attached picture"
   },
   {
    "id": "APIC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":11413},
    "value": {
     "mimeType": "image/jpg",
     "pictureType": 8,
     "description": "David Bowie",
     "bin": {"type":"Buffer","data":[255,216,...]}
    },
    "title": "Attached picture"
   },
   {
    "id": "APIC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":79589},
    "value": {
     "mimeType": "image/jpg",
     "pictureType": 3,
     "description": "David Bowie - Space Oddity3",
     "bin": {"type":"Buffer","data":[255,216,...]}
    },
    "title": "Attached picture"
   },
   {
    "id": "APIC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":71708},
    "value": {
     "mimeType": "image/jpg",
     "pictureType": 3,
     "description": "David Bowie - Space Oddity",
     "bin": {"type":"Buffer","data":[255,216,...]}
    },
    "title": "Attached picture"
   },
   {
    "id": "APIC",
    "head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":38824},
    "value": {
     "mimeType": "image/jpg",
     "pictureType": 3,
     "description": "David Bowie - Space Oddity2",
     "bin": {"type":"Buffer","data":[255,216,...]}
    },
    "title": "Attached picture"
   }
  ]
 }
}
```

### id3v1-dump

```bash
> id3v1-dump -h
Usage: id3v1-dump [options]

Options:

  -v, --version            output the version number
  -i, --input <fileOrDir>  mp3 file or folder
  -r, --recursive          dump the folder recursive
  -d, --dest <file>        destination analyze result file
  -h, --help               output usage information

> id3v1-dump v1tag.mp3
{
  "filename": "v1tag.mp3",
  "tag": {
    "id": "ID3v1",
    "version": 1,
    "value": {
      "title": "TITLE1234567890123456789012345",
      "artist": "ARTIST123456789012345678901234",
      "album": "ALBUM1234567890123456789012345",
      "year": "2001",
      "comment": "COMMENT123456789012345678901",
      "track": 1,
      "genreIndex": 13
    }
  }
}

```

## Development Commands

### Build

`npm run build` to build the nodejs version into dist/

### Documentation

`npm run docs` to build class documentation into docs/

### Test

`npm run test` to run the the jest tests

### Coverage

`npm run coverage` to run the jest tests with code coverage stats

### Lint

`npm run lint` to test the code style with tslint
