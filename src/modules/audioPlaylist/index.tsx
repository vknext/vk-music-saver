import { delay } from '@vknext/shared/utils/delay';
import { waitUIActionsMenu } from '@vknext/shared/vkcom/globalVars/waitUIActionsMenu';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import downloadPlaylistCover from 'src/downloaders/downloadPlaylistCover';
import getIcon24DownloadOutline from 'src/icons/getIcon24DownloadOutline';
import onOpenPlaylistModal from 'src/interactions/onOpenPlaylistModal';
import onOpenPlaylistPage from 'src/interactions/onOpenPlaylistPage';
import lang from 'src/lang';
import onCurBackHide from 'src/listeners/onCurBackHide';
import initReactApp from 'src/react/initReactApp';
import showSnackbar from 'src/react/showSnackbar';
import { DownloadTargetElement } from 'src/types';
import styles from './index.module.scss';
import { downloadPlaylistTracklist } from 'src/downloaders/downloadPlaylistTracklist';

interface CreateItemProps {
	text?: string;
}

const createItem = ({ text }: CreateItemProps) => {
	const item = document.createElement('div');
	item.className = 'ui_actions_menu_item';

	if (text) {
		item.innerText = text;
	}

	return item;
};

const injectPopupDownloadCell = async (el: HTMLElement) => {
	if (!el.classList.contains('audio_pl_snippet__action_btn')) return;

	const uiMenu = el.querySelector<DownloadTargetElement>('.ui_actions_menu');

	if (!uiMenu || uiMenu.vms_down_inj) return;
	uiMenu.vms_down_inj = true;

	const item = createItem({ text: lang.use('vms_download') });

	item.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');

		if (!snippet?.dataset?.playlistId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	const itemDownCover = createItem({ text: lang.use('vms_download_cover') });

	itemDownCover.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');

		if (!snippet?.dataset?.playlistId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		await downloadPlaylistCover(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	const itemDownTracklist = createItem({ text: lang.use('vms_download_tracklist') });

	itemDownTracklist.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');

		if (!snippet?.dataset?.playlistId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		await downloadPlaylistTracklist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	uiMenu.prepend(item, itemDownCover, itemDownTracklist);
};

const injectToAudioPlaylistModal = async () => {
	await waitUIActionsMenu();

	const show = window.uiActionsMenu.show;

	window.uiActionsMenu.show = function (...rest) {
		try {
			injectPopupDownloadCell(rest[0]);
		} catch (e) {
			console.error(e);
		}

		return show.apply(this, rest);
	};
};

const injectToSnipperPlaylistHeader = async () => {
	const snippet = document.querySelector<HTMLElement>('.AudioPlaylistSnippet');
	if (!snippet) return;

	const { playlistId } = snippet.dataset;
	if (!playlistId) return;

	const header = snippet.querySelector<DownloadTargetElement>('.AudioPlaylistSnippet__header');
	if (!header || header.vms_down_inj) return;
	header.vms_down_inj = true;

	const actions = document.createElement('div');
	actions.className = styles.AudioPlaylistSnippet__actions;

	const item = document.createElement('button');
	item.className = styles.AudioPlaylistSnippet__actionButton;
	item.addEventListener('click', () => downloadPlaylist(playlistId.replace('playlist_', '')).catch(console.error));

	const leftIcon = document.createElement('div');
	leftIcon.className = styles.ActionButton__icon;
	leftIcon.appendChild(getIcon24DownloadOutline());

	const textEl = document.createElement('span');
	textEl.className = styles.ActionButton__text;
	textEl.innerText = lang.use('vms_download_playlist');

	item.append(leftIcon, textEl);

	actions.appendChild(item);

	header.appendChild(actions);
};

const injectToAudioPlaylistPage = () => {
	const uiMenu = document.querySelector<DownloadTargetElement>(
		'.AudioPlaylistSnippet__actionButton .ActionsMenu__inner'
	);

	if (!uiMenu) {
		injectToSnipperPlaylistHeader();
		return;
	}

	if (uiMenu.vms_down_inj) return;
	uiMenu.vms_down_inj = true;

	const item = document.createElement('button');
	item.className = 'ActionsMenu__item';
	item.innerText = lang.use('vms_download');

	item.addEventListener('click', async () => {
		const snippet = uiMenu.closest<HTMLElement>('.AudioPlaylistSnippet');

		if (!snippet?.dataset?.playlistId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	uiMenu.prepend(item);
};

const ACTIONS_NEW_SELECTOR = [
	'[class*="AudioListHeader__actions--"]',
	'[class*="AudioListBoxHeader__actions--"]',
	'[class*="AudioListModalHeader__actions--"]',
].join(',');

const injectToAudioPlaylistPageNew = async (retry = 0) => {
	if (retry > 10) {
		throw new Error('[VK Music Saver/audioPlaylist] Failed to inject');
	}

	const spaRoot = document.getElementById('spa_root');
	if (!spaRoot) return;

	if (spaRoot.querySelector(`[class*="SkeletonComponent__skeleton"]`)) {
		await delay(1000);
		return injectToAudioPlaylistPageNew(retry + 1);
	}

	const actions = spaRoot.querySelector<DownloadTargetElement>(ACTIONS_NEW_SELECTOR);
	if (!actions) return;
	if (actions.vms_down_inj) return;
	actions.vms_down_inj = true;

	const root = document.createElement('div');

	const DownloadButton = await import('./DownloadButton/DownloadButton');

	const { unmount } = await initReactApp({
		root,
		content: (
			<DownloadButton.default
				mode="secondary"
				appearance="neutral"
				size="m"
				playlistFullId={location.pathname.split('/').at(-1)}
			/>
		),
	});

	onCurBackHide(unmount);

	actions.appendChild(root);
};

const injectToAudioPlaylistModalNew = async (playlistFullId: string, retry = 0) => {
	if (document.querySelector(`.vkui__root .vkuiFlex__host [class*="SkeletonComponent__skeleton"]`)) {
		await delay(1000);
		return injectToAudioPlaylistModalNew(playlistFullId, retry + 1);
	}

	for (const actions of document.querySelectorAll<DownloadTargetElement>(ACTIONS_NEW_SELECTOR)) {
		if (!actions) return;
		if (actions.vms_down_inj) return;
		actions.vms_down_inj = true;

		const vkuiFlex = actions.querySelector<HTMLElement>('.vkuiFlex__host');

		const root = document.createElement('div');

		const DownloadButton = await import('./DownloadButton/DownloadButton');

		const { unmount } = await initReactApp({
			root,
			content: (
				<DownloadButton.default mode="primary" appearance="overlay" size="m" playlistFullId={playlistFullId} />
			),
		});

		onCurBackHide(unmount);

		(vkuiFlex || actions).appendChild(root);
	}
};

const initAudioPlaylist = async () => {
	injectToAudioPlaylistModal().catch(console.error);

	onOpenPlaylistPage(() => {
		injectToAudioPlaylistPageNew().catch(console.error);
		injectToAudioPlaylistPage();
	});

	onOpenPlaylistModal(injectToAudioPlaylistModalNew);
};

export default initAudioPlaylist;
