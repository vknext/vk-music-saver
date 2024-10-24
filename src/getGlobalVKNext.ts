import type { VKNext } from 'src/global';

const vknextObject = {};

const getGlobalVKNext = (): VKNext => {
	try {
		if ('vknext' in globalThis) {
			return globalThis.vknext;
		}

		globalThis.vknext = vknextObject;
	} catch (e) {
		console.error(e);
	}

	return vknextObject;
};

export default getGlobalVKNext;
