export const LOGICAL_CPU_CORES = navigator.hardwareConcurrency || 1;

export const MAX_PARALLEL_AUDIO_CONVERSION = Math.max(1, Math.floor(LOGICAL_CPU_CORES / 2));

export const IS_DIRECTORY_PICKER_SUPPORTED = 'showDirectoryPicker' in window;

export const IS_FIREFOX = /firefox|fxios/i.test(globalThis.navigator.userAgent);
