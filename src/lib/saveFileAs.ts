const download = async (url: string, name: string) => {
	try {
		const response = await globalThis.fetch(url, { method: 'GET' });
		const rBlob = await response.blob();
		await saveFileAs(rBlob, name);
	} catch (e) {
		console.error(e);
	}
};

const corsEnabled = async (url: string) => {
	try {
		const response = await globalThis.fetch(url, { method: 'HEAD' });

		return response.status >= 200 && response.status <= 299;
	} catch (e) {
		console.error(e);
	}

	return false;
};
// `a.click()` doesn't work for all browsers
const click = (node: HTMLElement) => {
	try {
		node.dispatchEvent(new MouseEvent('click'));
	} catch (e) {
		const evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
		node.dispatchEvent(evt);
	}
};

const saveFileAs = async (blob: Blob | string, name: string = 'download') => {
	const a = document.createElement('a');
	a.download = name;
	a.rel = 'noopener'; // tabnabbing
	if (globalThis?.chrome?.runtime?.id) {
		a.target = '_blank';
	}

	if (typeof blob === 'string') {
		// Support regular links
		a.href = blob;

		if (a.origin !== location.origin) {
			if (await corsEnabled(a.href)) {
				await download(blob, name);
			} else {
				a.target = '_blank';
				click(a);
			}
		} else {
			click(a);
		}
	} else {
		// Support blobs
		a.href = URL.createObjectURL(blob);
		setTimeout(() => {
			URL.revokeObjectURL(a.href);
		}, 4e4); // 40s

		setTimeout(() => {
			click(a);
		}, 0);
	}
};

export default saveFileAs;
