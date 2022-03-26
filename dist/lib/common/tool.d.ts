import { Command } from 'commander';
export declare function runTool(program: Command, onFile: (filename: string) => Promise<void>): Promise<undefined>;
