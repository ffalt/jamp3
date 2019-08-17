import {ID3v1, IID3V1} from 'jamp3';

async function run(): Promise<void> {
	const id3v1 = new ID3v1();
	const filename = 'demo.mp3';
	const newTag: IID3V1.ID3v1Tag = {
		title: 'A Title', // max length 30
		artist: 'B Artist', // max length 30
		album: 'C Artist', // max length 30
		year: '2019', // length 4
		comment: 'D Comment', // max length 28 (v1.1) / 30 (v1.0)
		track: 5, // only in v1.1
		genreIndex: 1
	};
	const options: IID3V1.WriteOptions = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const version = 1;  // version: 1 = v1.1; 0 = v1.0
	await id3v1.write(filename, newTag, version, options);
	console.log('id3v1.1 written');
}

run().catch(e => {
	console.error(e);
});
