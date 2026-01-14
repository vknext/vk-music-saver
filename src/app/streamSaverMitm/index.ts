import { StreamSaverMitm } from '@vknext/shared/lib/streamSaver/mitm/mitm';

const getSwUrl = () => {
	if (typeof chrome !== 'undefined' && chrome?.runtime) {
		return chrome.runtime.getURL('mitmWorker.vms.js');
	}

	return './mitmWorker.vms.js';
};

const mitm = new StreamSaverMitm({
	swUrl: getSwUrl(),
	scope: 'saver/',
});

// @ts-expect-error а зачем?
globalThis.mitm = mitm;
