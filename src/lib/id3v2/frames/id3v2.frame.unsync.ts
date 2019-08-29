import {BufferUtils} from '../../common/buffer';

export function removeUnsync(data: Buffer): Buffer {
	const result = BufferUtils.zeroBuffer(data.length);
	result[0] = data[0];
	let pos = 1;
	for (let i = 1; i < data.length; i++) {
		if (data[i] === 0 && data[i - 1] === 0xFF) {
			// nope
		} else {
			result[pos] = data[i];
			pos++;
		}
	}
	return result.slice(0, pos);
}
