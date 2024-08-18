import delay from 'src/lib/delay';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';

import waitAjax from 'src/globalVars/waitAjax';
import waitNav from 'src/globalVars/waitNav';
import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import InteractionListener from './InteractionListener';

type CallbackFunc = (el: HTMLElement) => void;

const interaction = new InteractionListener<CallbackFunc>();

const onCallback = (el: HTMLElement) => {
	for (const callback of interaction.listeners) {
		callback(el);
	}
};

const findAllAudioRows = async (isAjax?: boolean) => {
	if (isAjax) {
		await delay(1000);
	}

	await waitRIC();
	await waitRAF();

	const rows = document.querySelectorAll<HTMLElement>('.audio_row:not([data-ioaar])');

	for (const row of rows) {
		await waitRAF();
		row.setAttribute('data-ioaar', '1');

		onCallback(row);
	}
};

const initAjaxHook = async () => {
	await waitAjax();

	const post = window.ajax.post;

	window.ajax.post = function (...args) {
		const [url, obj, funcs] = args;

		const isAudioUrl = url.startsWith('al_audio.php') || url.startsWith('/audio');
		const isLoadCatalogSection = isAudioUrl && url.includes('load_catalog_section');
		const isLoadDefaultSection = isAudioUrl && obj.act && ['section', 'load_catalog_section'].includes(obj.act);

		if (process.env.NODE_ENV === 'development') {
			console.log('[VMS/ajax/post]', {
				url,
				obj,
				isAudioUrl,
				isLoadCatalogSection,
				isLoadDefaultSection,
			});
		}

		if ((isLoadCatalogSection || isLoadDefaultSection) && funcs.onDone) {
			const onDone = funcs.onDone;

			funcs.onDone = function (...onDoneArgs: any[]) {
				const r = onDone.apply(this, onDoneArgs);

				if (r instanceof Promise) {
					r.finally(() => findAllAudioRows(true));
				} else {
					findAllAudioRows(true).catch(console.error);
				}
			};
		}

		return post.apply(this, args);
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
