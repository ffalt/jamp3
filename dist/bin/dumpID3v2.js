import fse from 'fs-extra';
import { program } from 'commander';
import { runTool } from '../lib/common/tool.js';
import { ID3v2 } from '../lib/id3v2/id3v2.js';
import { toPrettyJsonWithBin } from '../lib/common/pretty-json.js';
import pack from '../../package.json' with { type: "json" };
program
    .version(pack.version, '-v, --version')
    .usage('[options]')
    .option('-i, --input <fileOrDir>', 'mp3 file or folder')
    .option('-r, --recursive', 'dump the folder recursive')
    .option('-f, --full', 'full tag output (simple otherwise)')
    .option('-d, --dest <file>', 'destination analyze result file')
    .parse(process.argv);
const id3v2 = new ID3v2();
const result = [];
async function onFile(filename) {
    const tag = await id3v2.read(filename);
    const dump = tag ? { filename, tag: program.opts().full ? tag : ID3v2.simplify(tag) } : { error: 'No tag found', filename };
    if (program.opts().dest) {
        result.push(dump);
    }
    else if (program.opts().full) {
        console.log(toPrettyJsonWithBin(dump));
    }
    else {
        console.log(JSON.stringify(dump, null, '\t'));
    }
}
async function run() {
    await runTool(program, onFile);
    if (program.opts().dest) {
        await fse.writeFile(program.opts().dest, toPrettyJsonWithBin(result));
    }
}
run().catch(error => {
    console.error(error);
});
//# sourceMappingURL=dumpID3v2.js.map