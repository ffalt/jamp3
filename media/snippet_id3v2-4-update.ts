import { ID3v2, ID3V24TagBuilder, IID3V2 } from 'jamp3';
import { readFileSync } from 'node:fs';

async function run(): Promise<void> {
	const id3v2 = new ID3v2();
	const filename = 'demo.mp3';

	// Read the existing tag
	const existingTag = await id3v2.read(filename);

	// Initialize the builder from the existing tag to preserve all frames
	const builder = new ID3V24TagBuilder(ID3V24TagBuilder.encodings.utf8);
	if (existingTag) {
		builder.loadTag(existingTag);
	}

	// Single-value frames (title, artist, …) are replaced by their setter.
	// Multi-value frames (picture, comment, …) are appended — use the
	// matching clear…() method first when you want to replace them.
	const coverBuffer = readFileSync('cover.jpg');
	builder
		.title('Updated title')
		.artist('Updated artist')
		.clearPictures() // remove existing artwork
		.picture(3, '', 'image/jpeg', coverBuffer); // attach new artwork

	const options: IID3V2.WriteOptions = {
		keepBackup: true, // keep a filename.mp3.bak copy of the original file
		paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
	};
	await id3v2.writeBuilder(filename, builder, options);
	console.log('id3v2.4 updated');
}

run().catch(console.error);
