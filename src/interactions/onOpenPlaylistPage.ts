import ListenerRegistry from 'src/common/ListenerRegistry';
import waitNav from 'src/globalVars/waitNav';
import delay from 'src/lib/delay';
import onDocumentComplete from 'src/lib/onDocumentComplete';
import waitRAF from 'src/lib/waitRAF';

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
		console.info('[VMS/interactions/onOpenPlaylistPage] count: ' + registry.listeners.length, registry);
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
