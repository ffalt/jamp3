import { program } from 'commander';
import fse from 'fs-extra';
import { ID3v1 } from '../lib/id3v1/id3v1.js';
import { runTool } from '../lib/common/tool.js';
import pack from '../../package.json' with { type: "json" };
program
    .version(pack.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder')
    .option('-r, --recursive', 'dump the folder recursive')
    .option('-d, --dest <file>', 'destination analyze result file')
    .parse(process.argv);
const id3v1 = new ID3v1();
const result = [];
async function onFile(filename) {
    const tag = await id3v1.read(filename);
    const dump = tag ? { filename, tag: tag } : { error: 'No tag found', filename };
    if (program.opts().dest) {
        result.push(dump);
    }
    else {
        console.log(JSON.stringify(dump, null, '\t'));
    }
}
async function run() {
    await runTool(program, onFile);
    if (program.opts().dest) {
        await fse.writeJSON(program.opts().dest, result);
    }
}
run().catch(error => {
    console.error(error);
});
//# sourceMappingURL=dumpID3v1.js.map