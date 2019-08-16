const jamp3 = require('jamp3');

function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = 'demo.mp3';
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	id3v2.remove(filename, options)
	.then(removed => {
		if (removed) {
			console.log('id3v2 removed');
		}
	}).catch(e => {
		console.error(e);
	})
}

run();
