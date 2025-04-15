const logicalCores = navigator.hardwareConcurrency || 1;

export const MAX_PARALLEL_AUDIO_CONVERSION = Math.max(1, Math.floor(logicalCores / 2));
