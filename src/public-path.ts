/**
 * требуется для подключения динамических скриптов
 */
const getPublicPath = () => {
	try {
		const item = window.sessionStorage.getItem('vms_public_path');
		if (item) {
			return item;
		}

		if (document.currentScript instanceof HTMLScriptElement) {
			return new URL(document.currentScript.src).origin;
		}

		if (document.documentElement.dataset['vms_public_path']) {
			return document.documentElement.dataset['vms_public_path'];
		}
	} catch (e) {
		console.error('[VMS/public-path]', e);
	}

	return '';
};

// @ts-ignore
__webpack_public_path__ = getPublicPath();
