const ANY_RAW_ID_REGEXP = /^(-?\d+)_(-?\d+)(_[a-z0-9]+)?$/;

export const isAnyRawId = (rawId: string) => ANY_RAW_ID_REGEXP.test(rawId);
