import { ID3V2TagBuilder } from './id3v2.builder.v2';

/**
 * Class for
 * - building an ID3v2.3.0 object
 *
 * Basic usage example:
 *
 * {@includeCode ../../../examples/snippet_id3v2-3-build.ts}
 */
export class ID3V23TagBuilder extends ID3V2TagBuilder {
	public static encodings = {
		iso88591: 'iso-8859-1',
		ucs2: 'ucs2'
	};

	constructor(encoding?: string) {
		// Normalize encodings: ID3v2.3 supports ISO-8859-1 and UCS-2 (UTF-16 with BOM).
		// If a user passes a v2.4-only or non-conformant encoding, map it to 'ucs2'.
		let enc = encoding;
		if (enc) {
			const e = enc.toLowerCase();
			// eslint-disable-next-line unicorn/text-encoding-identifier-case
			if (e === 'utf8' || e === 'utf-8' || e === 'utf16-be' || e === 'utf16be' || e === 'utf-8-bom') {
				enc = 'ucs2';
			}
		}
		super(enc);
	}

	version(): number {
		return 3;
	}

	rev(): number {
		return 0;
	}

	albumSort(value?: string): ID3V23TagBuilder {
		this.idText('TXXX', 'ALBUMSORT', value);
		return this;
	}

	albumArtistSort(value?: string): ID3V23TagBuilder {
		this.idText('TXXX', 'ALBUMARTISTSORT', value);
		return this;
	}

	artistSort(value?: string): ID3V23TagBuilder {
		this.idText('TXXX', 'ARTISTSORT', value);
		return this;
	}

	composerSort(value?: string): ID3V23TagBuilder {
		this.idText('TXXX', 'COMPOSERSORT', value);
		return this;
	}

	date(value?: string): ID3V23TagBuilder {
		// In v2.3, date is split into TYER, TDAT, TIME
		// For simplicity, we use TYER for year
		this.text('TYER', value);
		return this;
	}

	/** IPLS: The 'Involved people list' in v2.3 (TIPL in v2.4)
	 * @param group function, e.g. producer
	 * @param value a name or comma seperated list of names
	 * **/
	involved(group: string, value?: string): ID3V23TagBuilder {
		this.keyTextList('IPLS', group, value);
		return this;
	}

	/** TORY: The 'Original release year' frame is intended for the year when the original recording was released.
	 * @param value year (4 characters)
	 **/
	originalDate(value?: string): ID3V23TagBuilder {
		this.text('TORY', value);
		return this;
	}

	titleSort(value?: string): ID3V23TagBuilder {
		this.idText('TXXX', 'TITLESORT', value);
		return this;
	}
}