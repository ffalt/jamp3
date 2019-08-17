import {ID3v1, IID3V1} from 'jamp3';

async function run(): Promise<void> {
	const id3v1 = new ID3v1();
	const filename = 'demo.mp3';
	const options: IID3V1.RemoveOptions = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const removed = await id3v1.remove(filename, options);
	if (removed) {
		console.log('id3v1 removed');
	}
}

run()
	.catch(e => {
		console.error(e);
	});
