import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import lang from 'src/lang';
import arrayUnFlat from 'src/lib/arrayUnFlat';
import saveFileAs from 'src/lib/saveFileAs';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import showSnackbar from 'src/react/showSnackbar';
import { UsersGetResponse, type AudioGetResponse } from 'src/schemas/responses';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './downloadPlaylist/getBlobAudioFromPlaylist';

async function* getAudios(ownerId: number) {
	let offset = 0;
	let count = 200;
	let allAudiosCount = count + 1;

	do {
		const vkApi = await waitVKApi();

		const response = await vkApi.api<AudioGetResponse>('audio.get', {
			owner_id: ownerId,
			offset,
			count,
		});

		allAudiosCount = response.count;
		offset += count;

		yield response;
	} while (offset === 0 || offset < allAudiosCount);
}

const downloadUserAudio = async (ownerId: number) => {
	if (window.vk.id === 0) {
		return await showSnackbar({
			type: 'warning',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_download_auth_required'),
		});
	}

	const [fsDirHandle, isNumTracks] = await getFSDirectoryHandle({
		id: `user_music_${ownerId}`,
		startIn: 'music',
	});

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	let subFolderName = `audios${ownerId}`;
	let photoUrl = undefined;

	try {
		const [user] = await window.vkApi.api<UsersGetResponse>('users.get', {
			fields: 'photo_100,is_nft',
			user_ids: ownerId,
		});

		if (user) {
			subFolderName = `${user.first_name} ${user.last_name}`;
			photoUrl = user.photo_100;
		}
	} catch (e) {
		console.error(e);
	}

	const filename = `${subFolderName}.zip`;

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const taskId = `music${ownerId}`;

	const { setProgress, startArchiving, finish } = startDownload({
		id: taskId,
		title: fsDirHandle ? subFolderName : filename,
		type: DownloadType.OWNER_MUSIC,
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
		for await (const { count, items } of getAudios(ownerId)) {
			if (signal.aborted) return;

			if (totalAudios !== count) {
				totalAudios = count;
			}

			for (const audios of arrayUnFlat(items, 8)) {
				if (signal.aborted) return;

				for (const audio of audios) {
					const zipFilePromise = getBlobAudioFromPlaylist({
						audio,
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
			text: 'VK Music Saver',
			subtitle: lang.use('vms_fs_music_playlist_done', {
				folderName: subFolderName,
			}),
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

export default downloadUserAudio;
