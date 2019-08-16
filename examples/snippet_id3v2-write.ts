import {ID3v2, IID3V2} from '../src'; // 'jamp3'

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const tag: IID3V2.ID3v2 = {
		frames: [
			{
				'id': 'TIT2',
				'value': {'text': 'A title'}
			},
			{
				'id': 'TALB',
				'value': {'text': 'An album'}
			},
		]
	};
	const options: IID3V2.WriteOptions = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const version = 4;  // version: 2 = v2.2; 3 = v2.3; 4 = v2.4
	await id3v2.write(filename, tag, version, 0, options);
	console.log('id3v2.4 written');
}

run()
	.catch(e => {
		console.error(e);
	});
