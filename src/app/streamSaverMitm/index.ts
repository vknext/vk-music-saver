import { StreamSaverMitm } from '@vknext/shared/lib/streamSaver/mitm/mitm';

const FALLBACK_URL = 'https://vknext.net/saver';

const getSwUrl = () => {
	if (typeof chrome !== 'undefined' && chrome?.runtime) {
		return chrome.runtime.getURL('mitmWorker.vms.js');
	}

	return './mitmWorker.vms.js';
};

if (!navigator.serviceWorker) {
	location.href = FALLBACK_URL;
} else {
	const mitm = new StreamSaverMitm({
		swUrl: getSwUrl(),
		scope: 'saver/',
	});

	// @ts-expect-error TODO: типизировать или убрать
	globalThis.mitm = mitm;
}
