import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import { DOMContentLoaded } from '@vknext/shared/utils/DOMContentLoaded';
import { delay } from '@vknext/shared/utils/delay';
import { waitRAF } from '@vknext/shared/utils/waitRAF';
import { waitRIC } from '@vknext/shared/utils/waitRIC';
import { waitNav } from '@vknext/shared/vkcom/globalVars/waitNav';
import observedElementsCleaner from 'src/common/observedElementsCleaner';
import {
	generateObservedElementIBSKey,
	generateObservedElementMBSKey,
} from 'src/common/observedHTMLElements/generateKeys';
import type { ObservedHTMLElement } from 'src/types/global';
import hookAjaxPost from 'src/interceptors/hookAjaxPost';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';

type CallbackFunc = (el: HTMLElement) => void;

const registry = new ListenerRegistry<CallbackFunc>();

const PL_SNIPPET_MBS_KEY = generateObservedElementMBSKey();
const AUDIO_ROW_IBS_KEY = generateObservedElementIBSKey();

const onCallback = async (el: HTMLElement) => {
	await waitRAF();

	for (const callback of registry.listeners) {
		callback(el);
	}
};

const onAddRow = async (el: ObservedHTMLElement) => {
	await waitRIC();

	if (el[AUDIO_ROW_IBS_KEY]) return;

	el[AUDIO_ROW_IBS_KEY] = new IntersectionObserver(
		async (entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					await onCallback(el);
				}
			}
		},
		{ threshold: 0, rootMargin: '50px 0% 50px 0%' }
	);

	el[AUDIO_ROW_IBS_KEY].observe(el);

	observedElementsCleaner.add(el);
};

const findAudioList = () => {
	const lists = document.querySelectorAll<ObservedHTMLElement>('.audio_pl_snippet__list');

	for (const list of lists) {
		if (list[PL_SNIPPET_MBS_KEY]) continue;

		list[PL_SNIPPET_MBS_KEY] = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList' && mutation.addedNodes.length) {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement && node.classList.contains('audio_row')) {
							onAddRow(node as ObservedHTMLElement);
						}
					}
				}
			}
		});

		list[PL_SNIPPET_MBS_KEY].observe(list, {
			childList: true,
		});

		observedElementsCleaner.add(list);
	}
};

const findAllAudioRows = async (isAjax?: boolean) => {
	if (isAjax) {
		await delay(1000);
	}

	await waitRIC();
	await waitRAF();

	const rows = document.querySelectorAll<ObservedHTMLElement>('.audio_row');

	for (const row of rows) {
		await waitRIC();
		onAddRow(row);
	}

	findAudioList();
};

const supportedActions = ['section', 'load_catalog_section', 'load_block_playlist', 'load_section'];

const initAjaxHook = () => {
	hookAjaxPost((args) => {
		const [url, requestData, callbackFunctions] = args;

		const isAudioRequest = url.startsWith('al_audio.php') || url.startsWith('/audio');

		let actParam: string | null = requestData.act;

		if (isAudioRequest && !actParam) {
			const parsedUrl = new URL(url, window.location.origin);
			actParam = parsedUrl.searchParams.get('act');
		}

		const isLoadAudioBlocks = actParam && supportedActions.includes(actParam);

		if (process.env.NODE_ENV === 'development') {
			console.log('[VMS/ajax/post]', {
				url,
				requestData,
				isAudioRequest,
				actParam,
				isLoadAudioBlocks,
			});
		}

		if (isLoadAudioBlocks && callbackFunctions.onDone) {
			const originalOnDone = callbackFunctions.onDone;

			callbackFunctions.onDone = function (...onDoneArgs: unknown[]) {
				const result = Reflect.apply(originalOnDone, this, onDoneArgs);

				if (result instanceof Promise) {
					result.finally(() => findAllAudioRows(true));
				} else {
					findAllAudioRows(true).catch(console.error);
				}
			};
		}
	});
};

let inited = false;
const onAddAudioRow = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddAudioRow] count: ${registry.listeners.length}`, registry);
	}

	DOMContentLoaded(findAllAudioRows);
	onDocumentComplete(findAllAudioRows);

	if (!inited) {
		inited = true;

		initAjaxHook();

		waitNav().then((nav) => {
			nav.onLocationChange((locStr) => {
				if (locStr.startsWith('audio') || locStr.startsWith('music')) {
					findAllAudioRows();
				}
			});
		});
	}

	return listener;
};

export default onAddAudioRow;
