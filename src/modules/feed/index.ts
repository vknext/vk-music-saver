import downloadAudio from 'src/downloaders/downloadAudio';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import onAddWallPost from 'src/interactions/onAddWallPost';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import formatFFMpegProgress from 'src/lib/formatFFMpegProgress';
import humanFileSize from 'src/lib/humanFileSize';
import waitRAF from 'src/lib/waitRAF';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import type { DownloadTargetElement } from 'src/types';

const onAddAttachAudio = async (attach: DownloadTargetElement) => {
	const audio = attach.dataset.audio;
	if (!audio) return;

	const audioObject = window.AudioUtils.audioTupleToAudioObject(JSON.parse(audio));
	if (!audioObject || audioObject?.restrictionStatus) return;

	if (attach.vms_down_inj) return;
	attach.vms_down_inj = true;

	await waitRAF();

	const afterWrapper = attach.querySelector<HTMLElement>('.SecondaryAttachment__after');
	if (!afterWrapper) return;

	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({ iconSize: 24 });

	const updateBitrate = async () => {
		const result = await getAudioBitrate(audioObject);

		const text = [];

		if (result?.bitrate) {
			text.push(`${result.bitrate} kb/s`);
		}

		if (result?.size) {
			text.push(humanFileSize(result.size, 2));
		}

		setText(text.join('\n'));
	};

	updateBitrate().catch(console.error);

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) return;

		setIsLoading(true);
		setText(lang.use('vms_loading'));

		downloadAudio({
			audioObject,
			onProgress: async (progress) => {
				setText(formatFFMpegProgress(progress));
			},
		}).finally(() => {
			setIsLoading(false);

			updateBitrate().catch(console.error);
		});
	});

	const addAudioBtn = afterWrapper.querySelector('[data-task-click="SecondaryAttachment/addAudio"]');

	if (addAudioBtn) {
		afterWrapper.insertBefore(element, addAudioBtn);
	} else {
		afterWrapper.prepend(element);
	}
};

const onAddAttachPlaylist = async (attach: DownloadTargetElement) => {
	const playlistId: string[] = [];

	if (attach.dataset.ownerId) {
		playlistId.push(attach.dataset.ownerId);
	}

	if (attach.dataset.playlistId) {
		playlistId.push(attach.dataset.playlistId);
	}

	if (attach.dataset.accessKey) {
		playlistId.push(attach.dataset.accessKey);
	}

	if (!playlistId.length) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
		return;
	}

	if (attach.vms_down_inj) return;
	attach.vms_down_inj = true;

	await waitRAF();

	const afterWrapper = attach.querySelector<HTMLElement>('.SecondaryAttachment__after');
	if (!afterWrapper) return;

	const { setIsLoading, element, getIsLoading } = createDownloadAudioButton({
		iconSize: 24,
		enableDefaultText: false,
	});

	// требуется чтобы не происходило открытие плейлиста после нажатия на кнопку. Отмены ивента клика недостаточно.
	element.classList.add('SecondaryAttachment__buttonBase--action');

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) return;

		setIsLoading(true);

		downloadPlaylist(playlistId.join('_'))
			.catch(console.error)
			.finally(() => {
				setIsLoading(false);
			});
	});

	afterWrapper.prepend(element);
};

const initFeed = () => {
	onAddWallPost((post) => {
		// аудио
		for (const attach of post.querySelectorAll<HTMLElement>('.SecondaryAttachment[data-audio]')) {
			onAddAttachAudio(attach).catch(console.error);
		}

		// плейлисты
		for (const attach of post.querySelectorAll<HTMLElement>('.SecondaryAttachment[data-playlist-id]')) {
			onAddAttachPlaylist(attach).catch(console.error);
		}
	});
};

export default initFeed;
