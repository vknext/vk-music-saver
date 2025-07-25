import { Ranges } from '@vknext/shared/lib/Ranges';
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
import {
	type MessagesGetConversationsByIdResponse,
	type MessagesGetHistoryAttachmentsResponse,
	type UsersGetResponse,
} from 'src/schemas/responses';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, startDownload } from 'src/store';
import type { ClientZipFile } from 'src/types';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import getBlobAudioFromPlaylist from './downloadPlaylist/getBlobAudioFromPlaylist';
import { incrementDownloadedPlaylistsCount } from './utils';

async function* getAudios(ownerId: number) {
	let count = 100;
	let next_from: string | undefined;

	let isBreak = false;

	const vkApi = await waitVKApi();

	do {
		const params: Record<string, string | number> = { media_type: 'audio', peer_id: ownerId, count };

		if (next_from) {
			params.start_from = next_from;
		}

		const response = await vkApi.api<MessagesGetHistoryAttachmentsResponse>(
			'messages.getHistoryAttachments',
			params
		);

		next_from = response.next_from;

		yield response;

		if (response.items.length === 0) {
			isBreak = true;

			return;
		}
	} while (isBreak === false);
}

const downloadChatMusic = async (peerId: number) => {
	const fsDirHandle = await getFSDirectoryHandle({
		id: `chat_music_${peerId}`,
		startIn: 'music',
	});

	const [isNumTracks, isAddLeadingZeros] = await Promise.all([
		GlobalStorage.getValue('num_tracks_in_playlist', true),
		GlobalStorage.getValue('add_leading_zeros', false),
	]);

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	let subFolderName = `convo${peerId}`;
	let photoUrl = undefined;

	try {
		if (Ranges.isChatId(peerId)) {
			const { items } = await window.vkApi.api<MessagesGetConversationsByIdResponse>(
				'messages.getConversationsById',
				{
					peer_ids: peerId,
				}
			);

			const chatSettings = items[0]?.chat_settings;

			if (chatSettings?.title) {
				subFolderName = chatSettings.title;
			}

			photoUrl = chatSettings?.photo?.photo_50 || chatSettings?.photo?.photo_100;
		} else if (Ranges.isUserId(peerId)) {
			const [user] = await window.vkApi.api<UsersGetResponse>('users.get', {
				fields: 'photo_100,is_nft',
				user_ids: peerId,
			});

			if (user) {
				subFolderName = `${user.first_name} ${user.last_name}`;
				photoUrl = user.photo_100;
			}
		}
	} catch (e) {
		console.error(e);
	}

	const filename = `${subFolderName}.zip`;

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const taskId = `convo_music${peerId}`;

	const { setProgress, startArchiving, finish, setExtraText } = startDownload({
		id: taskId,
		title: fsDirHandle ? subFolderName : filename,
		type: DownloadType.CONVO,
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
		for await (const { items } of getAudios(peerId)) {
			if (signal.aborted) return;

			totalAudios += items.length;

			for (const { attachment } of items) {
				if (signal.aborted) return;

				if (attachment?.type !== 'audio') continue;

				const position = audioIndex++;

				limiter.addTask(() => downloadTrack(attachment.audio, position));
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

export default downloadChatMusic;
