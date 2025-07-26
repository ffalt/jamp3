# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.6.0](https://github.com/ffalt/jamp3/compare/v0.5.0...v0.6.0) (2025-06-26)

* **lint:** Use modern js

### ⚠ BREAKING CHANGES

* **deps:** Update Dependencies, require node 22 as minimum version

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
