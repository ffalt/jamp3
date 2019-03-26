import {IID3V2} from './id3v2__types';

export interface ID3V2Frames {
	[key: string]: Array<IID3V2.FrameValue.Base>;
}

export class ID3V2RawBuilder {
	private frameValues: ID3V2Frames = {};

	build(): ID3V2Frames {
		return this.frameValues;
	}

	text(key: string, value: string | undefined) {
		if (value) {
			const frame: IID3V2.FrameValue.Text = {text: value};
			this.frameValues[key] = [frame];
		}
	}

	idText(key: string, id: string, value: string | undefined) {
		if (value) {
			const list = ((<Array<IID3V2.FrameValue.IdText>>(this.frameValues[key] || []))).filter(f => f.id !== id);
			const frame: IID3V2.FrameValue.IdText = {id, text: value};
			this.frameValues[key] = list.concat([frame]);
		}
	}

	nrAndTotal(key: string, value: number | string | undefined, total: number | string | undefined) {
		if (value) {
			const text = value.toString() + (total ? '/' + total.toString() : '');
			const frame: IID3V2.FrameValue.Text = {text};
			this.frameValues[key] = [frame];
		}
	}

	keyTextList(key: string, group: string, value?: string) {
		if (value) {
			const frames = <Array<IID3V2.FrameValue.TextList>>this.frameValues[key] || [];
			const frame: IID3V2.FrameValue.TextList = (frames.length > 0) ? frames[0] : {list: []};
			frame.list.push(group);
			frame.list.push(value);
			this.frameValues[key] = [frame];
		}
	}

	bool(key: string, bool: boolean) {
		if (bool !== undefined) {
			const frame: IID3V2.FrameValue.Bool = {bool};
			this.frameValues[key] = [frame];
		}
	}

	idLangText(key: string, value: string | undefined, lang: string | undefined, id: string | undefined) {
		if (value) {
			id = id || '';
			lang = lang || '';
			const list = ((<Array<IID3V2.FrameValue.LangDescText>>(this.frameValues[key] || []))).filter(f => f.id !== id);
			const frame: IID3V2.FrameValue.LangDescText = {id, language: lang, text: value};
			this.frameValues[key] = list.concat([frame]);
		}
	}

	addPicture(key: string, pictureType: number, description: string, mimeType: string, binary: any) {
		const frame: IID3V2.FrameValue.Pic = {
			description: description || '',
			pictureType,
			bin: binary,
			mimeType: mimeType
		};
		this.frameValues[key] = (this.frameValues[key] || []).concat([frame]);
	}
}

export class ID3V24TagBuilder {
	rawBuilder = new ID3V2RawBuilder();

	buildFrames(): Array<IID3V2.Frame> {
		const result: Array<IID3V2.Frame> = [];
		const frameValues = this.rawBuilder.build();
		Object.keys(frameValues).forEach(id => {
			const list = frameValues[id];
			for (const value of list) {
				result.push({id, value});
			}
		});
		return result;
	}

	buildTag(): IID3V2.Tag {
		const result: IID3V2.Tag = {
			id: 'ID3v2',
			head: {
				ver: 4,
				rev: 0,
				size: 0,
				valid: true
			},
			start: 0,
			end: 0,
			frames: this.buildFrames()
		};
		return result;
	}

	artist(value?: string) {
		this.rawBuilder.text('TPE1', value);
		return this;
	}

	artistSort(value?: string) {
		this.rawBuilder.text('TSOP', value);
		return this;
	}

	albumArtist(value?: string) {
		this.rawBuilder.text('TPE2', value);
		return this;
	}

	albumArtistSort(value?: string) {
		this.rawBuilder.text('TSO2', value);
		return this;
	}

	album(value?: string) {
		this.rawBuilder.text('TALB', value);
		return this;
	}

	albumSort(value?: string) {
		this.rawBuilder.text('TSOA', value);
		return this;
	}

	originalAlbum(value?: string) {
		this.rawBuilder.text('TOAL', value);
		return this;
	}

	originalArtist(value: string) {
		this.rawBuilder.text('TOPE', value);
		return this;
	}

	originalDate(value: string) {
		this.rawBuilder.text('TDOR', value);
		return this;
	}

	title(value?: string) {
		this.rawBuilder.text('TIT2', value);
		return this;
	}

	work(value?: string) {
		this.rawBuilder.text('TIT1', value);
		return this;
	}

	titleSort(value?: string) {
		this.rawBuilder.text('TSOT', value);
		return this;
	}

	genre(value?: string) {
		this.rawBuilder.text('TCON', value);
		return this;
	}

	bmp(value?: string | number) {
		this.rawBuilder.text('TBPM', value ? value.toString() : undefined);
		return this;
	}

	mood(value?: string) {
		this.rawBuilder.text('TMOO', value);
		return this;
	}

	media(value?: string) {
		this.rawBuilder.text('TMED', value);
		return this;
	}

	language(value?: string) {
		this.rawBuilder.text('TLAN', value);
		return this;
	}

	grouping(value?: string) {
		this.rawBuilder.text('GRP1', value);
		return this;
	}

	date(value?: string) {
		this.rawBuilder.text('TDRC', value);
		return this;
	}

	track(trackNr?: string | number, trackTotal?: string | number) {
		this.rawBuilder.nrAndTotal('TRCK', trackNr, trackTotal);
		return this;
	}

	disc(discNr?: string | number, discTotal?: string | number) {
		this.rawBuilder.nrAndTotal('TPOS', discNr, discTotal);
		return this;
	}

	year(year?: number) {
		this.rawBuilder.text('TORY', year ? year.toString() : undefined);
		return this;
	}

	artists(value?: string) {
		this.rawBuilder.idText('TXXX', 'Artists', value);
		return this;
	}

	isCompilation(value?: boolean | number | string) {
		if (value !== undefined) {
			this.rawBuilder.bool('TCMP', value === 1 || value === 'true' || value === true);
		}
		return this;
	}

	originalYear(value?: string) {
		this.rawBuilder.text('TYER', value);
		return this;
	}

	composer(value?: string) {
		this.rawBuilder.text('TCOM', value);
		return this;
	}

	composerSort(value?: string) {
		this.rawBuilder.text('TSOC', value);
		return this;
	}

	remixer(value?: string) {
		this.rawBuilder.text('TPE4', value);
		return this;
	}

	label(value?: string) {
		this.rawBuilder.text('TPUB', value);
		return this;
	}

	subtitle(value?: string) {
		this.rawBuilder.text('TIT3', value);
		return this;
	}

	discSubtitle(value?: string) {
		this.rawBuilder.text('TSST', value);
		return this;
	}

	lyricist(value?: string) {
		this.rawBuilder.text('TEXT', value);
		return this;
	}

	lyrics(value?: string, lang?: string, id?: string) {
		this.rawBuilder.idLangText('USLT', value, lang, id);
		return this;
	}

	encoder(value?: string) {
		this.rawBuilder.text('TENC', value);
		return this;
	}

	encoderSettings(value?: string) {
		this.rawBuilder.text('TSSE', value);
		return this;
	}

	key(value?: string) {
		this.rawBuilder.text('TKEY', value);
		return this;
	}

	copyright(value?: string) {
		this.rawBuilder.text('TCOP', value);
		return this;
	}

	isrc(value?: string) {
		this.rawBuilder.text('TSRC', value);
		return this;
	}

	barcode(value?: string) {
		this.rawBuilder.idText('TXXX', 'BARCODE', value);
		return this;
	}

	asin(value?: string) {
		this.rawBuilder.idText('TXXX', 'ASIN', value);
		return this;
	}

	catalogNumber(value?: string) {
		this.rawBuilder.idText('TXXX', 'CATALOGNUMBER', value);
		return this;
	}

	script(value?: string) {
		this.rawBuilder.idText('TXXX', 'SCRIPT', value);
		return this;
	}

	license(value?: string) {
		this.rawBuilder.idText('TXXX', 'LICENSE', value);
		return this;
	}

	website(value?: string) {
		this.rawBuilder.text('WOAR', value);
		return this;
	}

	movement(value?: string) {
		this.rawBuilder.text('MVNM', value);
		return this;
	}

	movementNr(nr?: string | number, total?: string | number) {
		this.rawBuilder.nrAndTotal('MVIN', nr, total);
		return this;
	}

	writer(value?: string) {
		this.rawBuilder.idText('TXXX', 'Writer', value);
		return this;
	}

	custom(id: string, value?: string) {
		this.rawBuilder.idText('TXXX', 'VERSION', value);
		return this;
	}

	musicianCredit(group: string, value?: string) {
		this.rawBuilder.keyTextList('TMCL', group, value);
		return this;
	}

	involved(group: string, value?: string) {
		this.rawBuilder.keyTextList('TIPL', group, value);
		return this;
	}

	mbAlbumStatus(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Status', value);
		return this;
	}

	mbAlbumType(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Type', value);
		return this;
	}

	mbAlbumReleaseCountry(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Release Country', value);
		return this;
	}

	mbTrackID(value?: string) {
		this.rawBuilder.idText('UFID', 'http://musicbrainz.org', value);
		return this;
	}

	mbReleaseTrackID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Release Track Id', value);
		return this;
	}

	mbAlbumID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Id', value);
		return this;
	}

	mbOriginalAlbumID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Original Album Id', value);
		return this;
	}

	mbArtistID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Artist Id', value);
		return this;
	}

	mbOriginalArtistID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Original Artist Id', value);
		return this;
	}

	mbAlbumArtistID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Album Artist Id', value);
		return this;
	}

	mbReleaseGroupID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Release Group Id', value);
		return this;
	}

	mbWorkID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Work Id', value);
		return this;
	}

	mbTRMID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz TRM Id', value);
		return this;
	}

	mbDiscID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Disc Id', value);
		return this;
	}

	acoustidID(value?: string) {
		this.rawBuilder.idText('TXXX', 'Acoustid Id', value);
		return this;
	}

	acoustidFingerprint(value?: string) {
		this.rawBuilder.idText('TXXX', 'Acoustid Fingerprint', value);
		return this;
	}

	musicIPPUID(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicIP PUID', value);
		return this;
	}

	comment(id: string, value?: string) {
		this.rawBuilder.idText('COMM', id, value);
		return this;
	}

	trackLength(value?: number | string) {
		this.rawBuilder.text('TLEN', value ? value.toString() : undefined);
		return this;
	}

	mbTrackDisambiguation(value?: string) {
		this.rawBuilder.idText('TXXX', 'MusicBrainz Track Disambiguation', value);
		return this;
	}

	addPicture(pictureType: number, description: string, mimeType: string, binary: any) {
		this.rawBuilder.addPicture('APIC', pictureType, description, mimeType, binary);
		return this;
	}

}
