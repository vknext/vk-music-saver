import type { AudioObject } from '@vknext/shared/vkcom/types';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import { getAudioBlob, type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';
import getAudioByObject from 'src/musicUtils/getAudioByObject';
import getPerformer from 'src/musicUtils/getPerformer';
import showSnackbar from 'src/react/showSnackbar';
import { AudioAudio } from 'src/schemas/objects';
import { DownloadType, getDownloadTaskById, startDownload } from 'src/store';

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

	const prevTask = getDownloadTaskById(taskId);

	if (prevTask) {
		prevTask.onSave?.();

		return;
	}

	const controller = new AbortController();
	const { signal } = controller;

	const { setProgress, finish } = startDownload({
		id: taskId,
		title: audio.title || lang.use('vms_downloading'),
		type: DownloadType.TRACK,
		onCancel: () => controller.abort(),
		photoUrl: getAlbumThumbUrl(audio) || undefined,
	});

	let artistTitle = getPerformer(audio);

	let audioName = [artistTitle.trim(), audio.title].join(' - ');

	if (audio.subtitle) {
		audioName += ` (${audio.subtitle})`;
	}

	try {
		const blob = await getAudioBlob({
			audio,
			signal,
			onProgress: (current, total) => {
				if (signal.aborted) return;

				setProgress({ current, total });

				onProgress?.(current, total);
			},
		});

		if (signal.aborted) return;

		const blobUrl = URL.createObjectURL(blob);
		const name = `${audioName}.mp3`;

		const onSave = () => saveFileAs(blobUrl, name);
		const onRemove = () => URL.revokeObjectURL(blobUrl);

		await onSave();

		finish({ onSave, onRemove });
	} catch (error) {
		console.error('[VMS] Error downloading audio:', error);
		throw new Error('Failed to download audio');
	}
};

export default downloadAudio;
