import {MP3Analyzer, IMP3Analyzer} from 'jam';

async function run(): Promise<void> {
	const mp3Analyzer = new MP3Analyzer();
	const filename = 'demo.mp3';
	const options: IMP3Analyzer.Options = {
		mpeg: true, // test for mpeg warnings
		id3v2: true, // test for id3v2 warnings
		id3v1: true, // test for id3v1 warnings
		xing: true, // test for frame head xing warnings
		ignoreXingOffOne: false // ignore most common error in off-by-one XING header declaration
	};
	const data = await mp3Analyzer.read(filename, options);
	console.log('report:', data);
}

run().catch(e => {
	console.error(e);
});
