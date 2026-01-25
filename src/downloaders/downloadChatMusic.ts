import { Ranges } from '@vknext/shared/lib/Ranges';
import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import { vknextApi } from 'src/api';
import lang from 'src/lang';
import { streamSaver } from 'src/lib/streamSaver';
import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import getFSDirectoryHandle from 'src/musicUtils/fileSystem/getFSDirectoryHandle';
import { prepareTrackStream } from 'src/musicUtils/prepareTrackStream';
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
import { incrementDownloadedPlaylistsCount } from './utils';

async function* getAudios(ownerId: number, signal?: AbortSignal) {
	const count = 100;
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
			params,
			{},
			{ signal }
		);

		next_from = response.next_from;

		yield response;

		if (response.items.length === 0) {
			isBreak = true;

			return;
		}
	} while (isBreak === false);
}

const getChatDetails = async (peerId: number) => {
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

	return { subFolderName, photoUrl };
};

const downloadChatMusic = async (peerId: number) => {
	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_downloading') });

	const [fsDirHandle, { subFolderName, photoUrl }, isNumTracks, convertMethod, embedTags, enableLyricsTags] =
		await Promise.all([
			await getFSDirectoryHandle({
				id: `chat_music_${peerId}`,
				startIn: 'music',
			}),
			getChatDetails(peerId),
			GlobalStorage.getValue('num_tracks_in_playlist', true),
			GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
			GlobalStorage.getValue('audio_write_id3_tags', true),
			GlobalStorage.getValue('audio_write_genius_lyrics', true),
		]);

	const filename = `${subFolderName}.zip`;

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const taskId = `convo_music${peerId}`;

	const { setProgress, finish, setExtraText } = startDownload({
		id: taskId,
		title: fsDirHandle ? subFolderName : filename,
		type: DownloadType.CONVO,
		onCancel: () => controller.abort(),
		photoUrl: photoUrl,
	});

	let progress = 0;
	let totalAudios = 0;

	const updateProgress = () => {
		if (signal.aborted) return;

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
		let index = 1;

		for await (const { items } of getAudios(peerId, signal)) {
			if (signal.aborted) return;

			totalAudios += items.length;

			for (const { attachment } of items) {
				if (signal.aborted) return;

				if (attachment?.type !== 'audio') continue;

				const position = index++;

				const item = await downloadTrack(attachment.audio, position);

				if (item) {
					yield item;

					setExtraText(lang.use('vms_playlist_track_download_completed', { trackName: item.name }));
					updateProgress();
				}
			}
		}
	}

	if (fsDirHandle) {
		for await (const zipFile of trackGenerator()) {
			await createFileInDirectory({
				zipFile,
				subFolderName,
				dirHandle: fsDirHandle,
				signal,
			});
		}

		await showSnackbar({
			type: 'done',
			text: lang.use('vms_fs_music_done'),
			subtitle: subFolderName,
		});
	} else {
		const { makeZip } = await import('client-zip');

		const zipStream = makeZip(trackGenerator());

		const fileStream = streamSaver.createWriteStream(filename);

		await zipStream.pipeTo(fileStream, { signal });
	}

	if (signal.aborted) return;

	finish();

	setExtraText(lang.use('vms_playlist_download_completed', { total: lang.use('vms_tracks_plurals', progress) }));

	await incrementDownloadedPlaylistsCount();

	await vknextApi.call('vms.stat', { type: 'acm', data: progress });
};

export default downloadChatMusic;
