import fse from 'fs-extra';
import { MP3Reader } from '../mp3/mp3.reader.js';
import { FileWriterStream } from './stream-writer-file.js';
export async function updateFile(filename, options, keepBackup, canProcess, process) {
    const reader = new MP3Reader();
    const layout = await reader.read(filename, options);
    if (!canProcess(layout)) {
        return;
    }
    const tmpFile = `${filename}.tempmp3`;
    const bakFile = `${filename}.bak`;
    const cleanupTmp = async () => {
        if (await fse.pathExists(tmpFile)) {
            await fse.remove(tmpFile);
        }
    };
    const fileWriterStream = new FileWriterStream();
    await fileWriterStream.open(tmpFile);
    let renamedOriginalToBackup = false;
    try {
        await process(layout, fileWriterStream);
        await fileWriterStream.close();
        if (keepBackup && !(await fse.pathExists(bakFile))) {
            await fse.rename(filename, bakFile);
            renamedOriginalToBackup = true;
        }
        await fse.rename(tmpFile, filename);
    }
    catch (error) {
        try {
            await fileWriterStream.close();
        }
        catch {
        }
        if (renamedOriginalToBackup && !(await fse.pathExists(filename)) && await fse.pathExists(bakFile)) {
            await fse.rename(bakFile, filename);
        }
        await cleanupTmp();
        return Promise.reject(error);
    }
}
//# sourceMappingURL=update-file.js.map