const jamp3 = require('../src');//('jamp3')

function run() {
	const id3v2 = new jamp3.ID3v2();
	const filename = 'demo.mp3';
	const tag = {
		frames: [
			{
				'id': 'TIT2',
				'value': {'text': 'A title'}
			},
			{
				'id': 'TALB',
				'value': {'text': 'An album'}
			},
		]
	};
	const options = {
		keepBackup: true // keep a filename.mp3.bak copy of the original file
	};
	const version = 4;  // version: 2 = v2.2; 3 = v2.3; 4 = v2.4
	id3v2.write(filename, tag, version, 0, options)
	.then(() => {
		console.log('id3v2.4 written');
	})
	.catch(e => {
		console.error(e);
	});
}

run();
