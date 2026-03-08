import { ID3V2TagBuilder } from './id3v2.builder.v2';
import { IID3V2 } from './id3v2.types';

/**
 * Class for
 * - building an ID3v2.4.0 object
 *
 * Basic usage example:
 *
 * {@includeCode ../../../examples/snippet_id3v2-4-build.ts}
 */
export class ID3V24TagBuilder extends ID3V2TagBuilder {
	public static encodings = {
		iso88591: 'iso-8859-1',
		ucs2: 'ucs2',
		utf16be: 'utf16-be',
		utf8: 'utf8'
	};

	constructor(encoding?: string) {
		super(encoding);
	}

	version(): number {
		return 4;
	}

	rev(): number {
		return 0;
	}

	//

	albumSort(value?: string): ID3V24TagBuilder {
		this.text('TSOA', value);
		return this;
	}

	albumArtistSort(value?: string): ID3V24TagBuilder {
		this.text('TSO2', value);
		return this;
	}

	artistSort(value?: string): ID3V24TagBuilder {
		this.text('TSOP', value);
		return this;
	}

	chapter(id: string, start: number, end: number, offset: number, offsetEnd: number, subframes?: Array<IID3V2.Frame>): ID3V24TagBuilder {
		this.rawBuilder.chapter('CHAP', id, start, end, offset, offsetEnd, subframes);
		return this;
	}

	chapterTOC(value: string, id: string, ordered: boolean, topLevel: boolean, children: Array<string>): ID3V24TagBuilder {
		this.rawBuilder.chapterTOC('CTOC', id, ordered, topLevel, children);
		return this;
	}

	composerSort(value?: string): ID3V24TagBuilder {
		this.text('TSOC', value);
		return this;
	}

	date(value?: string): ID3V24TagBuilder {
		this.text('TDRC', value);
		return this;
	}

	discSubtitle(value?: string): ID3V24TagBuilder {
		this.text('TSST', value);
		return this;
	}

	encodingDate(value?: string): ID3V24TagBuilder {
		this.text('TDEN', value);
		return this;
	}

	/** TIPL: The 'Involved people list' is intended as a mapping between the function and a person
	 * @param group function, e.g. producer
	 * @param value a name or comma seperated list of names
	 * **/
	involved(group: string, value?: string): ID3V24TagBuilder {
		this.keyTextList('TIPL', group, value);
		return this;
	}

	isPodcast(value?: boolean | number | string): ID3V24TagBuilder {
		if (value !== undefined) {
			this.number('PCST', value === 1 || value === 'true' || value === true ? 1 : 0);
		}
		return this;
	}

	mood(value?: string): ID3V24TagBuilder {
		this.text('TMOO', value);
		return this;
	}

	movement(value?: string): ID3V24TagBuilder {
		this.text('MVNM', value);
		return this;
	}

	movementNr(nr?: string | number, total?: string | number): ID3V24TagBuilder {
		this.nrAndTotal('MVIN', nr, total);
		return this;
	}

	/**
	 * TMCL The 'Musician credits list' is intended as a mapping between instruments and the musician that played it.
	 * @param group an instrument
	 * @param value an artist or a comma delimited list of artists
	 * **/
	musicianCredit(group: string, value?: string): ID3V24TagBuilder {
		this.keyTextList('TMCL', group, value);
		return this;
	}

	/** TDOR: The 'Original release time' frame contains a timestamp describing when the original recording of the audio was released.
	 * @param value timestamp in UTC yyyy, yyyy-MM, yyyy-MM-dd, yyyy-MM-ddTHH, yyyy-MM-ddTHH:mm, yyyy-MM-ddTHH:mm:ss
	 **/
	originalDate(value?: string): ID3V24TagBuilder {
		this.text('TDOR', value);
		return this;
	}

	podcastDescription(value?: string): ID3V24TagBuilder {
		this.text('TDES', value);
		return this;
	}

	podcastFeedURL(value?: string): ID3V24TagBuilder {
		this.text('WFED', value);
		return this;
	}

	podcastKeywords(value?: string): ID3V24TagBuilder {
		this.text('TKWD', value);
		return this;
	}

	podcastURL(value?: string): ID3V24TagBuilder {
		this.text('TGID', value);
		return this;
	}

	productionNotice(value?: string): ID3V24TagBuilder {
		this.text('TPRO', value);
		return this;
	}

	relativeVolumeAdjustment2(id: string, channels: Array<{ type: number; adjustment: number; peak?: number }>): ID3V24TagBuilder {
		this.rawBuilder.relativeVolumeAdjustment2('RVA2', id, channels);
		return this;
	}

	releaseDate(value?: string): ID3V24TagBuilder {
		this.text('TDRL', value);
		return this;
	}

	replayGainAdjustment(peak: number, radioAdjustment: number, audiophileAdjustment: number): ID3V24TagBuilder {
		this.rawBuilder.replayGainAdjustment('RGAD', peak, radioAdjustment, audiophileAdjustment);
		return this;
	}

	taggingDate(value?: string): ID3V24TagBuilder {
		this.text('TDTG', value);
		return this;
	}

	titleSort(value?: string): ID3V24TagBuilder {
		this.text('TSOT', value);
		return this;
	}

	work(value?: string): ID3V24TagBuilder {
		this.text('GRP1', value);
		return this;
	}
}
