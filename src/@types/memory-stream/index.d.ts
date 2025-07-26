declare module 'memory-stream' {
	import { WriteStream } from 'node:fs';

	class MemoryStream extends WriteStream {
		toString(): string;
	}

	export = MemoryStream;
}
