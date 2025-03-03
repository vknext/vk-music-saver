import type { NotifierEvent } from 'src/global';
import lang from 'src/lang';
import arrayUnFlat from 'src/lib/arrayUnFlat';
import delay from 'src/lib/delay';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import getPlaylistById from 'src/musicUtils/getPlaylistById';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './getBlobAudioFromPlaylist';

const downloadPlaylist = async (playlistFullId: string) => {
	const [fsDirHandle, isNumTracks] = await getFSDirectoryHandle({
		id: 'playlist_music',
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

	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	const playlist = await getPlaylistById({
		owner_id: parseInt(ownerId),
		playlist_id: parseInt(playlistId),
		access_key: playlistAccessKey,
	});

	if (!playlist) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
		return;
	}

	if (playlist?.error?.error_msg) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: playlist.error.error_msg });
		return;
	}

	if (!playlist.audios?.length) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_is_empty') });
		return;
	}

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const albumArtists = (playlist.main_artists || []).map((performer) => performer.name);

	const nameChunks = [];

	if (albumArtists.length) {
		nameChunks.push(`${albumArtists.join(', ')} - `);
	}

	if (playlist.title) {
		nameChunks.push(playlist.title);
	} else {
		nameChunks.push('playlist');
	}

	const playlistFolderName = unescapeHTML(nameChunks.join(''));
	const filename = `${playlistFolderName}.zip`;

	const promises: Promise<ClientZipFile | null | void>[] = [];

	let audioIndex = 1;

	let progress = 0;
	const totalAudios = playlist.audios.length;

	setText(`${fsDirHandle ? playlistFolderName : filename} (${progress}/${totalAudios})`);

	const updateProgress = () => {
		progress++;

		setText(`${fsDirHandle ? playlistFolderName : filename} (${progress}/${totalAudios})`);
	};

	for (const audios of arrayUnFlat(playlist.audios, 8)) {
		if (signal.aborted) return;

		for (const audio of audios) {
			const zipFilePromise = getBlobAudioFromPlaylist({
				audio,
				lastModified,
				signal,
				playlist,
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
						dirHandle: fsDirHandle,
						subFolderName: playlistFolderName,
					})
				);
			} else {
				promises.push(zipFilePromise);
			}
		}

		await Promise.all(promises);
	}

	const results = await Promise.all(promises);

	const files = results.filter((f) => !!f);

	if (signal.aborted) return;

	if (fsDirHandle) {
		await Promise.all(promises);

		setText(
			lang.use('vms_fs_music_playlist_done', {
				folderName: playlistFolderName,
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

export default downloadPlaylist;
