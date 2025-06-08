import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import { MAX_PARALLEL_AUDIO_CONVERSION } from 'src/common/constants';
import lang from 'src/lang';
import { padWithZeros } from 'src/lib/padWithZeros';
import saveFileAs from 'src/lib/saveFileAs';
import TaskLimiter from 'src/lib/TaskLimiter';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import showSnackbar from 'src/react/showSnackbar';
import type { AudioAudio } from 'src/schemas/objects';
import { UsersGetResponse, type AudioGetResponse } from 'src/schemas/responses';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import getBlobAudioFromPlaylist from './downloadPlaylist/getBlobAudioFromPlaylist';
import { incrementDownloadedPlaylistsCount } from './utils';

async function* getAudios(ownerId: number) {
	let offset = 0;
	let count = 200;
	let allAudiosCount = count + 1;

	const vkApi = await waitVKApi();

	do {
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

	const fsDirHandle = await getFSDirectoryHandle({
		id: `user_music_${ownerId}`,
		startIn: 'music',
	});

	const [isNumTracks, isAddLeadingZeros] = await Promise.all([
		GlobalStorage.getValue('num_tracks_in_playlist', true),
		GlobalStorage.getValue('add_leading_zeros', false),
	]);

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

	const { setProgress, startArchiving, finish, setExtraText } = startDownload({
		id: taskId,
		title: fsDirHandle ? subFolderName : filename,
		type: DownloadType.OWNER_MUSIC,
		onCancel: () => controller.abort(),
		photoUrl: photoUrl,
	});

	const limiter = new TaskLimiter<ClientZipFile | null | void>(MAX_PARALLEL_AUDIO_CONVERSION);

	let audioIndex = 1;

	let progress = 0;
	let totalAudios = 0;

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
			const blob = await getBlobAudioFromPlaylist({ writeGeniusLyrics, writeTags, convertMethod, audio, signal });
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
				return await createFileInDirectory({ zipFile, subFolderName, dirHandle: fsDirHandle });
			}

			return zipFile;
		} catch (e) {
			console.error(e);
		}
	};

	try {
		for await (const { count, items } of getAudios(ownerId)) {
			if (signal.aborted) return;

			if (totalAudios !== count) {
				totalAudios = count;
			}

			for (const audio of items) {
				const position = audioIndex++;

				limiter.addTask(() => downloadTrack(audio, position));
			}

			await limiter.waitAll();
		}
	} catch (e) {
		console.error(e);

		await showSnackbar({ type: 'warning', text: `VK Music Saver (${filename})`, subtitle: e.message });
	}

	const results = await limiter.waitAll();
	const files = results.filter((f) => !!f);

	if (signal.aborted) return;

	if (fsDirHandle) {
		setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_done'),
			subtitle: subFolderName,
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

export default downloadUserAudio;
