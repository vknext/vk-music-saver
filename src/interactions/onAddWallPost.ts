import { waitCur } from '@vknext/shared/vkcom/globalVars/waitCur';
import { waitNav } from '@vknext/shared/vkcom/globalVars/waitNav';
import ListenerRegistry from 'src/common/ListenerRegistry';
import observedElementsCleaner from 'src/common/observedElementsCleaner';
import {
	generateObservedElementIBSKey,
	generateObservedElementMBSKey,
} from 'src/common/observedHTMLElements/generateKeys';
import type { ObservedHTMLElement } from 'src/global';
import delay from 'src/lib/delay';
import DOMContentLoaded from 'src/lib/DOMContentLoaded';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';
import onPostContentContainerInit from 'src/listeners/onPostContentContainerInit';

type CallbackFunc = (node: HTMLElement) => void;

const POST_SELECTOR = [
	'.Post--redesign',
	'.post',
	'._post:not(.reply)',
	'.Post',
	'.FeedBlockWrap',
	'.feed_post_indicator:not(:has(.post))',
	`[id*="postadsite_"]:not(:has(.post))`,
	'[post-hash]:not(:has(.post))',
].join(',');
const WALL_MODULE_SELECTOR = ['.wall_module', '#public_wall'].join(',');
const PAGE_WALL_POSTS_SELECTOR = ['#page_wall_posts', '.page_wall_posts', '#page_donut_posts'].join(',');
const FEED_ROWS_SELECTOR = ['#feed_rows', '._feed_rows'].join(',');

const MBS_FEED_ROW_KEY = generateObservedElementMBSKey();
const MBS_PAGE_WALL_POSTS_KEY = generateObservedElementMBSKey();
const IBS_POST_KEY = generateObservedElementIBSKey();

const registry = new ListenerRegistry<CallbackFunc>();

const onCallback = async (el: HTMLElement) => {
	if (process.env.NODE_ENV === 'development') {
		console.info('[VMS/interactions/onAddWallPost]', el);
	}

	// элемент удалили из дома, например при переходе в другой раздел
	if (!el.closest('html,body')) return;

	if (el.getElementsByClassName('PostContentDumbSkeleton').length) {
		await delay(500);
		return onCallback(el);
	}

	for (const callback of registry.listeners) {
		await waitRIC();
		callback(el);
	}
};

const onAddPost = (el: ObservedHTMLElement) => {
	if (el[IBS_POST_KEY]) return;

	const postContentContainer = el.querySelector<HTMLElement>('.PostContentContainer__root:not(.ReactEntryRootClone)');

	if (postContentContainer && postContentContainer.style.display !== 'none') {
		onCallback(el);
		return;
	}

	el[IBS_POST_KEY] = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					onCallback(el);

					if (el[IBS_POST_KEY]) {
						el[IBS_POST_KEY].unobserve(el);

						delete el[IBS_POST_KEY];
					}
				}
			}
		},
		{ threshold: 0, rootMargin: '50px 0% 50px 0%' }
	);

	observedElementsCleaner.add(el);

	el[IBS_POST_KEY].observe(el);
};

const getDocumentPosts = async () => {
	await waitRAF();

	return document.querySelectorAll<ObservedHTMLElement>(POST_SELECTOR);
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
		}, 1000);

		return;
	}

	const wallModule = document.querySelectorAll<HTMLElement>(WALL_MODULE_SELECTOR);

	for (const row of wallModule) {
		await waitRIC();

		const feedRows = row.querySelector<ObservedHTMLElement>(FEED_ROWS_SELECTOR);

		if (feedRows) {
			if (feedRows.closest('.feed_wall--no-islands')) continue;

			if (feedRows[MBS_FEED_ROW_KEY]) continue;

			feedRows[MBS_FEED_ROW_KEY] = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (!mutation.addedNodes.length) continue;

					for (const node of mutation.addedNodes) {
						const post = (node as HTMLElement).querySelector<ObservedHTMLElement>(POST_SELECTOR);
						if (!post) continue;

						onAddPost(post);
					}
				}
			});

			observedElementsCleaner.add(feedRows);

			feedRows[MBS_FEED_ROW_KEY].observe(feedRows, {
				childList: true,
			});
		}
	}

	const pageWallPosts = document.querySelectorAll<ObservedHTMLElement>(PAGE_WALL_POSTS_SELECTOR);

	for (const wrapper of pageWallPosts) {
		if (wrapper.closest('.feed_wall--no-islands')) continue;

		if (wrapper[MBS_PAGE_WALL_POSTS_KEY]) continue;

		await waitRIC();

		wrapper[MBS_PAGE_WALL_POSTS_KEY] = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (!mutation.addedNodes.length) continue;

				for (const node of mutation.addedNodes) {
					onAddPost(node as ObservedHTMLElement);
				}
			}
		});

		observedElementsCleaner.add(wrapper);

		wrapper[MBS_PAGE_WALL_POSTS_KEY].observe(wrapper, {
			childList: true,
		});
	}

	await waitRIC();

	for (const post of await getDocumentPosts()) {
		onAddPost(post);
	}
};

const initListener = async (): Promise<void> => {
	const nav = await waitNav();
	const cur = await waitCur();

	nav.subscribeOnModuleEvaluated(async () => {
		await waitRAF();

		const curModule = cur.module;

		if (curModule === 'profile') {
			await delay(1000);
		}

		initObserver();
	});

	if (cur?.module) {
		await new Promise<void>((resolve) => DOMContentLoaded(resolve));
	}

	if (validModules.includes(cur.module) || cur.module === undefined) {
		await initObserver();
	}
};

const onAddPostContent = ({ target }: { target: HTMLElement }) => {
	const post = target.closest<ObservedHTMLElement>(POST_SELECTOR);

	if (post) {
		onAddPost(post);
	}
};

let inited = false;
const onAddWallPost = (callback: CallbackFunc) => {
	const listener = registry.addListener(callback);

	if (process.env.NODE_ENV === 'development') {
		console.info(`[VMS/interactions/onAddWallPost] count: ${registry.listeners.length}`, registry);
	}

	DOMContentLoaded(async () => {
		const posts = await getDocumentPosts();
		for (const post of posts) {
			callback(post);
		}
	});

	if (!inited) {
		inited = true;

		onPostContentContainerInit(onAddPostContent, true);

		initListener();
	}

	return listener;
};

export default onAddWallPost;
