const jamp3 = require('jamp3');

function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = 'demo.mp3';
	const builder24 = new jamp3.ID3V24TagBuilder();
	builder24
	.album('An album')
	.title('A title');
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	id3v2.writeBuilder(filename, builder24, options)
	.then(() => {
		console.log('id3v2.4 written');
	})
	.catch(e => {
		console.error(e);
	});
}

run();

