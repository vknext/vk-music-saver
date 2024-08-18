import waitAudioLayer from 'src/globalVars/waitAudioLayer';
import waitNav from 'src/globalVars/waitNav';
import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import objectHook from 'src/lib/objectHook';
import InteractionListener from './InteractionListener';

type CallbackFunc = (el: HTMLElement) => void;

const interaction = new InteractionListener<CallbackFunc>();

const onCallback = (el: HTMLElement) => {
	for (const callback of interaction.listeners) {
		callback(el);
	}
};

const findPlayerWrap = () => {
	for (const wrap of document.querySelectorAll<HTMLElement>('.AudioPlayerBlock__root')) {
		onCallback(wrap);
	}
};

const hookAudioLayer = async () => {
	await waitAudioLayer();

	if (!window.audioLayer._initSection) {
		window.audioLayer._initSection = undefined;
	}

	objectHook(window.audioLayer, '_initSection', findPlayerWrap);
};

let inited = false;
const onAddAudioPagePlayerWrap = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	DOMContentLoaded(findPlayerWrap);

	if (!inited) {
		inited = true;

		waitNav().then(() => {
			window.nav.onLocationChange((locStr) => {
				if (locStr.startsWith('audio')) {
					findPlayerWrap();
				}
			});

			hookAudioLayer().catch(console.error);
		});
	}

	return listener;
};

export default onAddAudioPagePlayerWrap;
