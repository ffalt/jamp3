import {ID3v1Reader} from './id3v1_reader';
import {ID3v1Writer} from './id3v1_writer';
import {IID3V1} from './id3v1__types';

export class ID3v1 {

	async read(filename: string): Promise<IID3V1.Tag | undefined> {
		const reader = new ID3v1Reader();
		return await reader.read(filename);
	}

	async write(filename: string, tag: IID3V1.Tag, version: number): Promise<void> {
		const writer = new ID3v1Writer();
		await writer.write(filename, tag, version);
	}

}

