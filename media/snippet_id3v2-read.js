import jamp3 from "jamp3";

async function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = "demo.mp3";
	const tag = id3v2.read(filename);
	console.log("id3v2:", tag);
}

run().catch(console.error);
