import ListenerRegistry from 'src/common/ListenerRegistry';
import { generateObservedElementMBSKey } from 'src/common/observedHTMLElements/generateKeys';
import type { ObservedHTMLElement } from 'src/global';
import delay from 'src/lib/delay';
import getReactAttrs from 'src/lib/getReactAttrs';
import onDocumentComplete from 'src/lib/onDocumentComplete';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';
import type { AudioAudio } from 'src/schemas/objects';
import onOpenPlaylistModal from './onOpenPlaylistModal';
import onOpenPlaylistPage from './onOpenPlaylistPage';

type CallbackFunc = (el: HTMLElement, audio: AudioAudio | null) => void;

const registry = new ListenerRegistry<CallbackFunc>();

const AUDIO_LIST_ITEMS_MBS_KEY = generateObservedElementMBSKey();

const AUDIO_ROW_SELECTOR = '[class*="AudioRow__root"]';

const findApiAudio = (el: HTMLElement): AudioAudio | null => {
	const { fiber, props: audioRowProps } = getReactAttrs(el);

	const apiAudio =
		fiber?.return?.return?.return?.return?.return?.return?.return?.return?.return?.memoizedProps?.audio?.apiAudio ||
		fiber?.return?.return?.return?.return?.return?.return?.return?.return?.return?.return?.return?.return
			?.memoizedProps?.audio?.apiAudio ||
		audioRowProps?.children?.props?.audio?.apiAudio;

	if (apiAudio) return apiAudio as AudioAudio;

	if (el.parentElement) {
		const { props } = getReactAttrs(el.parentElement);

		if (props.children?.props?.audio?.apiAudio) {
			return props.children.props.audio.apiAudio as AudioAudio;
		}
	}

	return null;
};

const onCallback = async (el: HTMLElement) => {
	await waitRIC();

	if (el.attributes.getNamedItem('disabled')) return;

	const audio = findApiAudio(el);

	if (!audio) {
		if (process.env.NODE_ENV === 'development') {
			console.error('[VMS/interactions/onAddAudioRowReact] Audio not found', { el, audio });
		}
	}

	for (const callback of registry.listeners) {
		callback(el, audio);
	}
};

const findAudioList = async () => {
	for (const items of document.querySelectorAll<ObservedHTMLElement>('[class*="AudioListItems__root--"] > div')) {
		if (items[AUDIO_LIST_ITEMS_MBS_KEY]) continue;

		items[AUDIO_LIST_ITEMS_MBS_KEY] = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type !== 'childList') continue;
				for (const node of mutation.addedNodes) {
					if (node instanceof HTMLElement) {
						if (node.matches(AUDIO_ROW_SELECTOR)) {
							onCallback(node);
						} else {
							for (const row of node.querySelectorAll<HTMLElement>(AUDIO_ROW_SELECTOR)) {
								onCallback(row);
							}
						}
					}
				}
			}
		});

		items[AUDIO_LIST_ITEMS_MBS_KEY].observe(items, {
			childList: true,
		});
	}
};

const findAllAudioRows = async (retry = 0) => {
	if (document.querySelector(`.vkui__root .vkuiFlex__host [class*="Skeleton__skeleton"]`)) {
		await delay(1000);
		return findAllAudioRows(retry + 1);
	}

	await waitRIC();
	await waitRAF();

	const rows = document.querySelectorAll<HTMLElement>(AUDIO_ROW_SELECTOR);

	for (const row of rows) {
		await waitRIC();
		await onCallback(row);
	}

	await findAudioList();
};

let inited = false;
const onAddAudioRowReact = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddAudioRowReact] count: ${registry.listeners.length}`, registry);
	}

	onDocumentComplete(findAllAudioRows);

	if (!inited) {
		inited = true;

		onOpenPlaylistModal(() => findAllAudioRows());
		onOpenPlaylistPage(() => findAllAudioRows());
	}

	return listener;
};

export default onAddAudioRowReact;
