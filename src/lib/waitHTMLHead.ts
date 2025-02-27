export interface HTMLHeadTaskQueueS {
	_handlers: Record<string | symbol, any>;
	[key: string | symbol]: any;
}

interface ExtendedHTMLHeadElement extends HTMLHeadElement {
	_tqs?: HTMLHeadTaskQueueS;
}

let savePromise: Promise<ExtendedHTMLHeadElement> | null = null;

const waitHTMLHead = async (forcePromise?: boolean): Promise<ExtendedHTMLHeadElement> => {
	if (document?.head) return document.head;

	if (savePromise && !forcePromise) {
		return savePromise;
	}

	savePromise = new Promise<ExtendedHTMLHeadElement>((resolve) => {
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
