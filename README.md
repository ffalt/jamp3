# jamp3

An id3 & mp3 library written in Typescript for NodeJS

[![NPM](https://nodei.co/npm/jamp3.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jamp3/)

[![dependencies](https://img.shields.io/david/ffalt/jamp3.svg)](https://www.npmjs.com/package/jamp3) 
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9053f3b64ab847a39a1a4be470759bb7)](https://app.codacy.com/app/ffalt/jamp3?utm_source=github.com&utm_medium=referral&utm_content=ffalt/jamp3&utm_campaign=Badge_Grade_Dashboard)
[![Known Vulnerabilities](https://snyk.io/test/github/ffalt/jamp3/badge.svg)](https://snyk.io/test/github/ffalt/jamp3)
[![build status](https://travis-ci.org/ffalt/jamp3.svg?branch=master)](https://travis-ci.org/ffalt/jamp3)
[![developer](https://img.shields.io/badge/developer-awesome-brightgreen.svg)](https://github.com/ffalt/jamp3)
[![license](https://img.shields.io/github/license/ffalt/jamp3.svg)](http://opensource.org/licenses/MIT)
[![Greenkeeper badge](https://badges.greenkeeper.io/ffalt/jamp3.svg)](https://greenkeeper.io/)

**Table of Contents**
- [Installation](#installation)
- [Usage as Library](#usage-as-library)
    - [ID3v1](#id3v1)
    - [ID3v2](#id3v2)
    - [ID3v1, ID3v2, MPEG](#id3v1-id3v2-mpeg)
- [Command Line Tools](#command-line-tools)
    - [mp3-analyse](#mp3-analyse)
    - [id3v2-dump](#id3v2-dump)
    - [id3v1-dump](#id3v1-dump)
- [Development Commands](#development-commands)
    - [Build](#build)
    - [Test](#test)
    - [Coverage](#coverage)
    - [Lint](#lint)

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
### ID3v1

Example usage:

```javascript
const ID3v1 = require('jamp3').ID3v1;
// or typescript: import {ID3v1} from 'jamp3';

const id3v1 = new ID3v1();

// with promises
function read(filename) {
    id3v1.read(filename)
        .then(tag => {
            console.log(tag);
        })
        .catch(e => {
            console.error(e);
        });
}

// or async/await
async function read(filename) {
	const tag = await id3v1.read(filename);
	console.log(tag);
}
```

### ID3v2

Note: ID3v2 write support is implemented. Since this means possibly screwing up files, you should be either brave and at least backup your data, or, wait until this library majured a bit and tag writing will be documented. 

Example usage:

```javascript
const ID3v2 = require('jamp3').ID3v2;
// or typescript: import {ID3v1} from 'jamp3';

const id3v2 = new ID3v2();

// with promises
function read(filename) {
    id3v2.read(filename)
        .then(tag => {
            console.log(tag);
        })
        .catch(e => {
            console.error(e);
        });
}

// or async/await
async function read(filename) {
	const tag = await id3v2.read(filename);
	console.log(tag);
}
```

Result Format:
```typescript
interface Result {
    size: number;
    mpeg?: MPEG;
    id3v2?: IID3V2.Tag;
    id3v1?: IID3V1.Tag;
    frames?: Array<IMP3.Frame>;
    raw?: IMP3.Layout;
}
```

Example result:
```json
{
	"size": 4096,
	"frames": [
		{
			"header": {
				"offset": 1099,
				"size": 417,
				"versionIdx": 3,
				"layerIdx": 1,
				"sampleIdx": 0,
				"bitrateIdx": 9,
				"modeIdx": 1,
				"modeExtIdx": 0,
				"emphasisIdx": 0,
				"padded": false,
				"protected": false,
				"copyright": false,
				"original": true,
				"privatebit": 0,
				"time": 26.122448979591837,
				"version": "1 (ISO/IEC 11172-3)",
				"layer": "MPEG audio layer 3",
				"channelMode": "stereo",
				"channelType": "joint",
				"channelCount": 2,
				"extension": {
					"intensity": 0,
					"ms": 0
				},
				"emphasis": "none",
				"samplingRate": 44100,
				"bitRate": 128000,
				"samples": 1152
			},
			"mode": "Xing",
			"xing": {
				"fields": {
					"frames": true,
					"bytes": true,
					"toc": true,
					"quality": true
				},
				"frames": 6,
				"bytes": 2869,
				"toc": {"type":"Buffer","data":[0,76,...,255]},
				"quality": 78
			}
		},
		{
			"header": {
				"offset": 1516,
				"size": 731,
				"versionIdx": 3,
				"layerIdx": 1,
				"sampleIdx": 0,
				"bitrateIdx": 12,
				"modeIdx": 1,
				"modeExtIdx": 0,
				"emphasisIdx": 0,
				"padded": false,
				"protected": false,
				"copyright": false,
				"original": true,
				"privatebit": 0,
				"time": 26.122448979591837,
				"version": "1 (ISO/IEC 11172-3)",
				"layer": "MPEG audio layer 3",
				"channelMode": "stereo",
				"channelType": "joint",
				"channelCount": 2,
				"extension": {
					"intensity": 0,
					"ms": 0
				},
				"emphasis": "none",
				"samplingRate": 44100,
				"bitRate": 224000,
				"samples": 1152
			}
		},
        ...
	],
	"mpeg": {
		"durationEstimate": 0.156,
		"durationRead": 0.208,
		"channels": 2,
		"frameCount": 8,
		"frameCountDeclared": 6,
		"bitRate": 116000,
		"sampleRate": 44100,
		"sampleCount": 1152,
		"audioBytes": 3026,
		"audioBytesDeclared": 2869,
		"version": "1 (ISO/IEC 11172-3)",
		"layer": "MPEG audio layer 3",
		"encoded": "VBR",
		"mode": "joint"
	},
	"id3v2": {
		"id": "ID3v2",
		"start": 0,
		"end": 1099,
		"head": {"ver":3,"rev":0,"size":1089,"valid":true,"flags":{"unsynchronisation":false,"extendedheader":false,"experimental":false}},
		"frames": [
			{
				"id": "TENC",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":true,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":32},
				"value": {
					"text": "ENCODER234567890123456789012345"
				},
				"title": "Encoded by"
			},
			{
				"id": "WXXX",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":33},
				"value": {
					"id": "",
					"text": "URL2345678901234567890123456789"
				},
				"title": "User defined URL link frame"
			},
			{
				"id": "TCOP",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":32},
				"value": {
					"text": "COPYRIGHT2345678901234567890123"
				},
				"title": "Copyright message"
			},
			{
				"id": "TOPE",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":32},
				"value": {
					"text": "ORIGARTIST234567890123456789012"
				},
				"title": "Original artist"
			},
			{
				"id": "TCOM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":32},
				"value": {
					"text": "COMPOSER23456789012345678901234"
				},
				"title": "Composer"
			},
			{
				"id": "COMM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":33},
				"value": {
					"id": "",
					"language": "",
					"text": "COMMENT123456789012345678901"
				},
				"title": "Comments"
			},
			{
				"id": "TPE1",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":31},
				"value": {
					"text": "ARTIST123456789012345678901234"
				},
				"title": "Artist"
			},
			{
				"id": "TALB",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":31},
				"value": {
					"text": "ALBUM1234567890123456789012345"
				},
				"title": "Album"
			},
			{
				"id": "COMM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":46},
				"value": {
					"id": "ID3v1 Comment",
					"language": "XXX",
					"text": "COMMENT123456789012345678901"
				},
				"title": "Comments"
			},
			{
				"id": "TRCK",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":2},
				"value": {
					"text": "1"
				},
				"title": "Track number"
			},
			{
				"id": "TYER",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":5},
				"value": {
					"text": "2001"
				},
				"title": "Year"
			},
			{
				"id": "TCON",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":8},
				"value": {
					"text": "(13)Pop"
				},
				"title": "Genre"
			},
			{
				"id": "TIT2",
				"head": {"encoding":"iso-8859-1","statusFlags":{"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"compressed":false,"encrypted":false,"grouping":false},"size":31},
				"value": {
					"text": "TITLE1234567890123456789012345"
				},
				"title": "Title"
			}
		]
	}
}
```

### ID3v1, ID3v2, MPEG

Example usage:

```javascript

const options = {
    filename: string;
    mpeg?: boolean; // read mpeg information 
    mpegQuick?: boolean; // estimate mpeg information based on mpeg header (XING|Info)
    id3v2?: boolean; // read ID3 v2 tag
    id3v1?: boolean;  // read ID3 v1 tag
    id3v1IfNotid3v2?: boolean;  // read ID3 v1 tag only if no ID3 v2 tag is found
    raw?: boolean; // do not parse frames & return binary blobs
} 

const MP3 = require('jamp3').MP3;
// or typescript: import {ID3v1} from 'jamp3';

const mp3 = new MP3();

// with promises
function read(options) {
    mp3.read(options)
        .then(result => {
            console.log(result);
        })
        .catch(e => {
            console.error(e);
        });
}
// or async/await
async function read(options) {
	const result = await mp3.read(options);
	console.log(result);
}
```

## Command Line Tools

If you install this package global 'npm install -g' following tools are available in your command line.
If you install into your project the following tools are available in '{your project}/node_modules/.bin/'

### mp3-analyse

```bash
> mp3-analyse -h
Usage: mp3-analyse [options] <fileOrDir>

Options:

  -v, --version            output the version number
  -i, --input <fileOrDir>  mp3 file or folder
  -r, --recursive          scan the folder recursive
  -w, --warnings           show results only for files with warnings
  -f, --format <format>    format of analyse result (plain|json) (default: plain)
  -d, --dest <file>        destination analyse result file
  -h, --help               output usage information

> mp3-analyse SampleVBR.mp3
SampleVBR.mp3
1212 Frames, Duration 31.66ms, VBR 58930, MPEG 1 (ISO/IEC 11172-3) MPEG audio layer 3, Channels 2 (joint), Xing

> mp3-analyse -f json lame_cbr.mp3
{
	"filename": "lame_cbr.mp3",
	"mode": "CBR",
	"bitRate": 64000,
	"channelMode": "single",
	"channels": 1,
	"durationMS": 0.496,
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
  -d, --dest <file>        destination analyse result file
  -h, --help               output usage information

> id3v2-dump v2.4.mp3
{
	"filename": "v2.4.mp3",
	"tag": {
		"album": "Album Name",
		"artist": "Artist Name",
		"bpm": "120",
		"genre": "Ambient",
		"popularimeter": "foo@foo.com;count=1234567890;rating=150",
		"popularimeter|2": "foo2@foo.com;count=7;rating=30",
		"tagging_time": "2009-03-16T18:22:28",
		"title": "Track Title",
		"track": 2,
		"unique_file_identifier": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
		"official_artist": "http://www.artist.com",
		"official_artist|2": "http://www.artist2.com",
		"commercial_information": "http://www.google.com",
		"T|User Frame": "User Data",
		"W|User URL": "http://www.google.com",
		"play_counter": "256"
	}
}
> id3v2-dump -f v2.4.mp3
{
	"filename": "v2.4.mp3",
	"tag": {
		"id": "ID3v2",
		"start": 0,
		"end": 1167,
		"head": {"ver":4,"rev":0,"size":1157,"valid":true,"flags":{"unsynchronisation":false,"extendedheader":false,"experimental":false,"footer":false}},
		"frames": [
			{
				"id": "TALB",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":11},
				"value": {
					"text": "Album Name"
				},
				"title": "Album"
			},
			{
				"id": "TPE1",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":12},
				"value": {
					"text": "Artist Name"
				},
				"title": "Artist"
			},
			{
				"id": "TBPM",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":4},
				"value": {
					"text": "120"
				},
				"title": "BPM"
			},
			{
				"id": "TCON",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":8},
				"value": {
					"text": "Ambient"
				},
				"title": "Genre"
			},
			{
				"id": "POPM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":17},
				"value": {
					"count": 1234567890,
					"rating": 150,
					"email": "foo@foo.com"
				},
				"title": "Popularimeter"
			},
			{
				"id": "POPM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":18},
				"value": {
					"count": 7,
					"rating": 30,
					"email": "foo2@foo.com"
				},
				"title": "Popularimeter"
			},
			{
				"id": "TDTG",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":20},
				"value": {
					"text": "2009-03-16T18:22:28"
				},
				"title": "Tagging time"
			},
			{
				"id": "TIT2",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":12},
				"value": {
					"text": "Track Title"
				},
				"title": "Title"
			},
			{
				"id": "TRCK",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":6},
				"value": {
					"text": "02/10"
				},
				"title": "Track number"
			},
			{
				"id": "UFID",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":52},
				"value": {
					"id": "foo@foo.com",
					"text": "da39a3ee5e6b4b0d3255bfef95601890afd80709"
				},
				"title": "Unique file identifier"
			},
			{
				"id": "WOAR",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":21},
				"value": {
					"text": "http://www.artist.com"
				},
				"title": "Official artist/performer webpage"
			},
			{
				"id": "WOAR",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":22},
				"value": {
					"text": "http://www.artist2.com"
				},
				"title": "Official artist/performer webpage"
			},
			{
				"id": "WCOM",
				"head": {"encoding":"iso-8859-1","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":21},
				"value": {
					"text": "http://www.google.com"
				},
				"title": "Commercial information"
			},
			{
				"id": "TXXX",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":21},
				"value": {
					"id": "User Frame",
					"text": "User Data"
				},
				"title": "User defined text"
			},
			{
				"id": "WXXX",
				"head": {"encoding":"utf8","statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":31},
				"value": {
					"id": "User URL",
					"text": "http://www.google.com"
				},
				"title": "User defined URL link frame"
			},
			{
				"id": "PCNT",
				"head": {"statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":4},
				"value": {
					"num": 256
				},
				"title": "Play counter"
			},
			{
				"id": "RVA2",
				"head": {"statusFlags":{"reserved":false,"tag_alter_preservation":false,"file_alter_preservation":false,"read_only":false},"formatFlags":{"reserved":false,"grouping":false,"reserved2":false,"reserved3":false,"compressed":false,"encrypted":false,"unsynchronised":false,"data_length_indicator":false},"size":14},
				"value": {
					"id": "normalize",
					"channels": [
						{
							"type": 1,
							"adjustment": 2546
						}
					]
				},
				"title": "Relative volume adjustment 2"
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
  -d, --dest <file>        destination analyse result file
  -h, --help               output usage information

> id3v1-dump v1tag.mp3
{
	"filename": "v1tag.mp3",
	"tag": {
		"id": "ID3v1",
		"start": 0,
		"end": 0,
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

### Test

`npm run test` to run the the mocha tests

### Coverage

`npm run coverage` to run the mocha tests with code coverage stats

### Lint

`npm run lint` to test the code style with tslint
