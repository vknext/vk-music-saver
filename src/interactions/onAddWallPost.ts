import waitCur from 'src/globalVars/waitCur';
import waitNav from 'src/globalVars/waitNav';
import delay from 'src/lib/delay';
import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';
import type { ObservedHTMLElement } from 'src/types';
import InteractionListener from './InteractionListener';

type CallbackFunc = (node: HTMLElement) => void;

const POST_SELECTOR = ['.Post--redesign', '.post', '._post:not(.reply)', '.Post', '.FeedBlockWrap'].join(',');
const WALL_MODULE_SELECTOR = ['.wall_module', '#public_wall'].join(',');
const PAGE_WALL_POSTS_SELECTOR = ['#page_wall_posts', '.page_wall_posts', '#page_donut_posts'].join(',');
const FEED_ROWS_SELECTOR = ['#feed_rows', '._feed_rows'].join(',');

const interaction = new InteractionListener<CallbackFunc>();

const onCallback = async (el: HTMLElement) => {
	if (process.env.NODE_ENV === 'development') {
		console.info('[VMS/listeners] onAddWallPost', el);
	}

	for (const callback of interaction.listeners) {
		await waitRIC();
		callback(el);
	}
};

const onAddPost = (el: ObservedHTMLElement) => {
	if (el._vms_ibs) return;

	el._vms_ibs = new IntersectionObserver(
		async (entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					onCallback(el);
				}
			}
		},
		{ threshold: 0.05 } // 5% элемента должно быть видно
	);

	el._vms_ibs.observe(el);
};

const getDocumentPosts = async () => {
	await waitRAF();

	return document.querySelectorAll<HTMLElement>(POST_SELECTOR);
};

const validModules = ['feed', 'public', 'profile', 'wall', 'groups'];

let timeOut: NodeJS.Timeout | null = null;
const initObserver = async () => {
	if (timeOut !== null) {
		clearTimeout(timeOut);
		timeOut = null;
	}

	if (document.getElementById('FeedPageSkeleton')) {
		timeOut = setTimeout(() => {
			timeOut = null;
			initObserver();
		}, 2000);

		return;
	}

	const wallModule = document.querySelectorAll<HTMLElement>(WALL_MODULE_SELECTOR);

	for (const row of wallModule) {
		await waitRIC();

		const feedRows = row.querySelector<ObservedHTMLElement>(FEED_ROWS_SELECTOR);

		if (feedRows) {
			if (feedRows._vms_mbs) continue;

			feedRows._vms_mbs = new MutationObserver(async (mutations) => {
				for (const mutation of mutations) {
					if (!mutation.addedNodes.length) continue;

					for (const node of mutation.addedNodes) {
						await waitRIC();

						const post = (node as HTMLElement).querySelector<HTMLElement>(POST_SELECTOR);
						if (!post) continue;

						onAddPost(post);
					}
				}
			});

			feedRows._vms_mbs.observe(feedRows, {
				childList: true,
			});
		}
	}

	const pageWallPosts = document.querySelectorAll<ObservedHTMLElement>(PAGE_WALL_POSTS_SELECTOR);

	for (const wrapper of pageWallPosts) {
		if (wrapper._vms_mbs) continue;

		await waitRIC();

		wrapper._vms_mbs = new MutationObserver(async (mutations) => {
			for (const mutation of mutations) {
				if (!mutation.addedNodes.length) continue;

				for (const node of mutation.addedNodes) {
					await waitRIC();

					await onCallback(node as HTMLElement);
				}
			}
		});

		wrapper._vms_mbs.observe(wrapper, {
			childList: true,
		});
	}

	await waitRIC();

	for (const post of await getDocumentPosts()) {
		onAddPost(post);
	}
};

const initListener = async (): Promise<void> => {
	await waitNav();
	await waitCur();

	window.nav.subscribeOnModuleEvaluated(async () => {
		const curModule = window.cur.module;

		if (!validModules.includes(curModule)) {
			return;
		}

		if (curModule === 'profile') {
			await delay(1000);
		}

		initObserver();
	});

	if (!window.cur?.module) {
		await new Promise<void>((resolve) => DOMContentLoaded(resolve));
	}

	if (validModules.includes(window.cur.module) || window.cur.module === undefined) {
		await initObserver();
	}
};

let inited = false;
const onAddWallPost = (callback: CallbackFunc) => {
	const listener = interaction.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddWallPost] count: ${interaction.listeners.length}`, interaction);
	}

	DOMContentLoaded(async () => {
		const posts = await getDocumentPosts();
		for (const post of posts) {
			callback(post);
		}
	});

	if (!inited) {
		inited = true;

		initListener();
	}

	return listener;
};

export default onAddWallPost;
