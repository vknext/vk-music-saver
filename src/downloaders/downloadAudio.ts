import type { AudioObject } from '@vknext/shared/vkcom/types';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import { getAudioBlob, type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';
import showSnackbar from 'src/react/showSnackbar';
import { AudioAudio } from 'src/schemas/objects';
import getAudioByObject from 'src/services/getAudioByObject';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadType, getDownloadTaskById, startDownload } from 'src/store';
import { DownloadTaskNotFoundError } from 'src/store/downloadErrors';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';

interface DownloadAudioParams extends Pick<GetAudioBlobParams, 'onProgress'> {
	audioObject: AudioObject | AudioAudio;
}

const downloadAudio = async ({ audioObject, onProgress }: DownloadAudioParams) => {
	if (!audioObject) {
		return await showSnackbar({ type: 'error', text: 'VK Music Saver', subtitle: lang.use('vms_audio_not_found') });
	}

	const audio = await getAudioByObject(audioObject);

	if (!audio.url) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_audio_url_not_found'),
		});
	}

	const taskId = 'audio' + [audioObject.owner_id, audioObject.id].join('_');

	try {
		const prevTask = getDownloadTaskById(taskId);

		if (prevTask) {
			prevTask.onSave?.();

			return;
		}
	} catch (e) {
		if (!(e instanceof DownloadTaskNotFoundError)) {
			console.error(e);
		}
	}

	const controller = new AbortController();
	const { signal } = controller;

	let trackName = await formatDownloadedTrackName({ isPlaylist: false, audio });

	const { setProgress, finish, setTitle } = startDownload({
		id: taskId,
		title: `${trackName}.mp3`,
		type: DownloadType.TRACK,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(audio) || undefined,
	});

	const updateTrackNamePromise = getAudioBitrate(audio).then(async (r) => {
		trackName = await formatDownloadedTrackName({
			isPlaylist: false,
			audio,
			bitrate: r?.bitrate,
		});

		setTitle(trackName);
	});

	const blob = await getAudioBlob({
		convertMethod: await GlobalStorage.getValue('audioConvertMethod', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
		audio,
		signal,
		onProgress: (current, total) => {
			if (signal.aborted) return;

			setProgress({ current, total });

			onProgress?.(current, total);
		},
	});

	if (signal.aborted) return;

	try {
		await updateTrackNamePromise;
	} catch (e) {
		console.error(e);
	}

	const blobUrl = URL.createObjectURL(blob);

	const onSave = () => saveFileAs(blobUrl, `${trackName}.mp3`);
	const onRemove = () => URL.revokeObjectURL(blobUrl);

	await onSave();

	finish({ onSave, onRemove });
};

export default downloadAudio;
