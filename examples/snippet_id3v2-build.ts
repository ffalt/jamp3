import {ID3v2, ID3V24TagBuilder, IID3V2} from '../src'; // 'jamp3'

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const builder24 = new ID3V24TagBuilder();
	builder24
		.album('An album')
		.title('A title');
	const options: IID3V2.WriteOptions = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	await id3v2.writeBuilder(filename, builder24, options);
	console.log('id3v2.4 written');
}

run()
	.catch(e => {
		console.error(e);
	});
