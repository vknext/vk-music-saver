import { arrayUnFlat } from '@vknext/shared/utils/arrayUnFlat';
import { vknextApi } from 'src/api';
import lang from 'src/lang';
import { Downloader } from 'src/lib/Downloader';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import { prepareTrackStream } from 'src/musicUtils/prepareTrackStream';
import showSnackbar from 'src/react/showSnackbar';
import type { AudioAudio } from 'src/schemas/objects';
import {
	UsersGetResponse,
	type AudioGetAudioIdsBySourceResponse,
	type AudioGetByIdResponse,
} from 'src/schemas/responses';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import { incrementDownloadedPlaylistsCount } from './utils';

const getAudios = async (ownerId: number, signal?: AbortSignal) => {
	const { audios: audioIds } = await vkApi.api<AudioGetAudioIdsBySourceResponse>(
		'audio.getAudioIdsBySource',
		{
			source: 'playlist',
			entity_id: `${ownerId}_-1`,
		},
		{},
		{ signal }
	);

	const promises: Promise<AudioGetByIdResponse>[] = [];

	for (const ids of arrayUnFlat(audioIds, 100)) {
		const promise = vkApi.api<AudioGetByIdResponse>(
			'audio.getById',
			{
				audios: ids.map((e) => e.audio_id).join(','),
			},
			{},
			{ signal }
		);

		promises.push(promise);

		if (promises.length % 10 === 0) {
			await Promise.all(promises);
		}
	}

	return (await Promise.all(promises)).flat();
};

const getUserDetails = async (ownerId: number) => {
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

	return { subFolderName, photoUrl };
};

const downloadUserAudio = async (ownerId: number) => {
	if (window.vk?.id === 0) {
		return await showSnackbar({
			type: 'warning',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_download_auth_required'),
		});
	}

	const [{ subFolderName, photoUrl }, isNumTracks, convertMethod, embedTags, enableLyricsTags] = await Promise.all([
		getUserDetails(ownerId),
		GlobalStorage.getValue('num_tracks_in_playlist', true),
		GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
		GlobalStorage.getValue('audio_write_id3_tags', true),
		GlobalStorage.getValue('audio_write_genius_lyrics', true),
	]);

	const zipFileName = `${subFolderName}.zip`;

	const fsDirHandle = await getFSDirectoryHandle({
		id: `user_music_${ownerId}`,
		startIn: 'music',
		suggestedFileName: zipFileName,
		fileTypes: [{ description: 'ZIP Archive', accept: { 'application/zip': ['.zip'] } }],
	});

	showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') }).catch(console.error);

	const controller = new AbortController();
	const lastModified = new Date();

	const { setProgress, finish, setStats, setExtraText } = startDownload({
		id: `music${ownerId}_${crypto.randomUUID()}`,
		title: fsDirHandle ? subFolderName : zipFileName,
		type: DownloadType.OWNER_MUSIC,
		onCancel: () => controller.abort(),
		photoUrl: photoUrl,
	});

	let progress = 0;
	let totalAudios = 0;

	const updateProgress = () => {
		if (controller.signal.aborted) return;

		progress++;

		setProgress({ current: progress, total: totalAudios });
	};

	const downloadTrack = async (audio: AudioAudio, index: number): Promise<null | ClientZipFile> => {
		const stream = prepareTrackStream({
			audio,
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
		const audios = await getAudios(ownerId, controller.signal);

		totalAudios = audios.length;

		let index = 1;

		for (const audio of audios) {
			if (controller.signal.aborted) throw new Error('Aborted');

			const item = await downloadTrack(audio, index++);

			if (item) {
				yield item;

				setExtraText(lang.use('vms_playlist_track_download_completed', { trackName: item.name }));
				updateProgress();
			}
		}
	}

	const downloader = new Downloader(trackGenerator(), {
		signal: controller.signal,
		onProgress: (stats) => setStats(stats),
	});

	try {
		await downloader.save(fsDirHandle, { name: subFolderName });
	} catch (err) {
		showSnackbar({ text: 'VK Music Saver', subtitle: err.message }).catch(console.error);

		throw err;
	}

	if (controller.signal.aborted) return;

	if (fsDirHandle) {
		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_done'),
			subtitle: subFolderName,
		});
	}

	finish();

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

	await incrementDownloadedPlaylistsCount();

	await vknextApi.call('vms.stat', { type: 'au', data: progress });
};

export default downloadUserAudio;
