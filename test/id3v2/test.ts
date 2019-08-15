import {should, use} from 'chai';
import {describe, it, run} from 'mocha';
import {ID3v2} from '../../src/lib/id3v2/id3v2';
import chaiExclude from 'chai-exclude';
import {ID3v2TestDirectories, ID3v2TestPath} from './id3v2_test_config';
import {collectTestFiles} from '../common/common';
import {testLoadSaveCompare} from './id3v2_test_load-save-compare';
import {testLoadSaveSpec} from './id3v2_test_spec';

use(chaiExclude);

const testSingleFile: string | undefined = undefined;

describe('ID3v2', async () => {
	it('should reject the promise not send an unhandled stream error', (done) => {
		const id3 = new ID3v2();
		id3.read('notexistingfilename').then(() => {
			throw new Error('should not return success');
		}).catch(e => {
			should().exist(e);
			done();
		});
	});
	const files: Array<string> = await collectTestFiles(ID3v2TestDirectories, ID3v2TestPath, testSingleFile);
	for (const file of files) {
		describe(file.slice(ID3v2TestPath.length), () => {
			it('should load & save & compare', async () => {
				await testLoadSaveCompare(file);
			});
			it('should load & compare to spec', async () => {
				await testLoadSaveSpec(file);
			});
		});
	}
	run(); // https://github.com/mochajs/mocha/issues/2221#issuecomment-214636042
});

