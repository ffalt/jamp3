export interface ITestSpecFrame {
	[key: string]: number;

	offset: number;
	size: number;
	time: number;
	samples: number;
	channels: number;
}

interface ITestSpecFileInfo {
	index: number; // 0,
	codec_name: string; // 'mp3',
	codec_long_name: string; // 'MP3 (MPEG audio layer 3)',
	codec_type: string; // 'audio',
	codec_time_base: string; // '1/44100',
	codec_tag_string: string; // '[0][0][0][0]',
	codec_tag: string; // '0x0000',
	sample_fmt: string; // 'fltp',
	sample_rate: string; // '44100',
	channels: number; // 2,
	channel_layout: string; // 'stereo',
	bits_per_sample: number; // 0,
	r_frame_rate: string; // '0/0',
	avg_frame_rate: string; // '0/0',
	time_base: string; // '1/14112000',
	start_pts: number; // 353600,
	start_time: string; // '0.025057',
	duration_ts: number; // 524206080,
	duration: string; // '37.146122',
	bit_rate: string; // '254087',
	nb_read_frames: string; // '1421',
	disposition: {
		default: number; // 0,
		dub: number; // 0,
		original: number; // 0,
		comment: number; // 0,
		lyrics: number; // 0,
		karaoke: number; // 0,
		forced: number; // 0,
		hearing_impaired: number; // 0,
		visual_impaired: number; // 0,
		clean_effects: number; // 0,
		attached_pic: number; // 0,
		timed_thumbnails: number; // 0
	};
	tags: Record<string, string>; //  { encoder: 'LAME3.97 ' }
	side_data_list: Array<Record<string, string>>; //   [{ side_data_type: 'Replay Gain' }]
}

export interface ITestSpec {
	stream?: ITestSpecFileInfo;
	cols?: Array<string>;
	frames?: Array<Array<number>>;
}
