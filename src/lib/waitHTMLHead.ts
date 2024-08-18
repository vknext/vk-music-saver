let savePromise: Promise<HTMLHeadElement> | null = null;

const waitHTMLHead = async (forcePromise?: boolean): Promise<HTMLHeadElement> => {
	if (document?.head) return document.head;

	if (savePromise && !forcePromise) {
		return savePromise;
	}

	savePromise = new Promise<HTMLHeadElement>((resolve) => {
		if (document?.head) return resolve(document.head);

		const obs = new MutationObserver(() => {
			if (document?.head) {
				resolve(document.head);
				obs.disconnect();
			}
		});

		obs.observe(document.documentElement, { childList: true });
	});

	return await savePromise;
};

export default waitHTMLHead;
