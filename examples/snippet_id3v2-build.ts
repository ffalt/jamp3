import {ID3v2, ID3V24TagBuilder, IID3V2} from 'jamp3';

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';

	const builder = new ID3V24TagBuilder(ID3V24TagBuilder.encodings.utf8);
	builder
		.album('An album')
		.artist('An artist')
		.artistSort('artist, An')
		.title('A title');

	const options: IID3V2.WriteOptions = {
		keepBackup: true, // keep a filename.mp3.bak copy of the original file
		paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
	};
	await id3v2.writeBuilder(filename, builder, options);
	console.log('id3v2.4 written');
}

run().catch(e => {
	console.error(e);
});
