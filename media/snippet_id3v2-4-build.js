import jamp3 from "jamp3";

async function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = "demo.mp3";

	const builder24 = new jamp3.ID3V24TagBuilder();
	builder24
		.album("An album")
		.artist("An artist")
		.artistSort("artist, An")
		.title("A title");

	const options = {
		keepBackup: true, // keep a filename.mp3.bak copy of the original file
		paddingSize: 10 // add padding zeros between id3v2 and the audio (in bytes)
	};
	await id3v2.writeBuilder(filename, builder24, options);
	console.log("id3v2.4 written");
}

run().catch(console.error);
