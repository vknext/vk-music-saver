import { vknextApi } from 'src/api';
import lang from 'src/lang';
import { streamSaver } from 'src/lib/streamSaver';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import sanitizeFolderName from 'src/musicUtils/fileSystem/sanitizeFolderName';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import { prepareTrackStream } from 'src/musicUtils/prepareTrackStream';
import showSnackbar from 'src/react/showSnackbar';
import { AudioPlaylistType } from 'src/schemas/enums';
import type { AudioAudio } from 'src/schemas/objects';
import getAudioPlaylistById from 'src/services/getAudioPlaylistById';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, getDownloadActiveTasksCount, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import { incrementDownloadedPlaylistsCount } from '../utils';
import formatDownloadedTrackName from './formatDownloadedTrackName';
import { formatPlaylistName } from './formatPlaylistName';

const downloadPlaylist = async (playlistFullId: string) => {
	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	const [fsDirHandle, playlist, playlistIsReverse, isNumTracks, convertMethod, embedTags, enableLyricsTags] =
		await Promise.all([
			getFSDirectoryHandle({
				id: 'playlist_music',
				startIn: 'music',
			}),
			getAudioPlaylistById({
				owner_id: parseInt(ownerId),
				playlist_id: parseInt(playlistId),
				access_key: playlistAccessKey,
				withTracks: true,
			}),
			GlobalStorage.getValue('download_playlist_in_reverse', false),
			GlobalStorage.getValue('num_tracks_in_playlist', true),
			GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
			GlobalStorage.getValue('audio_write_id3_tags', true),
			GlobalStorage.getValue('audio_write_genius_lyrics', true),
		]);

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

	if (playlistIsReverse) {
		playlist.audios.reverse();
	}

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const playlistFolderName = sanitizeFolderName(formatPlaylistName(playlist));
	const zipFileName = `${playlistFolderName}.zip`;

	const taskId = `playlist${playlistFullId}`;

	const activeTasksCount = getDownloadActiveTasksCount();

	if (activeTasksCount > 2) {
		await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_concurrent_downloads_recommendation') });
	}

	const { setProgress, finish, setExtraText } = startDownload({
		id: taskId,
		title: fsDirHandle ? playlistFolderName : zipFileName,
		type: DownloadType.PLAYLIST,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(playlist) || undefined,
	});

	let progress = 0;
	const totalAudios = playlist.audios.length;

	setProgress({ current: 0, total: totalAudios });

	const updateProgress = () => {
		if (signal.aborted) return;

		progress++;

		setProgress({ current: progress, total: totalAudios });
	};

	const isUGCPlaylist = playlist.type === AudioPlaylistType.UGC;

	const downloadTrack = async (audio: AudioAudio, index: number): Promise<ClientZipFile | null> => {
		const stream = prepareTrackStream({
			audio,
			playlist: isUGCPlaylist ? null : playlist,
			embedTags,
			enableLyricsTags,
			convertMethod,
		});

		if (!stream) return null;

		const trackName = await formatDownloadedTrackName({
			isPlaylist: true,
			audio,
			index: isNumTracks ? index : undefined,
			totalAudios,
		});

		const zipFile: ClientZipFile = {
			name: `${trackName}.mp3`,
			lastModified: audio.date ? new Date(audio.date * 1000) : lastModified,
			input: stream,
		};

		return zipFile;
	};

	async function* trackGenerator() {
		if (!playlist || !playlist.audios?.length) return;

		let index = 1;

		for (const audio of playlist.audios) {
			if (signal.aborted) throw new Error('Aborted');

			const item = await downloadTrack(audio, index++);

			if (item) {
				yield item;

				setExtraText(lang.use('vms_playlist_track_download_completed', { trackName: item.name }));
				updateProgress();
			}
		}
	}

	if (fsDirHandle) {
		for await (const zipFile of trackGenerator()) {
			await createFileInDirectory({
				zipFile,
				subFolderName: playlistFolderName,
				dirHandle: fsDirHandle,
				signal,
			});
		}

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_playlist_done'),
			subtitle: playlistFolderName,
		});
	} else {
		const { makeZip } = await import('client-zip');

		const zipStream = makeZip(trackGenerator());

		const fileStream = streamSaver.createWriteStream(zipFileName, {
			size: Math.round(playlist.audios.reduce((acc, audio) => acc + audio.duration, 0) * 40152),
		});

		await zipStream.pipeTo(fileStream, { signal });
	}

	if (signal.aborted) return;

	finish();

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

	await Promise.all([
		incrementDownloadedPlaylistsCount(),
		vknextApi.call('vms.stat', { type: 'ap', data: progress }),
	]);
};

export default downloadPlaylist;
