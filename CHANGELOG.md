# Changelog

All notable changes to this project will be documented in this file.
## [0.6.2](https://github.com/ffalt/jamp3/compare/v0.6.1...v0.6.2) (2026-11-26)

### Features

* **frames:** support MVCN frame ([d620991](https://github.com/ffalt/jamp3/commit/d62099129ac37cfd70779c3071a70821d6e6fe54))
* **text-frames:** handle multiple text frame values better ([afd71c4](https://github.com/ffalt/jamp3/commit/afd71c42ad068a64c802630818ce223000c5c3c4))

### Bug Fixes

* **buffer-reader:** bitBytes must be unsigned ([062c98c](https://github.com/ffalt/jamp3/commit/062c98c2fd39bd2b40f587200e4801004212f25c))
* **buffer-reader:** limit unsynced buffer reads and truncate on insufficient data ([74a1df0](https://github.com/ffalt/jamp3/commit/74a1df09a0223a98421156613229a18fe6d4de5f))
* **buffer-reader:** readByte must throw past the end instead of returning undefined ([f775ca1](https://github.com/ffalt/jamp3/commit/f775ca14c6b97c048392d40510a1aabbeda44094))
* **encodings:** binary must pass bytes through instead of hex-coding them ([ae0d3a3](https://github.com/ffalt/jamp3/commit/ae0d3a30410edbb165aa46ae6979070c8bd5b970))
* **encodings:** correctly strip leading utf-8 BOM bytes ([8b6c0ad](https://github.com/ffalt/jamp3/commit/8b6c0ad911fcdc5b971fb93812b1fbaab760bcac))
* **ext-header:** a truncated extended header must not reject the whole read ([4c25d08](https://github.com/ffalt/jamp3/commit/4c25d088209e3ad20bcc7713e37baaf16020322d))
* **ext-header:** v2.3 extended header is never de-/unsynchronised ([2c447aa](https://github.com/ffalt/jamp3/commit/2c447aa6c6aa7543cfa228f23a434a61b180f568))
* **header:** detect a tag size written as a plain uint32 ([46f931e](https://github.com/ffalt/jamp3/commit/46f931eb5c7570a68eb96523219375a0b6ce3bc8))
* **id3v2.builder:** chapterTOC silently drops its first parameter ([3eb35d5](https://github.com/ffalt/jamp3/commit/3eb35d526e1e6cad0c917d0825d05336233f4fb4))
* **id3v2.frame.chapter-toc:** remove unnecessary entrycount workaround ([366a6ec](https://github.com/ffalt/jamp3/commit/366a6ec1c95c85f50f74b00d53b964661cf0bdb1))
* **id3v2.frame.pic:** adjust URL handling ([1a8d56f](https://github.com/ffalt/jamp3/commit/1a8d56f96ec93b9881efd1002dccb1be65162c2f))
* **id3v2.frame.read:** groupId 0 is allowed ([de07f65](https://github.com/ffalt/jamp3/commit/de07f652f3895aa44669b0fa0ce551e3d8c66698))
* **id3v2.frame:** processRawFrame for compressed and data-length indicator ([edadd58](https://github.com/ffalt/jamp3/commit/edadd5837435fa0727f2e37ef8a2ecafe91c75c5))
* **id3v2.header:** avoid crash on malformed/negative size ([9848117](https://github.com/ffalt/jamp3/commit/9848117e251ee0860a685e94bdc78187f0f59f6e))
* **id3v2.reader:** guard the reads with a signed size, so audio data is not swallowed ([3340b57](https://github.com/ffalt/jamp3/commit/3340b5752aa5aad3cdc7b198e826460cbb1e7584))
* **id3v2.reader:** ID3v2HeaderReader must not double-counts the extended header ([7e17d65](https://github.com/ffalt/jamp3/commit/7e17d65338290aa4a1f623feb15ecc6b53e7e232))
* **id3v2.reader:** ignore unsupported versions ([10f1d1d](https://github.com/ffalt/jamp3/commit/10f1d1d78a91b8b59c64177c9f0b7d60d3f55d93))
* **id3v2.reader:** resync recovery appends synchronised garbage to de-unsynchronised frame data ([0738eaa](https://github.com/ffalt/jamp3/commit/0738eaa13abac94d698c2ea2a2ef70deddfeb66c))
* **id3v2.remove:** do not rewrite files when no id3v2 found ([9b8fa79](https://github.com/ffalt/jamp3/commit/9b8fa79490c2ec5328ae4831fa82bc32f88d20ef))
* **id3v2.simplify:** wrong simplifyInvolvedPeopleList values ([0c1a248](https://github.com/ffalt/jamp3/commit/0c1a248405aae585c32c7083f88361bb9ff50a67))
* **id3v2:** 2.2 also must write syncsafeint size, but support also plain uint32 ([c9648f0](https://github.com/ffalt/jamp3/commit/c9648f0c2ac45e93fa69e59367dfb7f9716783f4))
* **id3v2:** adjust flagBits calculation to use dynamic offset ([5fc7430](https://github.com/ffalt/jamp3/commit/5fc7430abd01cffa778d3e61359cc982ea35ebeb))
* **id3v2:** copyRange is one byte off ([b89dd08](https://github.com/ffalt/jamp3/commit/b89dd083911e28a463bb8f45721b3d8e3501ed6e))
* **id3v2:** correct peak byte size calculation in RVA2 ([33053fe](https://github.com/ffalt/jamp3/commit/33053fe6299a6cd863f6e98e54b9a34e6648fb64))
* **id3v2:** extended header size calculation ([8a44ea1](https://github.com/ffalt/jamp3/commit/8a44ea13728d09eaa21142e26b3a894c674dbdc3))
* **id3v2:** POPM/PCNT counters above 6 bytes are silently reset to 0 ([c4aaac9](https://github.com/ffalt/jamp3/commit/c4aaac9b94fa72820fe67f4b26ff97afcb74878d))
* **id3v2:** update peak and back value calculations in RVA ([901bcbe](https://github.com/ffalt/jamp3/commit/901bcbe23cfba5ee4f8c91c03ef4d29e12801f94))
* **lint:** fix issues ([af0a7d4](https://github.com/ffalt/jamp3/commit/af0a7d4d426a3253506925b1844afa38b3e2655e))
* **mp3.analyzer:** correct filtering logic for ID3v1 tags ([ee4daac](https://github.com/ffalt/jamp3/commit/ee4daac42f9811e466a8688403a244499380a158))
* **mp3.analyzer:** remove false filter condition for ID3v1 tags ([1bf533c](https://github.com/ffalt/jamp3/commit/1bf533caf5aa60fbf8fcbec137b3c8a03dab2a56))
* **mp3.chain:** resolve frame indexing issue in followChain to prevent skipping valid frames ([2701df5](https://github.com/ffalt/jamp3/commit/2701df5089c02359d71d838ce5943408b5b60ab0))
* **mp3.result:** don't overwrite duration estimate with non existing Xing/VBRI ([d1a2020](https://github.com/ffalt/jamp3/commit/d1a2020eeb7acab732c9f0f20843a41ef3f9b1f1))
* **mp3.result:** only a trailing ID3v1 tag at the true end of the file occupies audio-estimate bytes ([3f3020a](https://github.com/ffalt/jamp3/commit/3f3020a980ca484b6d991acf4afb6bd766d3e0ad))
* **mp3:** limit detection for XING/VBRI headers ([6478202](https://github.com/ffalt/jamp3/commit/647820263cafbed9c2264b266d6154cb5fbe8f51))
* **mpeg:** change frame and byte reading to unsigned integers ([0539881](https://github.com/ffalt/jamp3/commit/05398819542ec288c08575202abd902c970bcc84))
* **mpeg:** frame size calculation for slots ([7041919](https://github.com/ffalt/jamp3/commit/7041919b1af1b2b61bfe97a212dd3e60c0c9e6d6))
* **stream-reader:** a stream error after the first chunk hangs forever ([1273e0a](https://github.com/ffalt/jamp3/commit/1273e0a1f2df77f1966576e3b0e346bde203450d))
* **stream-reader:** correctly update position based on actual bytes read ([d49e58f](https://github.com/ffalt/jamp3/commit/d49e58fda1dca58f9f2729d10cdb2bf820eaf1c3))
* **stream-reader:** detect marker split across two stream chunks ([03eb9c6](https://github.com/ffalt/jamp3/commit/03eb9c65a19091136c7622a93c1b9a42745a4346))
* **stream-reader:** update buffersLength calculation ([e687728](https://github.com/ffalt/jamp3/commit/e687728cd28e86b1a8c9285060a010917fe6b56f))
* **stream-writer:** attach error handler to write stream ([39695cd](https://github.com/ffalt/jamp3/commit/39695cdb2abb3041cb3cf4204bc0af4a8332a7c2))
* **stream-writer:** copyRange copies one byte too many past the end ([5cefbcf](https://github.com/ffalt/jamp3/commit/5cefbcf042d070ac08b998e8cc37d1f5c64bb869))
* **stream-writer:** optimize close handling with promise caching ([1e901b7](https://github.com/ffalt/jamp3/commit/1e901b73813eade18cdac220abf556e19c725807))
* **text-frames:** multi-value text frames silently lose all values after the first ([54f9bb8](https://github.com/ffalt/jamp3/commit/54f9bb865f0e01b54fed97e4ee92b19734c5a1c6))
* **update-file:** cleanup is aborted on a write error ([7edd80e](https://github.com/ffalt/jamp3/commit/7edd80e2300c532dc72f66a90802054493d01255))
* **update-file:** fallback handling during file rename ([e7b2999](https://github.com/ffalt/jamp3/commit/e7b29994c3313839bb73a7852cac4a93af554db3))
* **update-file:** never remove the original before the temp file is in place ([43ce63d](https://github.com/ffalt/jamp3/commit/43ce63d196561db5ecf2f1d63dc65b2ad73ff93e))
* **utils:** correct calculation of needed store bytes ([731afb5](https://github.com/ffalt/jamp3/commit/731afb5380a8c54da1999bd241aa91ed6ec67026))

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
