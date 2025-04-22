import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import { waitMECommonContext } from '@vknext/shared/vkcom/globalVars/waitMECommonContext';
import type { IMECommonContext } from '@vknext/shared/vkcom/types';

type TCallback = (event: any) => void | boolean | Promise<void>;

const interactionAfter = new ListenerRegistry<TCallback>();
const interactionBefore = new ListenerRegistry<TCallback>();

const changeDispatch = (context: IMECommonContext) => {
	if (context._vms_meAppHooked) {
		return;
	}
	context._vms_meAppHooked = true;

	const dispatch = context.store.dispatch;

	let ownerId = context.store.getState()?.ownerId;

	context.store.dispatch = function (...args) {
		const [event] = args;

		if (!ownerId) {
			ownerId = context.store.getState()?.ownerId;
		}

		let isCanceled = false;

		for (const callback of interactionBefore.listeners) {
			try {
				const result = callback(event);
				if (typeof result === 'boolean' && result) {
					isCanceled = true;
				}
			} catch (e) {
				console.error(e);
			}
		}

		if (isCanceled) {
			return;
		}

		const r = Reflect.apply(dispatch, context.store, args);

		for (const callback of interactionAfter.listeners) {
			try {
				callback(event);
			} catch (e) {
				console.error(e);
			}
		}

		return r;
	};
};

const initMEContextHook = async () => {
	const MEContext = await waitMECommonContext();

	changeDispatch(MEContext);
};

const addMEAppListener = (callback: TCallback, isAfter = false) => {
	const listener = (isAfter ? interactionAfter : interactionBefore).addListener(callback);

	initMEContextHook();

	return listener;
};

export default addMEAppListener;
