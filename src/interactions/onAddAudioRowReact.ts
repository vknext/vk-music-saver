import delay from 'src/lib/delay';
import getReactAttrs from 'src/lib/getReactAttrs';
import onDocumentComplete from 'src/lib/onDocumentComplete';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';
import type { AudioAudio } from 'src/schemas/objects';
import type { ObservedHTMLElement } from 'src/types';
import InteractionListener from './InteractionListener';
import onOpenPlaylistModal from './onOpenPlaylistModal';
import onOpenPlaylistPage from './onOpenPlaylistPage';

type CallbackFunc = (el: HTMLElement, audio: AudioAudio | null) => void;

const interaction = new InteractionListener<CallbackFunc>();

const AUDIO_ROW_SELECTOR = '[class*="AudioRow__root"]';

const findApiAudio = (el: HTMLElement): AudioAudio | null => {
	const { props: audioRowProps } = getReactAttrs(el);

	if (audioRowProps?.children?.props?.audio?.apiAudio) {
		return audioRowProps.children.props.audio.apiAudio as AudioAudio;
	}

	if (el.parentElement) {
		const { props } = getReactAttrs(el.parentElement);

		if (props.children?.props?.audio?.apiAudio) {
			return props.children.props.audio.apiAudio as AudioAudio;
		}
	}

	return null;
};

const onCallback = (el: HTMLElement) => {
	if (el.attributes.getNamedItem('disabled')) return;

	const audio = findApiAudio(el);

	if (!audio) {
		if (process.env.NODE_ENV === 'development') {
			console.error('[VMS/interactions/onAddAudioRowReact] Audio not found', { el, audio });
		}
	}

	for (const callback of interaction.listeners) {
		callback(el, audio);
	}
};

const findAudioList = async () => {
	for (const items of document.querySelectorAll<ObservedHTMLElement>('[class*="AudioListItems__root--"] > div')) {
		if (items._vms_mbs) continue;

		items._vms_mbs = new MutationObserver((mutations) => {
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

		items._vms_mbs.observe(items, {
			childList: true,
		});
	}
};

const findAllAudioRows = async (retry = 0) => {
	if (document.querySelector(`.vkui__root .vkuiFlex [class*="Skeleton__skeleton"]`)) {
		await delay(1000);
		return findAllAudioRows(retry + 1);
	}

	await waitRIC();
	await waitRAF();

	const rows = document.querySelectorAll<HTMLElement>(AUDIO_ROW_SELECTOR);

	for (const row of rows) {
		await waitRIC();
		onCallback(row);
	}

	await findAudioList();
};

let inited = false;
const onAddAudioRowReact = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddAudioRow] count: ${interaction.listeners.length}`, interaction);
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
