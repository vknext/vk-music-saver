import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import { delay } from '@vknext/shared/utils/delay';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import { waitRAF } from '@vknext/shared/utils/waitRAF';
import { waitNav } from '@vknext/shared/vkcom/globalVars/waitNav';

type CallbackFunc = () => void;

const registry = new ListenerRegistry<CallbackFunc>();

const onCallback = () => {
	for (const callback of registry.listeners) {
		callback();
	}
};

let isInjected = false;
const initHook = async () => {
	if (isInjected) return;
	isInjected = true;

	const nav = await waitNav();

	nav.onLocationChange(async (locStr) => {
		if (locStr.startsWith('music/album') || locStr.startsWith('music/playlist')) {
			await delay(1000);
			await waitRAF();

			onCallback();
		}
	});
};

const onOpenPlaylistPage = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info('[VK Music Saver/interactions/onOpenPlaylistPage] count: ' + registry.listeners.length, registry);
	}

	onDocumentComplete(() => {
		if (
			window.location.pathname.startsWith('/music/album') ||
			window.location.pathname.startsWith('/music/playlist')
		) {
			requestAnimationFrame(() => callback());
		}

		initHook();
	});

	return listener;
};

export default onOpenPlaylistPage;
