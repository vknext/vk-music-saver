import { MAX_PARALLEL_AUDIO_CONVERSION } from 'src/common/constants';
import lang from 'src/lang';
import { padWithZeros } from 'src/lib/padWithZeros';
import saveFileAs from 'src/lib/saveFileAs';
import TaskLimiter from 'src/lib/TaskLimiter';
import unescapeHTML from 'src/lib/unescapeHTML';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import sanitizeFolderName from 'src/musicUtils/fileSystem/sanitizeFolderName';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import showSnackbar from 'src/react/showSnackbar';
import type { AudioAudio } from 'src/schemas/objects';
import getAudioPlaylistById from 'src/services/getAudioPlaylistById';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import { incrementDownloadedPlaylistsCount } from '../utils';
import formatDownloadedTrackName from './formatDownloadedTrackName';
import getBlobAudioFromPlaylist from './getBlobAudioFromPlaylist';

const downloadPlaylist = async (playlistFullId: string) => {
	const fsDirHandle = await getFSDirectoryHandle({
		id: 'playlist_music',
		startIn: 'music',
	});

	const [isNumTracks, isAddLeadingZeros] = await Promise.all([
		GlobalStorage.getValue('num_tracks_in_playlist', true),
		GlobalStorage.getValue('add_leading_zeros', false),
	]);
	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	const playlist = await getAudioPlaylistById({
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

	if (await GlobalStorage.getValue('download_playlist_in_reverse', false)) {
		playlist.audios.reverse();
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

	const convertMethod = await GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE);
	const writeTags = await GlobalStorage.getValue('audio_write_id3_tags', true);
	const writeGeniusLyrics = await GlobalStorage.getValue('audio_write_genius_lyrics', true);

	const downloadTrack = async (audio: AudioAudio, index: number): Promise<void | ClientZipFile> => {
		try {
			const blob = await getBlobAudioFromPlaylist({
				writeGeniusLyrics,
				writeTags,
				convertMethod,
				audio,
				playlist,
				signal,
			});
			if (!blob) return;

			const bitrateResult = await getAudioBitrate(audio);

			const trackName = await formatDownloadedTrackName({
				isPlaylist: true,
				audio,
				index: isNumTracks ? (isAddLeadingZeros ? padWithZeros(index, totalAudios) : index) : undefined,
				bitrate: bitrateResult?.bitrate,
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
		const position = audioIndex++;

		limiter.addTask(() => downloadTrack(audio, position));
	}

	const results = await limiter.waitAll();
	const files = results.filter((f) => !!f);

	if (signal.aborted) return;

	if (fsDirHandle) {
		setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_playlist_done'),
			subtitle: playlistFolderName,
		});

		finish();

		await incrementDownloadedPlaylistsCount();

		return;
	}

	setExtraText('');
	startArchiving();

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	const onSave = () => saveFileAs(blobUrl, filename);
	const onRemove = () => URL.revokeObjectURL(blobUrl);

	await onSave();

	finish({ onSave, onRemove });

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

	await incrementDownloadedPlaylistsCount();
};

export default downloadPlaylist;
