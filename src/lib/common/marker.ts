export class Markers {
	public static MARKERS: Record<string, Array<number>> = {
		tag: Markers.makeMarker('TAG'),
		id3: Markers.makeMarker('ID3'),
		xing: Markers.makeMarker('Xing'),
		info: Markers.makeMarker('Info'),
		vbri: Markers.makeMarker('VBRI')
	};

	public static makeMarker(str: string): Array<number> {
		const mark = [];
		for (let i = 0; i < str.length; i++) {
			mark.push(str.codePointAt(i) || 0);
		}
		return mark;
	}

	public static isMarker(buffer: Buffer, offset: number, marker: Array<number>): boolean {
		if (buffer.length - offset < marker.length) {
			return false;
		}
		for (let i = marker.length - 1; i >= 0; i--) {
			if (marker[i] !== buffer.readUInt8(offset + i)) {
				return false;
			}
		}
		return true;
	}
}
