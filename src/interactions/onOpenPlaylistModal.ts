import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import { delay } from '@vknext/shared/utils/delay';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import { waitRAF } from '@vknext/shared/utils/waitRAF';
import { waitNav } from '@vknext/shared/vkcom/globalVars/waitNav';

type CallbackFunc = (playlistFullId: string) => void;

const registry = new ListenerRegistry<CallbackFunc>();

const getPlaylistFullId = (z: string) => {
	return z.replace('audio_playlist', '').replace('/', '_');
};

const onCallback = (z: string) => {
	const playlistFullId = getPlaylistFullId(z);

	for (const callback of registry.listeners) {
		callback(playlistFullId);
	}
};

let isInjected = false;
const initHook = async () => {
	if (isInjected) return;
	isInjected = true;

	const nav = await waitNav();

	nav.onLocationChange(async () => {
		const z = nav.objLoc['z'];
		if (z && z.startsWith('audio_playlist')) {
			await delay(1000);
			await waitRAF();

			onCallback(z);
		}
	});
};

const onOpenPlaylistModal = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info('[VK Music Saver/interactions/onOpenPlaylistPage] count: ' + registry.listeners.length, registry);
	}

	onDocumentComplete(() => {
		const z = new URLSearchParams(window.location.search).get('z');
		if (z && z.startsWith('audio_playlist')) {
			requestAnimationFrame(() => callback(getPlaylistFullId(z)));
		}

		initHook();
	});

	return listener;
};

export default onOpenPlaylistModal;
