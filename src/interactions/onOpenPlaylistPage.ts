import waitNav from 'src/globalVars/waitNav';
import delay from 'src/lib/delay';
import onDocumentComplete from 'src/lib/onDocumentComplete';
import waitRAF from 'src/lib/waitRAF';
import InteractionListener from './InteractionListener';

type CallbackFunc = () => void;

const interaction = new InteractionListener<CallbackFunc>();

const onCallback = () => {
	for (const callback of interaction.listeners) {
		callback();
	}
};

let isInjected = false;
const initHook = async () => {
	if (isInjected) return;
	isInjected = true;

	await waitNav();

	window.nav.onLocationChange(async (locStr) => {
		if (locStr.startsWith('music/album') || locStr.startsWith('music/playlist')) {
			await delay(1000);
			await waitRAF();

			onCallback();
		}
	});
};

const onOpenPlaylistPage = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info('[VMS/interactions/onOpenPlaylistPage] count: ' + interaction.listeners.length, interaction);
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
