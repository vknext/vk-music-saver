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

	// такого не может быть
	// TODO: брать url из контент скрипта
	throw new Error('Runtime URL not found');
};
