import { Ranges } from '@vknext/shared/lib/Ranges';
import { arrayUnFlat } from '@vknext/shared/utils/arrayUnFlat';
import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import showSnackbar from 'src/react/showSnackbar';
import {
	type MessagesGetConversationsByIdResponse,
	type MessagesGetHistoryAttachmentsResponse,
	type UsersGetResponse,
} from 'src/schemas/responses';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './downloadPlaylist/getBlobAudioFromPlaylist';

async function* getAudios(ownerId: number) {
	let count = 100;
	let next_from: string | undefined;

	let isBreak = false;

	const vkApi = await waitVKApi();

	do {
		const params: Record<string, string | number> = { media_type: 'audio', peer_id: ownerId, count };

		if (next_from) {
			params.start_from = next_from;
		}

		const response = await vkApi.api<MessagesGetHistoryAttachmentsResponse>(
			'messages.getHistoryAttachments',
			params
		);

		next_from = response.next_from;

		yield response;

		if (response.items.length === 0) {
			isBreak = true;

			return;
		}
	} while (isBreak === false);
}

const downloadChatMusic = async (peerId: number) => {
	const [fsDirHandle, isNumTracks] = await getFSDirectoryHandle({
		id: `chat_music_${peerId}`,
		startIn: 'music',
	});

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	let subFolderName = `convo${peerId}`;
	let photoUrl = undefined;

	try {
		if (Ranges.isChatId(peerId)) {
			const { items } = await window.vkApi.api<MessagesGetConversationsByIdResponse>(
				'messages.getConversationsById',
				{
					peer_ids: peerId,
				}
			);

			const chatSettings = items[0]?.chat_settings;

			if (chatSettings?.title) {
				subFolderName = chatSettings.title;
			}

			photoUrl = chatSettings?.photo?.photo_50 || chatSettings?.photo?.photo_100;
		} else if (Ranges.isUserId(peerId)) {
			const [user] = await window.vkApi.api<UsersGetResponse>('users.get', {
				fields: 'photo_100,is_nft',
				user_ids: peerId,
			});

			if (user) {
				subFolderName = `${user.first_name} ${user.last_name}`;
				photoUrl = user.photo_100;
			}
		}
	} catch (e) {
		console.error(e);
	}

	const filename = `${subFolderName}.zip`;

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const taskId = `convo_music${peerId}`;

	const { setProgress, startArchiving, finish } = startDownload({
		id: taskId,
		title: fsDirHandle ? subFolderName : filename,
		type: DownloadType.CONVO,
		onCancel: () => controller.abort(),
		photoUrl: photoUrl,
	});

	const promises: Promise<ClientZipFile | null | void>[] = [];

	let audioIndex = 1;

	let progress = 0;
	let totalAudios = 0;

	const updateProgress = () => {
		if (signal.aborted) return;

		progress++;

		setProgress({
			current: progress,
			total: totalAudios,
		});
	};

	try {
		for await (const { items } of getAudios(peerId)) {
			if (signal.aborted) return;

			totalAudios += items.length;

			for (const itemsChunk of arrayUnFlat(items, 8)) {
				if (signal.aborted) return;

				for (const { attachment } of itemsChunk) {
					if (attachment?.type !== 'audio') continue;

					const zipFilePromise = getBlobAudioFromPlaylist({
						audio: attachment.audio,
						lastModified,
						signal,
						audioIndex: audioIndex++,
						isNumTracksInPlaylist: isNumTracks || false,
					});

					zipFilePromise.then(() => {
						updateProgress();
					});

					if (fsDirHandle) {
						promises.push(
							createFileInDirectory({
								zipFilePromise,
								subFolderName,
								dirHandle: fsDirHandle,
							})
						);
					} else {
						promises.push(zipFilePromise);
					}
				}

				await Promise.all(promises);
			}
		}
	} catch (e) {
		console.error(e);

		await showSnackbar({ type: 'warning', text: `VK Music Saver (${filename})`, subtitle: e.message });
	}

	if (fsDirHandle) {
		await Promise.all(promises);

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_done'),
			subtitle: subFolderName,
		});

		finish();

		return;
	}

	const results = await Promise.all(promises);

	const files = results.filter(Boolean) as ClientZipFile[];

	if (signal.aborted) return;

	startArchiving();

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	const onSave = () => saveFileAs(blobUrl, filename);
	const onRemove = () => URL.revokeObjectURL(blobUrl);

	await onSave();

	finish({ onSave, onRemove });
};

export default downloadChatMusic;
