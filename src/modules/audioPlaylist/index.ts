import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import downloadPlaylistCover from 'src/downloaders/downloadPlaylistCover';
import createVKUIButton from 'src/elements/createVKUIButton';
import waitUIActionsMenu from 'src/globalVars/waitUIActionsMenu';
import getIcon24DownloadOutline from 'src/icons/getIcon24DownloadOutline';
import onOpenPlaylistModal from 'src/interactions/onOpenPlaylistModal';
import onOpenPlaylistPage from 'src/interactions/onOpenPlaylistPage';
import lang from 'src/lang';
import delay from 'src/lib/delay';
import { DownloadTargetElement } from 'src/types';
import * as styles from './index.module.scss';

const injectPopupDownloadCell = async (el: HTMLElement) => {
	if (!el.classList.contains('audio_pl_snippet__action_btn')) return;

	const uiMenu = el.querySelector<DownloadTargetElement>('.ui_actions_menu');

	if (!uiMenu || uiMenu.vms_down_inj) return;
	uiMenu.vms_down_inj = true;

	const item = document.createElement('div');
	item.className = 'ui_actions_menu_item';
	item.innerText = lang.use('vms_download');

	item.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');
		if (!snippet?.dataset?.playlistId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
			return;
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	const itemDownCover = document.createElement('div');
	itemDownCover.className = 'ui_actions_menu_item';
	itemDownCover.innerText = lang.use('vms_download_cover');

	itemDownCover.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');
		if (!snippet?.dataset?.playlistId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
			return;
		}

		await downloadPlaylistCover(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	uiMenu.prepend(item, itemDownCover);
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

const injectToAudioPlaylistPage = async () => {
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
			window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
			return;
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	uiMenu.prepend(item);
};

const injectToAudioPlaylistPageNew = async (retry = 0) => {
	if (retry > 10) {
		throw new Error('[VK Next/audioPlaylist] Failed to inject');
	}

	const spaRoot = document.getElementById('spa_root');
	if (!spaRoot) return;

	if (spaRoot.querySelector(`[class*="Skeleton-module__skeleton"]`)) {
		await delay(1000);
		return injectToAudioPlaylistPageNew(retry + 1);
	}

	const actions = spaRoot.querySelector<DownloadTargetElement>('[class*="AudioListHeader-module__actions--"]');
	if (!actions) return;
	if (actions.vms_down_inj) return;
	actions.vms_down_inj = true;

	const { element, setIsLoading, setText, getIsLoading } = createVKUIButton({
		mode: 'secondary',
		appearance: 'neutral',
		size: 'm',
	});

	setText(lang.use('vms_download'));

	element.addEventListener('click', async () => {
		if (getIsLoading()) return;
		setIsLoading(true);

		try {
			const playlistFullId = location.pathname.split('/').at(-1);

			if (!playlistFullId) {
				window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
				return;
			}

			await downloadPlaylist(playlistFullId);
		} catch (error) {
			console.error(error);
		}

		setIsLoading(false);
	});

	actions.appendChild(element);
};

const injectToAudioPlaylistModalNew = async (playlistFullId: string, retry = 0) => {
	if (document.querySelector(`.vkui__root .vkuiFlex [class*="Skeleton-module__skeleton"]`)) {
		await delay(1000);
		return injectToAudioPlaylistModalNew(playlistFullId, retry + 1);
	}

	for (const actions of document.querySelectorAll<DownloadTargetElement>(
		'[class*="AudioListModalHeader-module__actions--"]'
	)) {
		if (!actions) return;
		if (actions.vms_down_inj) return;
		actions.vms_down_inj = true;

		const vkuiFlex = actions.querySelector<HTMLElement>('.vkuiFlex');

		const { element, setIsLoading, setText, getIsLoading } = createVKUIButton({
			mode: 'primary',
			appearance: 'overlay',
			size: 'm',
		});

		setText(lang.use('vms_download'));

		element.addEventListener('click', async () => {
			if (getIsLoading()) return;
			setIsLoading(true);

			try {
				await downloadPlaylist(playlistFullId);
			} catch (error) {
				console.error(error);
			}

			setIsLoading(false);
		});

		(vkuiFlex || actions).appendChild(element);
	}
};

const initAudioPlaylist = async () => {
	injectToAudioPlaylistModal().catch(console.error);

	onOpenPlaylistPage(() => {
		injectToAudioPlaylistPage().catch(console.error);
		injectToAudioPlaylistPageNew().catch(console.error);
	});

	onOpenPlaylistModal(injectToAudioPlaylistModalNew);
};

export default initAudioPlaylist;
