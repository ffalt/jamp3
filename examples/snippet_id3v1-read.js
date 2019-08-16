const jamp3 = require('../src');//('jamp3')

function run() {
	const id3v1 = new jamp3.ID3v1();
	const filename = 'demo.mp3';
	id3v1.read(filename)
	.then(tag => {
		console.log('id3v1:', tag);
	})
	.catch(e => {
		console.error(e);
	})
}

run();
