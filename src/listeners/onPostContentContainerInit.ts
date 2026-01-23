/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HTMLHeadTaskQueueS } from '@vknext/shared/utils/waitHTMLHead';
import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import onAddTaskQueueS from './onAddTaskQueueS';

type CallbackFunc = (payload: any) => Promise<void> | void;

const registryBefore = new ListenerRegistry<CallbackFunc>();
const registryAfter = new ListenerRegistry<CallbackFunc>();

const postContentContainerInitDecorator = (fn: (...args: any) => void) => {
	return (...rest: any) => {
		if (process.env.NODE_ENV === 'development') {
			console.info('[VK Music Saver/onPostContentContainerInit] _tqs/PostContentContainer/init', {
				rest,
			});
		}

		try {
			const payload = rest[0].payload;

			for (const callback of registryBefore.listeners) {
				try {
					callback(payload);
				} catch (e) {
					console.error(e);
				}
			}
		} catch (e) {
			console.error(e);
		}

		const result = Reflect.apply(fn, this, rest);

		try {
			const payload = rest[0].payload;

			for (const callback of registryAfter.listeners) {
				try {
					callback(payload);
				} catch (e) {
					console.error(e);
				}
			}
		} catch (e) {
			console.error(e);
		}

		return result;
	};
};

const uniqueKey = Symbol();

const onAddTqs = async (tqs: HTMLHeadTaskQueueS) => {
	if (tqs[uniqueKey]) return;
	tqs[uniqueKey] = true;

	const originalHandlers = tqs._handlers;

	if (originalHandlers[uniqueKey]) return;
	originalHandlers[uniqueKey] = true;

	if (originalHandlers['PostContentContainer/init']) {
		originalHandlers['PostContentContainer/init'] = postContentContainerInitDecorator(
			originalHandlers['PostContentContainer/init']
		);
	}

	const handlersProxy = new Proxy(originalHandlers, {
		set(target, property: string, value) {
			if (process.env.NODE_ENV === 'development') {
				console.info('[VK Music Saver/onPostContentContainerInit] _tqs', {
					property,
					value,
					target,
				});
			}

			if (property === 'PostContentContainer/init') {
				target[property] = postContentContainerInitDecorator(value);
				return true;
			}

			target[property] = value;

			return true;
		},
	});

	tqs._handlers = handlersProxy;
};

let inited = false;
const onPostContentContainerInit = (callback: CallbackFunc, after = false) => {
	const listener = after ? registryAfter.addListener(callback) : registryBefore.addListener(callback);

	if (!inited) {
		inited = true;

		onAddTaskQueueS(onAddTqs);
	}

	return listener;
};

export default onPostContentContainerInit;
