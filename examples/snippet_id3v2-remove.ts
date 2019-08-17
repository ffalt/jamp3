import {ID3v2, IID3V2} from 'jamp3';

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const options: IID3V2.RemoveOptions = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const removed = await id3v2.remove(filename, options);
	if (removed) {
		console.log('id3v2 removed');
	}
}

run()
	.catch(e => {
		console.error(e);
	});
