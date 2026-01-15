const addPathToUrl = (stringUrl: string, path: string): string => {
	const url = new URL(stringUrl);

	url.pathname = path;

	return url.toString();
};

export const getRuntimeURL = (path: string = ''): string => {
	const currentScript = document.currentScript;

	if (currentScript && currentScript instanceof HTMLScriptElement && currentScript.src) {
		return addPathToUrl(currentScript.src, path);
	}

	const item = window.sessionStorage.getItem('vms_public_path');
	if (item) {
		return addPathToUrl(item, path);
	}

	if (document.documentElement.dataset['vms_public_path']) {
		return addPathToUrl(document.documentElement.dataset['vms_public_path'], path);
	}

	throw new Error('[VK Music Saver] Runtime URL not found');
};
