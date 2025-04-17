export const LOGICAL_CPU_CORES = globalThis.navigator.hardwareConcurrency || 1;

export const MAX_PARALLEL_AUDIO_CONVERSION = Math.max(1, Math.floor(LOGICAL_CPU_CORES / 2));

export const IS_DIRECTORY_PICKER_SUPPORTED = 'showDirectoryPicker' in globalThis;

export const IS_FIREFOX = /firefox|fxios/i.test(globalThis.navigator.userAgent);

export const CHROME_REVIEW_URL = 'https://chromewebstore.google.com/detail/ijgkbcbalaekboipcmaefchfjpognmog/reviews';
export const FIREFOX_REVIEW_URL = 'https://addons.mozilla.org/ru/firefox/addon/vk-music-saver/reviews';

export const VKNEXT_SITE_URL = 'https://vknext.net';

export const VKNEXT_GROUP_DOMAIN = 'vknext';
export const VKNEXT_DONUT_URL = `https://vk.com/donut/vknext`;
