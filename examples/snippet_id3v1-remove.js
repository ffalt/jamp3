const ID3v1 = require('jamp3').ID3v1;

function run() {
	const id3v1 = new ID3v1();
	const filename = 'demo.mp3';
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	id3v1.remove(filename, options)
	.then(removed => {
		if (removed) {
			console.log('id3v1 removed');
		}
	}).catch(e => {
		console.error(e);
	})
}

run();
