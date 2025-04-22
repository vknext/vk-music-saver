import addScript from 'src/lib/dom/addScript';

if (process.env.NODE_ENV === 'development') {
	console.info('[VK Music Saver] Content start');
}

if (document.documentElement instanceof HTMLHtmlElement) {
	try {
		window.sessionStorage.setItem('vms_public_path', chrome.runtime.getURL(''));
	} catch (e) {
		document.documentElement.dataset['vms_public_path'] = chrome.runtime.getURL('');
	}

	// @ts-ignore
	const scripts: string[] = window.vms;

	if (scripts && document.documentElement instanceof HTMLHtmlElement) {
		for (const script of scripts) {
			try {
				addScript({ src: chrome.runtime.getURL(script) });
			} catch (e) {
				console.error(e);
			}
		}
	}
}
