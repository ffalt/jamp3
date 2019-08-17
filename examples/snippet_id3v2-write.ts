import {ID3v2, IID3V2} from 'jamp3';

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const tag: IID3V2.ID3v2Tag = {
		frames: [
			{
				id: 'TIT2',
				value: {text: 'A title'},
				head: {
					encoding: 'utf8'
				}
			},
			{
				id: 'TALB',
				value: {text: 'An album'},
				head: {
					encoding: 'ucs2'
				}
			}
		]
	};
	const options: IID3V2.WriteOptions = {
		defaultEncoding: 'utf8', // encoding used if not specified in frame header
		keepBackup: true, // keep a filename.mp3.bak copy of the original file
		paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
	};
	const version = 4;  // version: 2 = v2.2; 3 = v2.3; 4 = v2.4
	await id3v2.write(filename, tag, version, 0, options);
	console.log('id3v2.4 written');
}

run().catch(e => {
	console.error(e);
});
