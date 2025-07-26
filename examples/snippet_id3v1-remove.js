import jamp3 from "jamp3";

async function run() {
	const id3v1 = new jamp3.ID3v1();
	const filename = "demo.mp3";
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const removed = await id3v1.remove(filename, options);
	if (removed) {
		console.log("id3v1 removed");
	}
}

run().catch(console.error);
