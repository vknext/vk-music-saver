import { getReactAttrs } from '@vknext/shared/utils/getReactAttrs';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import { waitRAF } from '@vknext/shared/utils/waitRAF';
import { waitBoxQueue } from '@vknext/shared/vkcom/globalVars/waitBoxQueue';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import observedElementsCleaner from 'src/common/observedElementsCleaner';
import { generateObservedElementMBSKey } from 'src/common/observedHTMLElements/generateKeys';
import downloadAudio from 'src/downloaders/downloadAudio';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import onAddWallPost from 'src/interactions/onAddWallPost';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import humanFileSize from 'src/lib/humanFileSize';
import { formatBitrate } from 'src/musicUtils/formatBitrate';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import showSnackbar from 'src/react/showSnackbar';
import type { DownloadTargetElement } from 'src/types';
import type { ObservedHTMLElement } from 'src/types/global';

const LIST_MBS = generateObservedElementMBSKey();

const onAddAttachAudio = async (attach: DownloadTargetElement, audioObject?: AudioObject) => {
	if (!audioObject) {
		const audio = attach.dataset.audio;
		if (!audio) return;

		audioObject = window.AudioUtils.audioTupleToAudioObject(JSON.parse(audio))!;
	}
	if (!audioObject || audioObject?.restrictionStatus || !audioObject.url) return;

	if (attach.vms_down_inj) return;
	attach.vms_down_inj = true;

	await waitRAF();

	const afterWrapper = attach.querySelector<HTMLElement>(
		`.SecondaryAttachment__after,[data-testid="secondaryattachment-after"],[class*="SecondaryAttachment__after"]`
	);
	if (!afterWrapper) return;

	let controller: AbortController | null = null;
	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({
		iconSize: 24,
		cancelable: true,
	});

	let size: number | undefined = undefined;

	const updateBitrate = async () => {
		const result = await getAudioBitrate(audioObject);

		const text = [];

		if (result?.bitrate) {
			text.push(formatBitrate(result.bitrate));
		}

		if (result?.size) {
			size = result.size;

			text.push(
				humanFileSize(result.size, {
					decimals: 2,
					units: lang.use('vms_size_units', null, 'raw') as unknown as string[],
				})
			);
		}

		setText(text.join('\n'));
	};

	updateBitrate().catch(console.error);

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) {
			if (controller) {
				controller.abort();
				controller = null;
			}
			return;
		}

		if (!controller || controller.signal.aborted) {
			controller = new AbortController();
		}

		setIsLoading(true);
		setText(lang.use('vms_loading'));

		downloadAudio({
			audioObject,
			size,
			onProgress: (progress) => {
				setText(`${progress}%`);
			},
			signal: controller.signal,
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

const onAddAttachPlaylist = async (attach: DownloadTargetElement, playlistId?: string[]) => {
	if (!playlistId || playlistId.length === 0) {
		playlistId = [];

		if (attach.dataset.ownerId) {
			playlistId.push(attach.dataset.ownerId);
		}

		if (attach.dataset.playlistId) {
			playlistId.push(attach.dataset.playlistId);
		}

		if (attach.dataset.accessKey) {
			playlistId.push(attach.dataset.accessKey);
		}
	}

	if (!playlistId.length) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	if (attach.vms_down_inj) return;
	attach.vms_down_inj = true;

	await waitRAF();

	const afterWrapper = attach.querySelector<HTMLElement>(
		`.SecondaryAttachment__after,[data-testid="secondaryattachment-after"],[class*="SecondaryAttachment__after"]`
	);
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

const onAddSecondaryAttachRoot = async (attach: DownloadTargetElement) => {
	const { fiber } = getReactAttrs(attach);

	const originalAttachment =
		fiber.return.return.return.return.return.return.memoizedProps.originalAttachment ||
		fiber.return.return.return.return.return.memoizedProps.originalAttachment ||
		fiber.return.return.return.return.memoizedProps.originalAttachment;

	if (originalAttachment?.audio) {
		const audioObject = window.AudioUtils.audioTupleToAudioObject(originalAttachment.audio);
		if (!audioObject || audioObject?.restrictionStatus) return;

		onAddAttachAudio(attach, audioObject);
	}

	if (originalAttachment?.audio_playlist) {
		const playlist = originalAttachment.audio_playlist;

		const playlistId = [];

		if (playlist.owner_id) {
			playlistId.push(playlist.owner_id);
		}

		if (playlist.id) {
			playlistId.push(playlist.id);
		}

		if (playlist.access_key) {
			playlistId.push(playlist.access_key);
		}

		if (!playlistId.length) {
			return;
		}

		await onAddAttachPlaylist(attach, playlistId);
	}
};

const onAddPrimaryAttach = async (attach: DownloadTargetElement) => {
	const { fiber } = getReactAttrs(attach);
	const audio = fiber?.return?.return?.memoizedProps?.audio;
	if (!audio) return;

	const buttons = attach.querySelector('.vkuiButtonGroup__host');
	if (!buttons) {
		console.error('[onAddPrimaryAttach] buttons not found');
		return;
	}

	if (attach.vms_down_inj) return;
	attach.vms_down_inj = true;

	let controller: AbortController | null = null;
	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({
		iconSize: 24,
		enableDefaultText: false,
		cancelable: true,
	});

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) {
			if (controller) {
				controller.abort();
				controller = null;
			}
			return;
		}

		if (!controller || controller.signal.aborted) {
			controller = new AbortController();
		}

		setIsLoading(true);
		setText(lang.use('vms_loading'));

		downloadAudio({
			audioObject: audio,
			onProgress: (progress) => {
				setText(`${progress}%`);
			},
			signal: controller.signal,
		}).finally(() => {
			setIsLoading(false);

			setText('');
		});
	});

	buttons.appendChild(element);
};

const onAddPost = (post: HTMLElement) => {
	// аудио
	for (const attach of post.querySelectorAll<HTMLElement>('.SecondaryAttachment[data-audio]')) {
		onAddAttachAudio(attach).catch(console.error);
	}

	// плейлисты
	for (const attach of post.querySelectorAll<HTMLElement>('.SecondaryAttachment[data-playlist-id]')) {
		onAddAttachPlaylist(attach).catch(console.error);
	}

	// secondary attach
	for (const attach of post.querySelectorAll<HTMLElement>('[class*="SecondaryAttachment__root"]')) {
		onAddSecondaryAttachRoot(attach).catch(console.error);
	}

	for (const list of post.querySelectorAll<ObservedHTMLElement>('[class*="SecondaryAttachmentList__root"]')) {
		if (list[LIST_MBS]) continue;

		list[LIST_MBS] = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList' && mutation.addedNodes.length) {
					for (const node of mutation.addedNodes) {
						if (node.nodeType === 1) {
							onAddSecondaryAttachRoot(node as ObservedHTMLElement).catch(console.error);
						}
					}
				}
			}
		});

		list[LIST_MBS].observe(list, {
			childList: true,
		});

		observedElementsCleaner.add(list);
	}

	// primary музыка
	for (const attach of post.querySelectorAll<HTMLElement>('[class*="PrimaryAttachmentAudio__container"]')) {
		onAddPrimaryAttach(attach);
	}
};

const onAddBoxNode = async (layoutNode: HTMLElement) => {
	for (const musicCell of layoutNode.querySelectorAll<DownloadTargetElement>('[class*="MusicCell__musicCell"]')) {
		const { fiber } = getReactAttrs(musicCell);
		const apiAudio =
			fiber?.return?.return?.return?.return?.return?.return?.return?.return?.memoizedProps?.audio?.entity
				?.apiAudio;
		if (!apiAudio) continue;

		if (musicCell.vms_down_inj) continue;
		musicCell.vms_down_inj = true;

		let controller: AbortController | null = null;
		const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({
			iconSize: 24,
			cancelable: true,
		});

		let size: number | undefined = undefined;

		const updateBitrate = async () => {
			const result = await getAudioBitrate(apiAudio);

			const text = [];

			if (result?.bitrate) {
				text.push(`${result.bitrate} kb/s`);
			}

			if (result?.size) {
				size = result.size;

				text.push(
					humanFileSize(result.size, {
						decimals: 2,
						units: lang.use('vms_size_units', null, 'raw') as unknown as string[],
					})
				);
			}

			setText(text.join('\n'));
		};

		updateBitrate().catch(console.error);

		element.addEventListener('click', (event) => {
			cancelEvent(event);

			if (getIsLoading()) {
				if (controller) {
					controller.abort();
					controller = null;
				}
				return;
			}

			if (!controller || controller.signal.aborted) {
				controller = new AbortController();
			}

			setIsLoading(true);
			setText(lang.use('vms_loading'));

			downloadAudio({
				audioObject: apiAudio,
				size,
				signal: controller.signal,
				onProgress: (progress) => {
					setText(`${progress}%`);
				},
			}).finally(() => {
				setIsLoading(false);

				updateBitrate().catch(console.error);
			});
		});

		musicCell.appendChild(element);
	}
};

const initFeed = () => {
	onAddWallPost(onAddPost);

	waitBoxQueue().then(() => {
		const _show = window.boxQueue._show;

		window.boxQueue._show = function (...rest) {
			const r = Reflect.apply(_show, window.boxQueue, rest);

			try {
				const [boxId] = rest;
				const currentBox = window._message_boxes[boxId];

				if (currentBox?.boxLayoutNode) {
					requestAnimationFrame(() => onAddBoxNode(currentBox.boxLayoutNode));
				}
			} catch (e) {
				console.error(e);
			}

			return r;
		};
	});

	onDocumentComplete(() => {
		const boxLayoutNode = document.querySelector<HTMLElement>('.box_layout');

		if (boxLayoutNode) {
			requestAnimationFrame(() => onAddBoxNode(boxLayoutNode));
		}
	});
};

export default initFeed;
