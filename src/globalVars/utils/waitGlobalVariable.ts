import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import waitHTMLBody from 'src/lib/waitHTMLBody';
import waitHTMLHead from 'src/lib/waitHTMLHead';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';

export type WindowVariables = keyof (Window & typeof globalThis);

const map = new Map<WindowVariables, Promise<any>>();

/**
 * Требуется чтобы исключить проблемы с вызовом функций до их появления.
 *
 * Костыль оптимизировался каждые несколько месяцев с 2020 года и использовался до середины 2024.
 * В VK Next мы выдираем нужные функции из webpack, тут этого не нужно.
 */
const waitGlobalVariable = <T extends WindowVariables>(variable: T): Promise<(typeof window)[T]> => {
	if (map.has(variable)) {
		return map.get(variable) as Promise<(typeof window)[T]>;
	}

	const promise = new Promise<(typeof window)[T]>(async (resolve) => {
		await waitHTMLBody();

		let interval: ReturnType<typeof setTimeout> | null = null;
		let isDisconnected = false;

		const checkVariable = () => {
			if (process.env.NODE_ENV === 'development') {
				// нужно оптимизировать если пишется очень часто, например заставить vkcom загрузить нужный модуль через stManager
				console.log('[VMS] Checking variable', variable, 'in', window);
			}
			if (window[variable]) {
				resolve(window[variable]);
				map.delete(variable);

				if (interval) {
					clearInterval(interval);
				}

				isDisconnected = true;

				return true;
			}

			return false;
		};

		if (checkVariable()) {
			return;
		}

		const isLoading = () => document.readyState === 'loading';

		const cpu = window.navigator.hardwareConcurrency;

		interval = setInterval(() => requestIdleCallback(checkVariable), (isLoading() ? 10_000 : 50_000) / cpu);

		const observerCallback = () => {
			if (checkVariable()) {
				obs.disconnect();
				isDisconnected = true;
			}
		};

		const obs = new MutationObserver(observerCallback);
		obs.observe(document.documentElement, { childList: true });

		const head = await waitHTMLHead();
		obs.disconnect();

		if (document.readyState === 'loading') {
			await waitRAF();
			await waitRIC();
		}

		if (isDisconnected) return;

		obs.observe(head, { childList: true });

		await new Promise<void>(DOMContentLoaded);

		const body = await waitHTMLBody();
		if (isDisconnected) return;

		obs.observe(body, { childList: true });
	});

	map.set(variable, promise);

	return promise;
};

export default waitGlobalVariable;
