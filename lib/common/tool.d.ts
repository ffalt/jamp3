import commander from 'commander';
export declare function runTool(program: commander.CommanderStatic, onFile: (filename: string) => Promise<void>): Promise<undefined>;
