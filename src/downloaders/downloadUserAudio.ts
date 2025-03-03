import type { NotifierEvent } from 'src/global';
import waitVkApi from 'src/globalVars/waitVkApi';
import lang from 'src/lang';
import arrayUnFlat from 'src/lib/arrayUnFlat';
import delay from 'src/lib/delay';
import saveFileAs from 'src/lib/saveFileAs';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import type { AudioGetParams } from 'src/schemas/params';
import type { AudioGetResponse } from 'src/schemas/responses';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './downloadPlaylist/getBlobAudioFromPlaylist';

async function* getAudios(ownerId: number) {
	let offset = 0;
	let count = 200;
	let allAudiosCount = count + 1;

	do {
		const vkApi = await waitVkApi();

		const response = await vkApi.api<AudioGetParams, AudioGetResponse>('audio.get', {
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
	const [fsDirHandle, isNumTracks] = await getFSDirectoryHandle({
		id: `user_music_${ownerId}`,
		startIn: 'music',
	});

	const event: NotifierEvent = {
		title: 'VK Music Saver',
		text: lang.use('vms_downloading'),
	};

	try {
		window.Notifier.showEvent(event);
	} catch (e) {
		console.error(e);
	}

	// отменяем скрытие элемента
	clearTimeout(event.closeTO);
	clearTimeout(event.fadeTO);
	delete event.startFading;

	const setText = (text: string) => {
		if (!event.baloonEl) return;
		if (!event.baloonEl.closest('body')) return;

		const msg = event.baloonEl.getElementsByClassName('notifier_baloon_msg')[0] as HTMLElement;
		if (!msg) return;

		msg.innerText = text;
	};

	let subFolderName = `audios${ownerId}`;

	try {
		const [user] = await window.vkApi.api('users.get', {
			fields: 'photo_100,is_nft',
			user_ids: ownerId,
		});

		if (user) {
			subFolderName = `${user.first_name} ${user.last_name}`;
		}
	} catch (e) {
		console.error(e);
	}

	const filename = `${subFolderName}.zip`;

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const promises: Promise<ClientZipFile | null | void>[] = [];

	let audioIndex = 1;

	let progress = 0;
	let totalAudios = 0;

	const updateProgress = () => {
		progress++;

		setText(`${fsDirHandle ? subFolderName : filename} (${progress}/${totalAudios})`);
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
		setText(`${filename} error: (${e.message})`);
	}

	if (fsDirHandle) {
		await Promise.all(promises);

		setText(
			lang.use('vms_fs_music_playlist_done', {
				folderName: subFolderName,
			})
		);

		await delay(4000);

		try {
			window.Notifier.hideEvent(event);
		} catch (e) {
			console.error(e);
		}

		return;
	}

	const results = await Promise.all(promises);

	const files = results.filter(Boolean) as ClientZipFile[];

	if (signal.aborted) return;

	setText(`${filename} - ${lang.use('vms_archivation')}`);

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	try {
		window.Notifier.hideEvent(event);
	} catch (e) {
		console.error(e);
	}

	await saveFileAs(blobUrl, filename);

	URL.revokeObjectURL(blobUrl);
};

export default downloadUserAudio;
