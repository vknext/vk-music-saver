import delay from 'src/lib/delay';
import waitRIC from 'src/lib/waitRIC';

import waitAjax from 'src/globalVars/waitAjax';
import waitNav from 'src/globalVars/waitNav';
import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import waitRAF from 'src/lib/waitRAF';
import InteractionListener from './InteractionListener';

type CallbackFunc = (el: HTMLElement) => void;

const interaction = new InteractionListener<CallbackFunc>();

const onCallback = (el: HTMLElement) => {
	for (const callback of interaction.listeners) {
		callback(el);
	}
};

interface AudioListElement extends HTMLElement {
	_vms_obs?: MutationObserver;
}

const findAudioList = () => {
	const lists = document.querySelectorAll<AudioListElement>('.audio_pl_snippet__list');

	for (const list of lists) {
		if (list._vms_obs) continue;

		list._vms_obs = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList' && mutation.addedNodes.length) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement && node.classList.contains('audio_row')) {
							onCallback(node);
						}
					}
				}
			}
		});

		list._vms_obs.observe(list, {
			childList: true,
		});
	}
};

const findAllAudioRows = async (isAjax?: boolean) => {
	if (isAjax) {
		await delay(1000);
	}

	await waitRIC();
	await waitRAF();

	const rows = document.querySelectorAll<HTMLElement>('.audio_row');

	for (const row of rows) {
		await waitRIC();
		onCallback(row);
	}

	findAudioList();
};

const supportedActions = ['section', 'load_catalog_section', 'load_block_playlist', 'load_section'];

const initAjaxHook = async () => {
	await waitAjax();

	const originalPost = window.ajax.post;

	window.ajax.post = function (...args) {
		try {
			const [url, requestData, callbackFunctions] = args;

			const isAudioRequest = url.startsWith('al_audio.php') || url.startsWith('/audio');

			let actParam: string | null = requestData.act;

			if (isAudioRequest && !actParam) {
				const parsedUrl = new URL(url, window.location.origin);
				actParam = parsedUrl.searchParams.get('act');
			}

			const isLoadAudioBlocks = actParam && supportedActions.includes(actParam);

			if (isLoadAudioBlocks && callbackFunctions.onDone) {
				const originalOnDone = callbackFunctions.onDone;

				callbackFunctions.onDone = function (...onDoneArgs: any[]) {
					const result = originalOnDone.apply(this, onDoneArgs);

					if (result instanceof Promise) {
						result.finally(() => findAllAudioRows(true));
					} else {
						findAllAudioRows(true).catch(console.error);
					}
				};
			}
		} catch (e) {
			console.error('[VMS/ajax/post]', e);
		}

		return originalPost.apply(this, args);
	};
};

let inited = false;
const onAddAudioRow = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddAudioRow] count: ${interaction.listeners.length}`, interaction);
	}

	DOMContentLoaded(findAllAudioRows);

	if (!inited) {
		inited = true;

		initAjaxHook();

		waitNav().then(() => {
			window.nav.onLocationChange((locStr) => {
				if (locStr.startsWith('audio') || locStr.startsWith('music')) {
					findAllAudioRows();
				}
			});
		});
	}

	return listener;
};

export default onAddAudioRow;
