import jamp3 from "jamp3";

async function run() {
	const id3v1 = new jamp3.ID3v1();
	const filename = "demo.mp3";
	const tag = id3v1.read(filename);
	console.log("id3v1:", tag);
}

run().catch(console.error);
