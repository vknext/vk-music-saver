import { vknextApi } from 'src/api';
import lang from 'src/lang';
import { Downloader } from 'src/lib/Downloader';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import sanitizeFolderName from 'src/musicUtils/fileSystem/sanitizeFolderName';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import { prepareTrackStream } from 'src/musicUtils/prepareTrackStream';
import showSnackbar from 'src/react/showSnackbar';
import { AudioPlaylistType } from 'src/schemas/enums';
import type { AudioAudio } from 'src/schemas/objects';
import { PlaylistSource } from 'src/sources/PlaylistSource';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, getDownloadActiveTasksCount, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import { incrementDownloadedPlaylistsCount } from '../utils';
import formatDownloadedTrackName from './formatDownloadedTrackName';
import { formatPlaylistName } from './formatPlaylistName';

const AVERAGE_TRACK_SIZE = 200 * 40152;

const downloadPlaylist = async (playlistFullId: string) => {
	if (window.vk?.id === 0) {
		return await showSnackbar({
			type: 'warning',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_download_auth_required'),
		});
	}

	const playlist = PlaylistSource.fromRawId(playlistFullId);

	const [playlistMeta, playlistIsReverse] = await Promise.all([
		playlist.getMeta(),
		GlobalStorage.getValue('download_playlist_in_reverse', false),
	]);

	if (!playlistMeta) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	const playlistFolderName = sanitizeFolderName(formatPlaylistName(playlistMeta));
	const zipFileName = `${playlistFolderName}.zip`;

	const fsDirHandle = await getFSDirectoryHandle({
		id: 'playlist_music',
		startIn: 'music',
		suggestedFileName: zipFileName,
		fileTypes: [{ description: 'ZIP Archive', accept: { 'application/zip': ['.zip'] } }],
	});

	showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') }).catch(console.error);

	const controller = new AbortController();
	const lastModified = new Date();

	if (getDownloadActiveTasksCount() > 2) {
		showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_concurrent_downloads_recommendation') }).catch(
			console.error
		);
	}

	const { setProgress, finish, setStats, setExtraText, cancel } = startDownload({
		id: `playlist${playlistFullId}_${Math.random()}`,
		title: fsDirHandle ? playlistFolderName : zipFileName,
		type: DownloadType.PLAYLIST,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(playlistMeta) || undefined,
	});

	const [playlistStream, isNumTracks, convertMethod, embedTags, enableLyricsTags] = await Promise.all([
		playlist.getStream({ reverse: playlistIsReverse }),
		GlobalStorage.getValue('num_tracks_in_playlist', true),
		GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
		GlobalStorage.getValue('audio_write_id3_tags', true),
		GlobalStorage.getValue('audio_write_genius_lyrics', true),
	]);

	if (playlistStream.total === 0) {
		cancel();

		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_is_empty'),
		});
	}

	let progress = 0;

	setProgress({ current: 0, total: playlistStream.total });

	const updateProgress = () => {
		if (controller.signal.aborted) return;

		progress++;

		setProgress({ current: progress, total: playlistStream.total });
	};

	const isUGCPlaylist = playlistMeta.type === AudioPlaylistType.UGC;

	const downloadTrack = async (audio: AudioAudio, index: number): Promise<ClientZipFile | null> => {
		const stream = prepareTrackStream({
			audio,
			playlist: isUGCPlaylist ? null : playlistMeta,
			embedTags,
			enableLyricsTags,
			convertMethod,
		});

		if (!stream) return null;

		const trackName = await formatDownloadedTrackName({
			isPlaylist: true,
			audio,
			index: isNumTracks ? index : undefined,
			totalAudios: playlistStream.total,
		});

		const zipFile: ClientZipFile = {
			name: `${trackName}.mp3`,
			lastModified: audio.date ? new Date(audio.date * 1000) : lastModified,
			input: stream,
		};

		return zipFile;
	};

	async function* trackGenerator() {
		let index = 1;

		for await (const audio of playlistStream.items) {
			if (controller.signal.aborted) throw new Error('Aborted');

			const item = await downloadTrack(audio, index++);

			if (item) {
				yield item;

				setExtraText(lang.use('vms_playlist_track_download_completed', { trackName: item.name }));
				updateProgress();
			}
		}
	}

	const downloader = new Downloader(trackGenerator(), { signal: controller.signal, onProgress: setStats });

	try {
		await downloader.save(fsDirHandle, {
			name: playlistFolderName,
			size: Math.round(playlistStream.total * AVERAGE_TRACK_SIZE),
		});
	} catch (err) {
		showSnackbar({ text: 'VK Music Saver', subtitle: err.message }).catch(console.error);

		throw err;
	}

	if (controller.signal.aborted) return;

	if (fsDirHandle) {
		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_playlist_done'),
			subtitle: playlistFolderName,
		});
	}

	finish();

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

	await Promise.all([
		incrementDownloadedPlaylistsCount(),
		vknextApi.call('vms.stat', { type: 'ap', data: progress }),
	]);
};

export default downloadPlaylist;
