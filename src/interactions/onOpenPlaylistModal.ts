import waitNav from 'src/globalVars/waitNav';
import delay from 'src/lib/delay';
import onDocumentComplete from 'src/lib/onDocumentComplete';
import waitRAF from 'src/lib/waitRAF';
import InteractionListener from './InteractionListener';

type CallbackFunc = (playlistFullId: string) => void;

const interaction = new InteractionListener<CallbackFunc>();

const getPlaylistFullId = (z: string) => {
	return z.replace('audio_playlist', '').replace('/', '_');
};

const onCallback = (z: string) => {
	const playlistFullId = getPlaylistFullId(z);

	for (const callback of interaction.listeners) {
		callback(playlistFullId);
	}
};

let isInjected = false;
const initHook = async () => {
	if (isInjected) return;
	isInjected = true;

	await waitNav();

	window.nav.onLocationChange(async () => {
		const z = window.nav.objLoc['z'];
		if (z && z.startsWith('audio_playlist')) {
			await delay(1000);
			await waitRAF();

			onCallback(z);
		}
	});
};

const onOpenPlaylistModal = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info('[VMS/interactions/onOpenPlaylistPage] count: ' + interaction.listeners.length, interaction);
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
