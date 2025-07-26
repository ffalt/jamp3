import jamp3 from "jamp3";

async function run() {
	const mp3 = new jamp3.MP3();
	const filename = "demo.mp3";
	const options = {
		mpeg: true, // read mpeg information
		mpegQuick: true, // estimate mpeg information based on mpeg header (XING|Info) and stop reading if tags and header are found
		id3v2: true, // read ID3 v2 tag
		id3v1: false, // read ID3 v1 tag
		id3v1IfNotID3v2: true, // read ID3 v1 tag only if no ID3 v2 tag is found (stops reading otherwise)
		raw: false // do not parse frames & return all frames as binary blobs
	};
	const data = await mp3.read(filename, options);
	console.log("mp3:", data);
}

run().catch(console.error);
