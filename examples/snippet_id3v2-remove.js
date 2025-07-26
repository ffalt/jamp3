import jamp3 from "jamp3";

async function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = "demo.mp3";
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const removed = await id3v2.remove(filename, options);
	if (removed) {
		console.log("id3v2 removed");
	}
}

run().catch(console.error);
