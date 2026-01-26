export const LOGICAL_CPU_CORES = globalThis.navigator.hardwareConcurrency || 1;

export const MAX_PARALLEL_AUDIO_CONVERSION = 3;

export const IS_DIRECTORY_PICKER_SUPPORTED = 'showDirectoryPicker' in globalThis;
export const IS_SAVE_FILE_PICKER_SUPPORTED = 'showSaveFilePicker' in globalThis;

export const IS_FIREFOX = /firefox|fxios/i.test(globalThis.navigator.userAgent);

export const CHROME_REVIEW_URL = 'https://chromewebstore.google.com/detail/ijgkbcbalaekboipcmaefchfjpognmog/reviews';
export const FIREFOX_REVIEW_URL = 'https://addons.mozilla.org/ru/firefox/addon/vk-music-saver/reviews';

export const VKNEXT_SITE_URL = 'https://vknext.net';

export const VKNEXT_GROUP_DOMAIN = 'vknext';
export const VKNEXT_DONUT_URL = `https://vknext.net/donate`;

export const enum TrackTemplateVariable {
	ARTIST = '{artist}',
	TITLE = '{title}',
	SUBTITLE = '{subtitle}',
	BITRATE = '{bitrate}',
	INDEX = '{index}',
}

const TRACK_TEMPLATE_PRESETS_BASE: string[] = [
	`${TrackTemplateVariable.ARTIST} - ${TrackTemplateVariable.TITLE} ${TrackTemplateVariable.SUBTITLE}`, // по умолчанию
	`${TrackTemplateVariable.ARTIST} - ${TrackTemplateVariable.TITLE}`,
	`${TrackTemplateVariable.ARTIST} ${TrackTemplateVariable.SUBTITLE} - ${TrackTemplateVariable.TITLE}`,
	`${TrackTemplateVariable.TITLE}`,
] as const;

const TRACK_TEMPLATE_PRESETS_WITH_BITRATE: string[] = TRACK_TEMPLATE_PRESETS_BASE.map(
	(template) => `${template} ${TrackTemplateVariable.BITRATE}`
);

export const TRACK_TEMPLATE_PRESETS: string[] = [
	...TRACK_TEMPLATE_PRESETS_BASE,
	...TRACK_TEMPLATE_PRESETS_WITH_BITRATE,
];

export const DEFAULT_TRACK_TEMPLATE = TRACK_TEMPLATE_PRESETS_BASE[0];
