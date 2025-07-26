import { ID3v2 } from 'jamp3';

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';
	const tag = await id3v2.read(filename);
	if (tag) {
		console.log('id3v2:', tag);
		console.log(ID3v2.simplify(tag)); // combine frames into one simple tag object
	} else {
		console.log('id3v2: None found');
	}
}

run().catch(console.error);
