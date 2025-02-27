import ListenerRegistry from 'src/common/ListenerRegistry';
import waitAudioUtils from 'src/globalVars/waitAudioUtils';
import waitNav from 'src/globalVars/waitNav';
import objectHook from 'src/lib/objectHook';
import onDocumentComplete from 'src/lib/onDocumentComplete';

type CallbackFunc = (el: HTMLElement) => void;

const registry = new ListenerRegistry<CallbackFunc>();

const onCallback = (el: HTMLElement) => {
	for (const callback of registry.listeners) {
		callback(el);
	}
};

const findPlayerWrap = () => {
	for (const wrap of document.querySelectorAll<HTMLElement>('.AudioPlayerBlock__root')) {
		onCallback(wrap);
	}
};

const hookAudioLayer = async () => {
	const AudioUtils = await waitAudioUtils();

	const layer = AudioUtils.getLayer();

	if (!layer._initSection) {
		layer._initSection = undefined;
	}

	objectHook(layer, '_initSection', findPlayerWrap);
};

let inited = false;
const onAddAudioPagePlayerWrap = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddAudioPagePlayerWrap] count: ${registry.listeners.length}`, registry);
	}

	onDocumentComplete(findPlayerWrap);

	if (!inited) {
		inited = true;

		waitNav().then((nav) => {
			nav.onLocationChange((locStr) => {
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
