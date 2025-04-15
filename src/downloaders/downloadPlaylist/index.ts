import { MAX_PARALLEL_AUDIO_CONVERSION } from 'src/common/constants';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import TaskLimiter from 'src/lib/TaskLimiter';
import unescapeHTML from 'src/lib/unescapeHTML';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import sanitizeFolderName from 'src/musicUtils/fileSystem/sanitizeFolderName';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import getPlaylistById from 'src/musicUtils/getPlaylistById';
import showSnackbar from 'src/react/showSnackbar';
import type { AudioAudio } from 'src/schemas/objects';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import formatTrackName from './formatTrackName';
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

	const { setProgress, startArchiving, finish, setExtraText } = startDownload({
		id: taskId,
		title: fsDirHandle ? playlistFolderName : `${unescapeHTML(nameChunks.join(''))}.zip`,
		type: DownloadType.PLAYLIST,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(playlist) || undefined,
	});

	const limiter = new TaskLimiter<ClientZipFile | null | void>(MAX_PARALLEL_AUDIO_CONVERSION);

	let audioIndex = 1;

	let progress = 0;
	const totalAudios = playlist.audios.length;

	setProgress({ current: 0, total: totalAudios });

	const updateProgress = () => {
		if (signal.aborted) return;

		progress++;

		setProgress({ current: progress, total: totalAudios });
	};

	const downloadTrack = async (audio: AudioAudio): Promise<void | ClientZipFile> => {
		try {
			const blob = await getBlobAudioFromPlaylist({ audio, signal });
			if (!blob) return;

			const trackName = formatTrackName({
				audio,
				isNumTracksInPlaylist: isNumTracks || false,
				index: audioIndex++,
			});

			const zipFile: ClientZipFile = {
				name: `${trackName}.mp3`,
				lastModified: audio.date ? new Date(audio.date * 1000) : lastModified,
				input: blob,
			};

			updateProgress();
			setExtraText(lang.use('vms_playlist_track_download_completed', { trackName }));

			if (fsDirHandle) {
				return await createFileInDirectory({
					zipFile,
					subFolderName: playlistFolderName,
					dirHandle: fsDirHandle,
				});
			}

			return zipFile;
		} catch (e) {
			console.error(e);
		}
	};

	for (const audio of playlist.audios) {
		limiter.addTask(() => downloadTrack(audio));
	}

	const results = await limiter.waitAll();
	const files = results.filter((f) => !!f);

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vkcom_tracks_plurals', progress) }));

	if (signal.aborted) return;

	if (fsDirHandle) {
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
