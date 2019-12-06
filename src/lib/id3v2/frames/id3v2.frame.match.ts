import {FrameDefs, IFrameDef} from './id3v2.frame.defs';
import {FrameText} from './implementations/id3v2.frame.text';
import {FrameAscii} from './implementations/id3v2.frame.ascii';
import {validCharKeyCode} from '../../common/utils';
import {FrameUnknown} from './implementations/id3v2.frame.unknown';

interface IFrameMatch {
	match: (id: string) => boolean;
	matchBin: (id: Buffer) => boolean;
	value: IFrameDef;
}

export const Matcher: Array<IFrameMatch> = [
	{
		/*
		 The text information frames are the most important frames, containing information like artist, album and more.
		 There may only be one text information frame of its kind in an tag. If the textstring is followed by a termination ($00 (00))
		 all the following information should be ignored and not be displayed. All text frame identifiers begin with "T".
		 Only text frame identifiers begin with "T", with the exception of the "TXXX" frame. All the text information frames have the following format:
		 <Header for 'Text information frame', ID: "T000" - "TZZZ", excluding "TXXX" described in 4.2.2.>
		 Text encoding    $xx
		 Information    <text string according to encoding>
		 */
		match: (id: string): boolean => {
			return id[0] === 'T' && id !== 'TXX' && id !== 'TXXX';
		},
		matchBin: (id: Buffer): boolean => {
			if (id[0] !== 84) {
				return false;
			}
			let allX = true;
			for (let i = 1; i < id.length; i++) {
				if (!validCharKeyCode(id[i])) {
					return false;
				}
				allX = allX && (id[i] === 88);
			}
			return !allX;
		},
		value: {
			title: 'Unknown Text Field',
			versions: [3, 4],
			impl:
			FrameText
		}
	},
	{
		/*
		 <Header for 'URL link frame', ID: "W000" - "WZZZ", excluding "WXXX" described in 4.3.2.>
		 URL <text string>
		 */
		match: (id: string): boolean => {
			return (id[0] === 'W' && id !== 'WXX' && id !== 'WXXX');
		}
		,
		matchBin: (id: Buffer): boolean => {
			if (id[0] !== 87) {
				return false;
			}
			let allX = true;
			for (let i = 1; i < id.length; i++) {
				if (!validCharKeyCode(id[i])) {
					return false;
				}
				allX = allX && (id[i] === 88);
			}
			return !allX;
		},
		value: {
			title: 'Unknown URL Field',
			versions: [3, 4],
			impl:
			FrameAscii,
		}
	}
];

export function findId3v2FrameDef(id: string): IFrameDef | null {
	const f = FrameDefs[id];
	if (f) {
		return f;
	}
	for (let i = 0; i < Matcher.length; i++) {
		if (Matcher[i].match(id)) {
			return Matcher[i].value;
		}
	}
	return null;
}

export function matchFrame(id: string): IFrameDef {
	return findId3v2FrameDef(id) || {title: 'Unknown Frame', impl: FrameUnknown, versions: [2, 3, 4]};
}

interface IDBinTree {
	[num: number]: IDBinTree;

	frameDef?: IFrameDef;
}

let tree: IDBinTree;

function fillTree() {
	tree = {};
	Object.keys(FrameDefs).forEach(key => {
		let node = tree;
		for (let i = 0; i < key.length - 1; i++) {
			const c = key.charCodeAt(i);
			node[c] = node[c] || {};
			node = node[c];
		}
		const last = key.charCodeAt(key.length - 1);
		node[last] = node[last] || {frameDef: FrameDefs[key]};
	});
}

function findId3v2FrameDefBuffer(id: Buffer): IFrameDef | undefined {
	const last = id[id.length - 1];
	if (last === 32 || last === 0) {
		id = id.slice(0, id.length - 1);
	}
	if (!tree) {
		fillTree();
	}
	let node = tree;
	for (let i = 0; i < id.length; i++) {
		const c = id[i];
		if (!node[c]) {
			node = tree;
			break;
		}
		node = node[c];
	}
	if (node.frameDef) {
		return node.frameDef;
	}
	for (let i = 0; i < Matcher.length; i++) {
		if (Matcher[i].matchBin(id)) {
			return Matcher[i].value;
		}
	}
}

export function isValidFrameBinId(id: Buffer): boolean {
	return !!findId3v2FrameDefBuffer(id);
}

/*
export function isKnownFrameId(id: string): boolean {
	return !!findId3v2FrameDef(id);
}

export function isValidFrameId(id: string): boolean {
	if ((id.length < 3) || (!/[A-Z]/.exec(id[0]))) {
		return false;
	}
	for (let i = 1; i < id.length; i++) {
		if (!/[A-Z0-9]/.exec(id[i])) {
			return false;
		}
	}
	return id.length > 0;
}
*/
