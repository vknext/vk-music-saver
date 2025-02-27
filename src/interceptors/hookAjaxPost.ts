import type { Iajax } from 'src/global';
import waitAjax from '../globalVars/waitAjax';

type AjaxPostArgs = Parameters<Iajax['post']>;
type AjaxInterceptor = (args: AjaxPostArgs) => AjaxPostArgs | boolean | Promise<void> | void;

const interceptors = new Set<AjaxInterceptor>();
let isHooked = false;

const initAjaxHook = async () => {
	if (isHooked) return;
	isHooked = true;

	const ajax = await waitAjax();

	const originalPost = ajax.post;

	ajax.post = function (...args: AjaxPostArgs) {
		let canceled = false;

		for (const modifyArgs of interceptors) {
			try {
				const result = modifyArgs(args);

				if (result === true) {
					canceled = true;
				} else if (result && !(result instanceof Promise)) {
					args = result;
				}
			} catch (e) {
				console.error(e);
			}
		}

		if (canceled) return;

		return Reflect.apply(originalPost, ajax, args);
	};
};

/**
 * Перехват ajax.post
 *
 * Запрещено переопределять ajax.post где-либо ещё
 * @version 14.0 (vknext)
 */
const hookAjaxPost = (interceptor: AjaxInterceptor) => {
	interceptors.add(interceptor);

	initAjaxHook();

	return () => interceptors.delete(interceptor);
};

export default hookAjaxPost;
