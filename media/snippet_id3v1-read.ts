import { ID3v1 } from 'jamp3';

async function run(): Promise<void> {
	const id3v1 = new ID3v1();
	const filename = 'demo.mp3';
	const tag = await id3v1.read(filename);
	console.log('id3v1:', tag);
}

run().catch(console.error);
