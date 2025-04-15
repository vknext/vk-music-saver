import { arrayUnFlat } from '@vknext/shared/utils/arrayUnFlat';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import sanitizeFolderName from 'src/musicUtils/fileSystem/sanitizeFolderName';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import getPlaylistById from 'src/musicUtils/getPlaylistById';
import showSnackbar from 'src/react/showSnackbar';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './getBlobAudioFromPlaylist';

const downloadPlaylist = async (playlistFullId: string) => {
	if (window.vk.id === 0) {
		return await showSnackbar({
			type: 'warning',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_download_auth_required'),
		});
	}

	const [fsDirHandle, isNumTracks] = await getFSDirectoryHandle({
		id: 'playlist_music',
		startIn: 'music',
	});

	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	const playlist = await getPlaylistById({
		owner_id: parseInt(ownerId),
		playlist_id: parseInt(playlistId),
		access_key: playlistAccessKey,
	});

	if (!playlist) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	if (playlist?.error?.error_msg) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: playlist.error.error_msg,
		});
	}

	if (!playlist.audios?.length) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_is_empty'),
		});
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

	const playlistFolderName = sanitizeFolderName(unescapeHTML(nameChunks.join('')));
	const filename = `${playlistFolderName}.zip`;

	const taskId = `playlist${playlistFullId}`;

	const { setProgress, startArchiving, finish } = startDownload({
		id: taskId,
		title: fsDirHandle ? playlistFolderName : `${unescapeHTML(nameChunks.join(''))}.zip`,
		type: DownloadType.PLAYLIST,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(playlist) || undefined,
	});

	const promises: Promise<ClientZipFile | null | void>[] = [];

	let audioIndex = 1;

	let progress = 0;
	const totalAudios = playlist.audios.length;

	setProgress({
		current: 0,
		total: totalAudios,
	});

	const updateProgress = () => {
		if (signal.aborted) return;

		progress++;

		setProgress({
			current: progress,
			total: totalAudios,
		});
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

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_playlist_done'),
			subtitle: playlistFolderName,
		});

		finish();

		return;
	}

	startArchiving();

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	const onSave = () => saveFileAs(blobUrl, filename);
	const onRemove = () => URL.revokeObjectURL(blobUrl);

	await onSave();

	finish({ onSave, onRemove });
};

export default downloadPlaylist;
