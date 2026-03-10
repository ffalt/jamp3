import { BufferUtils } from '../../common/buffer';

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

export function needsUnsync(data: Buffer): boolean {
	for (let i = 0; i < data.length; i++) {
		if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
			return true;
		}
	}
	return false;
}

export function applyUnsync(data: Buffer): Buffer {
	if (!needsUnsync(data)) {
		return data;
	}
	let count = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
			count++;
		}
	}
	const result = BufferUtils.zeroBuffer(data.length + count);
	let pos = 0;
	for (let i = 0; i < data.length; i++) {
		result[pos++] = data[i];
		if (data[i] === 0xFF && (i + 1 >= data.length || data[i + 1] === 0x00 || data[i + 1] >= 0xE0)) {
			result[pos++] = 0x00;
		}
	}
	return result;
}
