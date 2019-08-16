const jamp3 = require('jamp3');

function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = 'demo.mp3';
	id3v2.read(filename)
	.then(tag => {
		console.log('id3v2:', tag);
	})
	.catch(e => {
		console.error(e);
	})
}

run();
