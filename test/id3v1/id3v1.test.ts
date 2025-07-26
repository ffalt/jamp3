import { ID3v1 } from '../../src/lib/id3v1/id3v1';
import { compareID3v1Save, testOverWriteMock, compareID3v1Spec } from './id3v1.compare';
import { ID3v1TestDirectories, ID3v1TestPath } from './id3v1.config';
import { collectTestFilesSync } from '../common/common';

const testSingleFile: string | undefined = undefined; // 'id3v1_260_genre_F.mp3';

async function testLoadSaveSpec(filename: string): Promise<void> {
	const id3 = new ID3v1();
	const tag = await id3.read(filename);
	await compareID3v1Spec(filename, tag);
}

async function testLoadSaveCompare(filename: string): Promise<void> {
	const id3 = new ID3v1();
	const tag = await id3.read(filename);
	if (!tag) {
		return;
	}
	await compareID3v1Save(filename, tag);
}

describe('ID3v1', () => {
	const files: Array<[string, string]> = collectTestFilesSync(ID3v1TestDirectories, ID3v1TestPath, testSingleFile)
		.map(filename => [filename.slice(ID3v1TestPath.length), filename]);
	describe.each(files)('ID3v1: %s', (name, filename) => {
		it('should load & save & compare', async () => {
			await testLoadSaveCompare(filename);
		});
		it('should overwrite', async () => {
			await testOverWriteMock(filename);
		});
		it('should load & compare to spec', async () => {
			await testLoadSaveSpec(filename);
		});
	});
});
