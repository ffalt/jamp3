import {ID3v2} from '../src'; // 'jamp3'

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const tag = await id3v2.read(filename);
	console.log('id3v2:', tag);
}

run()
	.catch(e => {
		console.error(e);
	});
