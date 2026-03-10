# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.6.1](https://github.com/ffalt/jamp3/compare/v0.6.0...v0.6.1) (2026-03-10)


### Bug Fixes

* **ts:** circular import in dev mode ([1d2bd6c](https://github.com/ffalt/jamp3/commit/1d2bd6cadb20733888b9cdedb042825ba4952954))

## [0.6.0](https://github.com/ffalt/jamp3/compare/v0.5.0...v0.6.0) (2026-03-10)

### Features

* add buildspec and ffprobe scripts for ID3v2/ID3v1 test spec file generation ([2697a06](https://github.com/ffalt/jamp3/commit/2697a06c146cb46fcd84d8c22d969d170d73cf60))
* **id3v2:** add ID3v2.3 tag builder with example usage ([8be10e0](https://github.com/ffalt/jamp3/commit/8be10e0b758991010f4532f11f57637ed9e17dba))
* **id3v2:** add support for ID3v2.4 footer in tag writing and reading ([ef1e4c1](https://github.com/ffalt/jamp3/commit/ef1e4c12f544b59624640cbe5b40e7acefdd8ee7))
* **id3v2:** add update support for builders ([9e84629](https://github.com/ffalt/jamp3/commit/9e84629841089cd58470045b4491fd9f47d7d8fe)), closes [#182](https://github.com/ffalt/jamp3/issues/182)
* **id3v2:** enhance simplify functions for event timing, linked info, and RVA frames ([9a96a99](https://github.com/ffalt/jamp3/commit/9a96a9981cf417efb6c91524ea350acbf28a5065))
* **id3v2:** implement extended header V2.4 writing ([009e3ea](https://github.com/ffalt/jamp3/commit/009e3eadd263374ea6899da51f6633fe009ccd8b))
* **id3v2:** implement PRIV frame support with parsing and writing capabilities ([20bdc26](https://github.com/ffalt/jamp3/commit/20bdc266f0b5f85f34067714e0d3a5e9367ccca2))
* **id3v2:** implement simplify functions for ReplayGainAdjustment, GEOB, and SynchronisedLyrics ([3ef30ed](https://github.com/ffalt/jamp3/commit/3ef30ed5e895bf06dc4b5267020f9e053fc5c114))
* **id3v2:** implement unsynchronization handling for ID3v2 frames ([86ab869](https://github.com/ffalt/jamp3/commit/86ab8699be6e7de2833d95fe378a8bc3688f9485))
* **mp3:** enhance ID3v1 detection with range check for stream size ([cf4d1ed](https://github.com/ffalt/jamp3/commit/cf4d1ed13c1baec43cc691d53e406a423afd28c2)), closes [#96](https://github.com/ffalt/jamp3/issues/96)
* **mp3:** implement frame resynchronization after gap detection ([ac5fc75](https://github.com/ffalt/jamp3/commit/ac5fc75fc13fe13eb7176cf5f40b3151c278a622))

### Bug Fixes

* **compressed frames:** correct frame data assignment in ID3v2 frame reading ([4034c10](https://github.com/ffalt/jamp3/commit/4034c100d5c8bd74d28e1ac366da1c9f67e00fc3))
* do not leave tmp file behind if writing fails ([4050a09](https://github.com/ffalt/jamp3/commit/4050a09848b579d1bb4009b988e319ad5369bfc9))
* don't set position beyond data length ([d445aef](https://github.com/ffalt/jamp3/commit/d445aefa48e9f04e9a32dd144c63f0e90ff7d5cb))
* **id3v2.frame:** ensure frameDef assignment is correctly initialized ([e129067](https://github.com/ffalt/jamp3/commit/e12906739a50af0a8010fd349ec2194b318606e9))
* **id3v2.writer:** ensure that tag-level unsynchronization is only applied if the frame has not already been unsynchronized ([ecaa7f0](https://github.com/ffalt/jamp3/commit/ecaa7f0d000cb5e33bfb87fc1d1f692f272c2b65))
* **id3v2:** add options parameter to writeTag for padding support ([1a047dc](https://github.com/ffalt/jamp3/commit/1a047dc5411f167f22f74e8156a6c9494fe706c0))
* **id3v2:** optimize buildID3v2 calls by removing unnecessary await ([206662a](https://github.com/ffalt/jamp3/commit/206662a0e85bffbe0400e6f63554035d683e268f))
* improve type declaration for sublist in ID3v2 spec test ([d40b70a](https://github.com/ffalt/jamp3/commit/d40b70adb5e63d888f1789d72b82f3a676bb064a))
* reorder ID3v2 test directories for consistency ([0374569](https://github.com/ffalt/jamp3/commit/03745697fb4de94862a4eea01c102d8421ce7c09))
* update hash in testfiles for consistency ([e5d37f1](https://github.com/ffalt/jamp3/commit/e5d37f17114ef7cc4b9933ee0c85de34023a6a7d))

### ⚠ BREAKING CHANGES

* **deps:** require node 22 as minimum version


## [0.5.0](https://github.com/ffalt/jamp3/compare/v0.4.3...v0.5.0) (2022-03-26)


### ⚠ BREAKING CHANGES

* **deps:** Update Dependencies, require node 12 as minimum version

* **deps:** bump ([807038e](https://github.com/ffalt/jamp3/commit/807038eed5f63e4d02edb97b8cb7ab8a30618cfd))

### [0.4.3](https://github.com/ffalt/jamp3/compare/v0.4.2...v0.4.3) (2020-12-17)


### Bug Fixes

* **writestream:** handle backpressure ([e92158a](https://github.com/ffalt/jamp3/commit/e92158a80c67f679a6d0098ba4ff0b23fcd3fb0a))

## 0.4.2 (2020-09-25)

### BREAKING
*  Update Dependencies, require node 10 as minimum version

## 0.4.1 (2019/12/06)

### Features
*   CodeClimate: reduce duplication
*   CodeClimate: smaller source files
*   CodeClimate: reduce cognitive complexity
*   CodeClimate: file naming scheme
 
### Bug Fixes
*   ID3V2.FrameTextConcatList value was not written in parts
*   updateFile: do not remove existing .bak files

## 0.4.0 (2019/08/28)

### Features
*   ID3v24Builder: add more frames, add encoding parameter
*   ID3v2.write(): move optional parameters into options object 
*   ID3v2.remove(): remove id3v2
*   ID3v1.remove(): remove id3v1
*   add library usage examples
*   rebuild mocha test options and calls
*   analyze: detect garbage data before audio data
*   CLI: add id3v1 mass remover "id3v1-remove"
*   class documentation

### Bug Fixes
*   ID3v2.write in v2.2 no longer syncsafe the size field
*   ID3v2.read handles empty id3v2 tag (size:0) 

### BREAKING
*   MP3Analyzer: renamed result fields
*   ID3v24Builder: renamed functions (key=>initialKey, media=>mediaType, bmp=>bpm)
*   ID3v2.write(): changed api - options object is mandatory
*   MP3.read(): option id3v1IfNotid3v2 renamed to id3v1IfNotID3v2
*   ID3v2.Head: changed structure into version depended sub-objects 
*   simplifyTag: function access has been moved to static ID3v2.simplify()
*   ID3v2 constants: values constants like Picture Type moved into public group object "ID3V2ValueTypes" 

## 0.3.10 (2019/06/10)

### Bug Fixes
*   MP3.removeTags/ID3v2.updateTag: remove padding between id3v2 and audio

### Features
*   ID3v2.write(): optional padding size parameter

## 0.3.9 (2019/06/04)

### Features
*   MP3.removeTags: returns report obj if and which tags are removed
`async removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<{ id3v2: boolean, id3v1: boolean } | undefined>`

## 0.3.8 (2019/06/04)

### Features
*   ID3v1.write: add optional "keepBackup:boolean" parameter to keep the ${filename}.bak file which is created while writing (if it does not already exists)

### Bug Fixes
*   ID3v1.write: did not properly update existing files

## 0.3.7 (2019/06/03)

### Features
*   ID3v2.write: add optional "keepBackup:boolean" parameter to keep the ${filename}.bak file which is created while writing (if it does not already exists)
*   MP3.removeTags: add MP3.removeTags(filename, {id3v2:boolean, id3v1:boolean, keepBackup:boolean}) for stripping tags
*   ITagID enum: add ITagID string enum (ID3v2 | ID3v1)

### Bug Fixes
*   ID3v2: correct position in ID3v2.end 

## 0.3.6 (2019/05/31)

### Features
*   MP3 Analyze/Reader: use even less heap space collecting mpeg frame headers
*   export ID3v1.GENRES on root index

## 0.3.5 (2019/05/27)

### Features
*   ID3V24TagBuilder: support for PRIV frames with 'priv(id, binary)'
*   MP3 Analyze/Reader: use less heap space collecting mpeg frame headers

### BREAKING
*   ID3V24TagBuilder: renamed 'addPicture' to 'picture'
