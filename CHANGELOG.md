# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.5.0 (2020-09-25)


### ⚠ BREAKING CHANGES

* **id3v2:** simplifyTag function access has been moved to static
ID3v2.simplify
* **id3v2:** simplifyTag function access has been moved to static
ID3v2.simplify
* **code quality:** MP3Analyzer: renamed result fields
* **mp3.read:** option id3v1IfNotid3v2 renamed to id3v1IfNotID3v2,
renamed frame flag names
* **writing:** ID3v2.head format changed
* **writing:** some parameters moved into options object
* **ID3V24TagBuilder:** renamed 'addPicture' to 'picture'
* **stream:** MP3.read(opts) => MP3.read(filename, opts)

### Features

* **analyze:** detect garbage data before audio data ([2467ab7](https://github.com/ffalt/jamp3/commit/2467ab7354c4067bd952ab2a507184a47e4d8f8e))
* **analyze:** export types at library root ([287cb1c](https://github.com/ffalt/jamp3/commit/287cb1ca85de3cd3e657cd14f8a7b068eb62bb5d))
* **analyzer:** option to ignore most frequent off-by-one error in XING header declaration (even ffmpeg seems ignore the XING spec & produces files with this) ([bb35a23](https://github.com/ffalt/jamp3/commit/bb35a23da46ede5eed25d2bb0b9bc66dbcc3273d))
* **cli:** add id3v1 mass remover ([1f561bd](https://github.com/ffalt/jamp3/commit/1f561bd560f71035226dd62277bf628f6df61135))
* **cli:** add id3v1 mass remover ([1276c65](https://github.com/ffalt/jamp3/commit/1276c65697f7949f5b4fe8887bfae5bd440f6860))
* **frames:** support movement frames ([fc05401](https://github.com/ffalt/jamp3/commit/fc05401ac8763ce1ae6755467266bce5f3011062))
* **id3v2:** add defaultEncoding to WriteOptions ([69314e9](https://github.com/ffalt/jamp3/commit/69314e9055b9030a2433e5f9e2969c0327b3e8c3))
* **id3v2:** add id3v2 tag builder helper ([f8ff9e1](https://github.com/ffalt/jamp3/commit/f8ff9e16c7a0ec2374bb464f49d867861aecf2df))
* **id3v2:** add id3v2 tag builder helper ([6fd349e](https://github.com/ffalt/jamp3/commit/6fd349e49726d4318d0221fc9e198cd0306810e9))
* **id3v2:** add TDEN frame info ([8d3b396](https://github.com/ffalt/jamp3/commit/8d3b396687797934adf6a15b25511e4e08190db0))
* **id3v2:** use equal-ish keys in simplified id3v2 as the keys by VorbisComments in flac files ([030df36](https://github.com/ffalt/jamp3/commit/030df362baa28a0c6c247d4f0ae931540fe471c5))
* **id3v2:** write builder function ([8aeab30](https://github.com/ffalt/jamp3/commit/8aeab308b2433f1ca9d4ca3df97e0a7213a70a07))
* **id3v2 builder:** add chapter frame ([d753289](https://github.com/ffalt/jamp3/commit/d75328918c365994edb675635d5571597edaaece))
* **id3v2 builder:** types ([a7e94bd](https://github.com/ffalt/jamp3/commit/a7e94bd097bb52290e0eb9dc1b9ba687fca808b1))
* **ID3v2 constants:** move value constants like Picture Type into public group object ([05bab44](https://github.com/ffalt/jamp3/commit/05bab44dad3902a27220d0c8bd5bf8420f92c54d))
* **id3v2 simplify:** add Discogs Frames Slugs ([330b018](https://github.com/ffalt/jamp3/commit/330b0187e25c71eef85aa89e40281c61b246e043))
* **id3v2 simplify:** include common FrameValue.IdText without an id ([450d53a](https://github.com/ffalt/jamp3/commit/450d53a01833d345d6ac7c75e8822f1458d58c70))
* **id3v2-simplify:** add track_total/disc_total to type spec ([71a468c](https://github.com/ffalt/jamp3/commit/71a468c480969ced1ae003c2e546421124144c19))
* **id3v2-simplify:** split track number like "1/2" into track:1 track_total:2 (same for disc) ([af6fd6a](https://github.com/ffalt/jamp3/commit/af6fd6a194d81f3b5624eb7030f99a821391a1aa))
* **ID3v2.write:** add optional "keepBackup:boolean" parameter to keep the ${filename}.bak file which is created while writing (if it does not already exists) ([6d61db4](https://github.com/ffalt/jamp3/commit/6d61db4d791ed2826048328c54c29b03b92e3105))
* **ID3V24TagBuilder:** consistent naming ([e1583f6](https://github.com/ffalt/jamp3/commit/e1583f644b31b3400dd214c9c703335852d3974b))
* **ID3V24TagBuilder:** support for PRIV frames with 'priv(id, binary)' ([ecb82e9](https://github.com/ffalt/jamp3/commit/ecb82e9ad670b557f310dfd9dbbf1e4290b36564))
* **ITagID enum:** add ITagID string enum (ID3v2 | ID3v1) ([fecfa86](https://github.com/ffalt/jamp3/commit/fecfa86d78603b5c37076dd6278002debc7e04a4))
* **mocha:** add config file ([abe53e1](https://github.com/ffalt/jamp3/commit/abe53e13f810de5d95a063144efe46a04816bb45))
* **mp3:** add "VBR header is missing" check ([550b629](https://github.com/ffalt/jamp3/commit/550b629fb25cb81eed0b0aef98186f9eea6fd51b))
* **mp3:** export MP3Analyzer ([a77d71c](https://github.com/ffalt/jamp3/commit/a77d71c6234622a2a04d6abaa234cb6e3f4b96d4))
* **MP3:** add MP3.removeTags(filename, {id3v2:boolean, id3v1:boolean, keepBackup:boolean}) for stripping tags ([ba3b2a0](https://github.com/ffalt/jamp3/commit/ba3b2a03950d0e14cae985541dab9b96894bcc9e))
* **MP3 Analyze/Reader:** use less heap space collecting mpeg frame headers ([02d3251](https://github.com/ffalt/jamp3/commit/02d325127cf9af71255de61effb294678f7c8a0a))
* **MP3 Analyze/Reader:** use less heap space collecting mpeg frame headers ([549152b](https://github.com/ffalt/jamp3/commit/549152bd20352600857ce22eeaa68ef08f5be8f6))
* **mp3 scanner:** stop scanning for id3v2 after audio was found ([f59ea93](https://github.com/ffalt/jamp3/commit/f59ea93b4344d228edb563af59dbcb096353842a))
* **mp3.read:** fix naming ([7b7bf01](https://github.com/ffalt/jamp3/commit/7b7bf01c9167d87e48e8ee899185cbdd55cfcfc5))
* **MP3.removeTags:** returns report obj if tags are removed and which ([2a6ea3f](https://github.com/ffalt/jamp3/commit/2a6ea3fa8d8766941548ec776601f5e00b929e03))
* **MP3.removeTags:** test removing individual tags, too ([2218fda](https://github.com/ffalt/jamp3/commit/2218fda7e19e9ff91dc9956cee4dc7cdb155be5f))
* **mp3reader:** get rid of callback hell (also, avoid call stack overflow with while loop) ([13f6f39](https://github.com/ffalt/jamp3/commit/13f6f39cc9984806ee88970076080b201ad7eac8))
* **mpeg scanning:** choose better audio frames chain if multiple available ([470bcf3](https://github.com/ffalt/jamp3/commit/470bcf3868c8f6b8d4594e0dc7cc356e8620319c))
* **mpeg scanning:** scan more frames if no chain was found ([c33dc01](https://github.com/ffalt/jamp3/commit/c33dc0187a07da8c09ac10a2951571329a52620a))
* **node:** remove deprecated parameters ([b8189c4](https://github.com/ffalt/jamp3/commit/b8189c4d030028acf761d685bb9a53645a78144c))
* **package:** export ID3v1.GENRES on root index ([998f809](https://github.com/ffalt/jamp3/commit/998f809495f5a35bb07757f61f7331f4eca21cfb))
* **simplify:** add TXXX: MB Track ID ([0a6be27](https://github.com/ffalt/jamp3/commit/0a6be27ab1206bcef0374412e02da50fc03a05c0))
* **stream:** ignore empty unshifting ([1c52eca](https://github.com/ffalt/jamp3/commit/1c52ecaf76498cf1b980ea3be832a86020eac447))
* **stream:** offer reading with stream.Readable ([afd2002](https://github.com/ffalt/jamp3/commit/afd2002e91898fd8296cb7f1ae34827ddbb87903))
* **updating/removing tag:** only read necessary layout information before writing ([55dfdc9](https://github.com/ffalt/jamp3/commit/55dfdc9ba735d7e7cdd4b0af64297f144a845111))
* **writing:** better support for writing different ID3v2 versions ([850ffa4](https://github.com/ffalt/jamp3/commit/850ffa4841a48cbc1ef1399867387dd4c4f40629))
* **writing:** unify write/remove functions ([1739504](https://github.com/ffalt/jamp3/commit/1739504d0a9ac4bdd5edc30a437d1a59b59b9fb5))
* **writing id3v2:** encoding in options ([9689c0f](https://github.com/ffalt/jamp3/commit/9689c0f3ed5d426ae49f809c8d240dea57a6852d))


### Bug Fixes

* **analyze:** collecting audio frame headers as objects results in heap overflow for large files, use simple arrays to decrease memory usage a lot ([fb9891b](https://github.com/ffalt/jamp3/commit/fb9891bdf8eae001ba6f6191ea0ffa679ac6bd06))
* **analyze:** report garbage padding size, not file positions ([e24447b](https://github.com/ffalt/jamp3/commit/e24447be40127b430cf5e77acb53358954d88694))
* **cli:** durationMS should contain milliseconds, not seconds ([3fdb361](https://github.com/ffalt/jamp3/commit/3fdb361ca496fc7f2e49a49aed1b2f8d00ebb158))
* **cli:** MP3.read(opts) => MP3.read(filename, opts) ([a2ad25e](https://github.com/ffalt/jamp3/commit/a2ad25e1f17b59cc6e38f7374b117f821096e4c0))
* **code climate:** refactoring bug ([41a47b8](https://github.com/ffalt/jamp3/commit/41a47b80ea78e17d28c43c7c1795e2657674acd7))
* **deps:** update dependency commander to v3.0.1 ([379925e](https://github.com/ffalt/jamp3/commit/379925eb1331f5a6088c9e49025f076c15fb4ad3))
* **deps:** update dependency commander to v3.0.2 ([b848ca2](https://github.com/ffalt/jamp3/commit/b848ca20a81b72f5695e91133aef409d1d136c28))
* **deps:** update dependency commander to v4.1.0 ([6381a90](https://github.com/ffalt/jamp3/commit/6381a9020987ee76221840428ab71c7980e5ed4c))
* **deps:** update dependency commander to v4.1.1 ([a816744](https://github.com/ffalt/jamp3/commit/a816744e9f2e18fa9d3e993cdab3a820af461997))
* **deps:** update dependency fs-extra to v8.1.0 ([48041e3](https://github.com/ffalt/jamp3/commit/48041e389e7eafc075c2c28e29d6f547cc08357f))
* **deps:** update dependency iconv-lite to v0.5.0 ([5152b00](https://github.com/ffalt/jamp3/commit/5152b00f2ea59f2039e0d44744174264067371a9))
* **deps:** update dependency iconv-lite to v0.5.1 ([c089645](https://github.com/ffalt/jamp3/commit/c089645b01a9ab93432b90a8b46dd75cc4a8e675))
* **encoding:** non standard utf-8 bom should be ignored ([b85a5ae](https://github.com/ffalt/jamp3/commit/b85a5ae4d22a5ad36023595a3aade08b35e3d225))
* **error handling:** fix unhandled error for read attempts on not existing files ([e0bd0f2](https://github.com/ffalt/jamp3/commit/e0bd0f25ab8648806f52e01a80279a7975fe75b4))
* **ID3v1:** fix genre name ([2ffb4b1](https://github.com/ffalt/jamp3/commit/2ffb4b10a6dcd8338d99267c3d846b473438dcc6))
* **ID3v1:** fix genre name ([efbe1a1](https://github.com/ffalt/jamp3/commit/efbe1a1c81abc8e2243d349af5b844253dacf9db))
* **ID3V1.write:** range piping must not close the stream ([f80efd5](https://github.com/ffalt/jamp3/commit/f80efd548578bec1d6be10aa000a6ef675173507))
* **ID3V1.write:** remove old id3v1 ([b1fa619](https://github.com/ffalt/jamp3/commit/b1fa619d9c3e835cf79546c686d1cb7ee697914c))
* **id3v2:** better temp file handling on writing tags, don't use .mp3 extension for temp file ([911e41f](https://github.com/ffalt/jamp3/commit/911e41faf22b58f6164c06074d878c6c8bb4876f))
* **id3v2.2:** TCO is Text Frame ([e4827c8](https://github.com/ffalt/jamp3/commit/e4827c8dae127cf642f4bcc7a9c60153d2f16453))
* **ID3V2.FrameTextConcatList:** value was not written in parts ([bf625fb](https://github.com/ffalt/jamp3/commit/bf625fbaa645b8570f5dc55b741cb35abf1a59be))
* **id3v2frame:** check if stream got enough data left for the frame size field ([2bee808](https://github.com/ffalt/jamp3/commit/2bee808ed03e93a61a234ec6158549a2495810ce))
* **lint:** remove unused import ([40598af](https://github.com/ffalt/jamp3/commit/40598af22861138249504befa25d46fc1a444d5f))
* **mocha:** correct path to opts file ([6e67d67](https://github.com/ffalt/jamp3/commit/6e67d679300b94489cef4bf8925da8034a09d353))
* **mp3 analyzer:** remove console.log ([208d494](https://github.com/ffalt/jamp3/commit/208d494347a6061a2acdad325a3d54bb09a0878f))
* **MP3.removeTags/ID3v2.updateTag:** remove padding between id3v2 and audio ([0be4b8c](https://github.com/ffalt/jamp3/commit/0be4b8ca0dedc528b74fc99d35e7926a22455385))
* **simplify:** add track/disc/movement to known list of frame ids ([1107546](https://github.com/ffalt/jamp3/commit/11075468747d3a2f6236b524c403207303836a9e))
* **test:** longer timeout for spec test ([c08fd1e](https://github.com/ffalt/jamp3/commit/c08fd1e3255f77233a0ffa6e375211f9f07aa6a7))
* **tools:** fix ignored space parameter ([a18ef24](https://github.com/ffalt/jamp3/commit/a18ef244bb798764f36b419ad9c23771778fb2e3))
* **type:** MCDI is in IID3V2.FrameValue.Bin format ([f9e9397](https://github.com/ffalt/jamp3/commit/f9e9397dbe3a15b63300029018d412a4b5842764))
* **typescript:** add missing types ([9d6bb47](https://github.com/ffalt/jamp3/commit/9d6bb47fde0b565aee86ff65ad607045900d6325))
* **updateFile:** do not remove existing .bak files ([5a12a43](https://github.com/ffalt/jamp3/commit/5a12a430a9ef266010bdd9f3018475e47ef19057))


* **code quality:** reorder & document code ([ab6b878](https://github.com/ffalt/jamp3/commit/ab6b8788cfdae0be4812c15356527240351bfc03))
* **id3v2:** helpers as static functions ([271d935](https://github.com/ffalt/jamp3/commit/271d9357e604b3b365ac8ff7b83de8f71233c82a))
* **id3v2:** update ([9f4a47e](https://github.com/ffalt/jamp3/commit/9f4a47e6ca7dc3fd03232f5fbdb0e386f38f46ce))

<a name="0.4.2"></a>
## 0.4.2
### BREAKING
*  Update Dependencies, require node 10 as minimum version

<a name="0.4.1"></a>
## 0.4.1 (2019/12/06)
### Features
*   CodeClimate: reduce duplication
*   CodeClimate: smaller source files
*   CodeClimate: reduce cognitive complexity
*   CodeClimate: file naming scheme
 
### Bug Fixes
*   ID3V2.FrameTextConcatList value was not written in parts
*   updateFile: do not remove existing .bak files

<a name="0.4.0"></a>
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

<a name="0.3.10"></a>
## 0.3.10 (2019/06/10)
### Bug Fixes
*   MP3.removeTags/ID3v2.updateTag: remove padding between id3v2 and audio

### Features
*   ID3v2.write(): optional padding size parameter

<a name="0.3.9"></a>
## 0.3.9 (2019/06/04)
### Features
*   MP3.removeTags: returns report obj if and which tags are removed
`async removeTags(filename: string, options: IMP3.RemoveTagsOptions): Promise<{ id3v2: boolean, id3v1: boolean } | undefined>`

<a name="0.3.8"></a>
## 0.3.8 (2019/06/04)
### Features
*   ID3v1.write: add optional "keepBackup:boolean" parameter to keep the ${filename}.bak file which is created while writing (if it does not already exists)

### Bug Fixes
*   ID3v1.write: did not properly update existing files

<a name="0.3.7"></a>
## 0.3.7 (2019/06/03)
### Features
*   ID3v2.write: add optional "keepBackup:boolean" parameter to keep the ${filename}.bak file which is created while writing (if it does not already exists)
*   MP3.removeTags: add MP3.removeTags(filename, {id3v2:boolean, id3v1:boolean, keepBackup:boolean}) for stripping tags
*   ITagID enum: add ITagID string enum (ID3v2 | ID3v1)

### Bug Fixes
*   ID3v2: correct position in ID3v2.end 

<a name="0.3.6"></a>
## 0.3.6 (2019/05/31)
### Features
*   MP3 Analyze/Reader: use even less heap space collecting mpeg frame headers
*   export ID3v1.GENRES on root index

<a name="0.3.5"></a>
## 0.3.5 (2019/05/27)

### Features
*   ID3V24TagBuilder: support for PRIV frames with 'priv(id, binary)'
*   MP3 Analyze/Reader: use less heap space collecting mpeg frame headers

### BREAKING
*   ID3V24TagBuilder: renamed 'addPicture' to 'picture'
