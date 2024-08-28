import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import downloadPlaylistCover from 'src/downloaders/downloadPlaylistCover';
import waitNav from 'src/globalVars/waitNav';
import waitUIActionsMenu from 'src/globalVars/waitUIActionsMenu';
import getIcon24DownloadOutline from 'src/icons/getIcon24DownloadOutline';
import { DownloadTargetElement } from 'src/types';
import * as styles from './index.module.scss';

const injectPopupDownloadCell = async (el: HTMLElement) => {
	if (!el.classList.contains('audio_pl_snippet__action_btn')) return;

	const uiMenu = el.querySelector<DownloadTargetElement>('.ui_actions_menu');

	if (!uiMenu || uiMenu.vms_down_inj) return;
	uiMenu.vms_down_inj = true;

	const item = document.createElement('div');
	item.className = 'ui_actions_menu_item';
	item.innerText = window.getLang('vms_download');

	item.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');
		if (!snippet?.dataset?.playlistId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: 'playlist id not found' });
			return;
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	const itemDownCover = document.createElement('div');
	itemDownCover.className = 'ui_actions_menu_item';
	itemDownCover.innerText = window.getLang('vms_download_cover');

	itemDownCover.addEventListener('click', async () => {
		const snippet = el.closest<HTMLElement>('.audio_pl_snippet2');
		if (!snippet?.dataset?.playlistId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: 'playlist id not found' });
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
	item.addEventListener('click', () => downloadPlaylist(playlistId.replace('playlist_', '')));

	const leftIcon = document.createElement('div');
	leftIcon.className = styles.ActionButton__icon;
	leftIcon.appendChild(getIcon24DownloadOutline());

	const textEl = document.createElement('span');
	textEl.className = styles.ActionButton__text;
	textEl.innerText = window.getLang('vms_download_playlist');

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
	item.innerText = window.getLang('vms_download');

	item.addEventListener('click', async () => {
		const snippet = uiMenu.closest<HTMLElement>('.AudioPlaylistSnippet');

		if (!snippet?.dataset?.playlistId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: 'playlist id not found' });
			return;
		}

		await downloadPlaylist(snippet.dataset.playlistId.replace('playlist_', ''));
	});

	uiMenu.prepend(item);
};

const initAudioPlaylist = async () => {
	injectToAudioPlaylistModal().catch(console.error);

	if (window.location.pathname.startsWith('/music/album') || window.location.pathname.startsWith('/music/playlist')) {
		injectToAudioPlaylistPage().catch(console.error);
	}

	await waitNav();

	window.nav.onLocationChange((locStr) => {
		if (locStr.startsWith('music/album') || locStr.startsWith('music/playlist')) {
			injectToAudioPlaylistPage().catch(console.error);
		}
	});
};

export default initAudioPlaylist;
