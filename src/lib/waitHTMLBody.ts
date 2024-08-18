let savePromise: Promise<HTMLElement> | null = null;

const waitHTMLBody = async (forcePromise?: boolean): Promise<HTMLElement> => {
	if (document.body) return document.body;

	if (savePromise && !forcePromise) {
		return savePromise;
	}

	savePromise = new Promise<HTMLElement>((resolve) => {
		if (document.body) return resolve(document.body);

		const obs = new MutationObserver(() => {
			if (document.body) {
				resolve(document.body);
				obs.disconnect();
			}
		});

		obs.observe(document.documentElement, { childList: true });
	});

	return await savePromise;
};

export default waitHTMLBody;
