import { waitNav } from '@vknext/shared/vkcom/globalVars/waitNav';
import ListenerRegistry from 'src/common/ListenerRegistry';
import delay from 'src/lib/delay';
import waitHTMLHead, { type HTMLHeadTaskQueueS } from 'src/lib/waitHTMLHead';

type CallbackFunc = (tqs: HTMLHeadTaskQueueS) => void;

const registry = new ListenerRegistry<CallbackFunc>();

const getTqs = async () => {
	const head = await waitHTMLHead();

	if (!head._tqs) {
		await delay(1000);

		return getTqs();
	}

	return head._tqs;
};

const initHeadHook = async () => {
	const tqs = await getTqs();

	if (tqs._vms_s) return;
	tqs._vms_s = true;

	for (const callback of registry.listeners) {
		try {
			callback(tqs);
		} catch (e) {
			console.error(e);
		}
	}
};

const initNavHook = async () => {
	const nav = await waitNav();

	nav.onLocationChange(initHeadHook);
};

let inited = false;
const onAddNewCallback = async (callback: CallbackFunc) => {
	if (!inited) {
		inited = true;

		await initHeadHook();

		initNavHook().catch(console.error);
	}

	callback(await getTqs());
};

const onAddTaskQueueS = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	onAddNewCallback(callback);

	return listener;
};

export default onAddTaskQueueS;
