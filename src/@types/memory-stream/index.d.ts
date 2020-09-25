declare module 'memory-stream' {

	import {WriteStream} from 'fs';

	class MemoryStream extends WriteStream {
		toString(): string;
	}

	export = MemoryStream;

}
