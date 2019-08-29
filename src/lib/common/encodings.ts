import iconv from 'iconv-lite';
// import Debug from 'debug';
import {BufferUtils} from './buffer';

// const debug = Debug('encodings');

export interface IEncoding {
	name: string;
	byte: number;
	bom?: Array<number>;
	terminator: Buffer;
	encode: (val: string) => Buffer;
	decode: (buffer: Buffer) => string;
}

export const Encodings: {
	[name: string]: IEncoding;
} = {};

Encodings['iso-8859-1'] = {
	name: 'iso-8859-1',
	byte: 0, // $00   ISO-8859-1 [ISO-8859-1]. Terminated with $00.
	terminator: BufferUtils.fromArray([0]),
	encode: (s) => {
		return iconv.encode(s, 'iso-8859-1');
	},
	decode: (buf) => {
		return iconv.decode(buf, 'iso-8859-1');
	}
};
Encodings['ascii'] = Encodings['iso-8859-1'];

Encodings['binary'] = {
	name: 'binary',
	byte: 0, // $00
	terminator: BufferUtils.fromArray([0]),
	encode: (s) => {
		return iconv.encode(s, 'hex');
	},
	decode: (buf) => {
		return iconv.decode(buf, 'hex');
	}
};

Encodings['ucs2'] = {
	name: 'ucs2',
	byte: 1, // $01   UTF-16 [UTF-16] encoded Unicode [UNICODE] with BOM. All strings in the same frame SHALL have the same byteorder.
	bom: [0xFF, 0xFE], // UTF-16 (LE)
	terminator: BufferUtils.fromArray([0, 0]), // Terminated with $00 00.
	encode: (s) => {
		return iconv.encode(s, 'ucs2');
	},
	decode: (buf) => {
		if ((buf[0] === 0xFF) && (buf[1] === 0xFE)) {
			return iconv.decode(buf.slice(2), 'ucs2');
		}
		if ((buf[0] === 0xFE) && (buf[1] === 0xFF)) {
			return iconv.decode(buf.slice(2), 'utf16-be');
		}
		// UTF-16 without BOM?
		let isAscii = true;
		for (let i = 0; i < buf.length; i++) {
			if (buf[i] === 0) {
				isAscii = false;
				break;
			}
		}
		if (isAscii && buf.length > 4) {
			// debug('autodetect ascii', buf.length, iconv.decode(buf, 'iso-8859-1'));
			return iconv.decode(buf, 'iso-8859-1');
		}
		return iconv.decode(buf, 'ucs2');
	}
};
Encodings['ucs2-le'] = Encodings['ucs2'];
Encodings['ucs2le'] = Encodings['ucs2'];

Encodings['utf16-be'] = {
	name: 'utf16-be',
	byte: 2, // $02   UTF-16BE [UTF-16] encoded Unicode [UNICODE] without BOM.
	terminator: BufferUtils.fromArray([0, 0]),
	encode: (s) => {
		return iconv.encode(s, 'utf16-be');
	},
	decode: (buf) => {
		if ((buf[0] === 0xFE) && (buf[1] === 0xFF)) {
			return iconv.decode(buf.slice(2), 'utf16-be');
		}
		if ((buf[0] === 0xFF) && (buf[1] === 0xFE)) {
			return buf.slice(2).toString('ucs2');
		}
		return iconv.decode(buf, 'utf16-be');
	}
};
Encodings['ucs2-be'] = Encodings['utf16-be'];
Encodings['utf16be'] = Encodings['utf16-be'];

Encodings['utf8'] = {
	name: 'utf8',
	byte: 3, // UTF-8 [UTF-8] encoded Unicode [UNICODE]. Terminated with $00.
	terminator: BufferUtils.fromArray([0]),
	encode: (s) => {
		return iconv.encode(s, 'utf8');
	},
	decode: (buf) => {
		if ((buf[0] === 0xEF) && ((buf[1] === 0xBB) || (buf[1] === 0xBF))) {
			buf = buf.slice(2);
		} // strip non-standard utf-8 bom
		return buf.toString('utf8');
	}
};
Encodings['utf-8'] = Encodings['utf8'];

export const ascii = Encodings['ascii'];
export const binary = Encodings['binary'];
export const utf8 = Encodings['utf-8'];

