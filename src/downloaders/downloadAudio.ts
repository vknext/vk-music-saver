import { AudioObject } from 'src/global';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import { getAudioBlob, type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';
import getAudioByObject from 'src/musicUtils/getAudioByObject';
import getPerformer from 'src/musicUtils/getPerformer';
import { AudioAudio } from 'src/schemas/objects';

interface DownloadAudioParams extends Pick<GetAudioBlobParams, 'onProgress'> {
	audioObject: AudioObject | AudioAudio;
}

const downloadAudio = async ({ audioObject, onProgress }: DownloadAudioParams) => {
	if (!audioObject) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_audio_not_found') });
		return;
	}

	const audio = await getAudioByObject(audioObject);
	if (!audio.url) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_audio_url_not_found') });
		return;
	}

	let artistTitle = getPerformer(audio);

	let audioName = [artistTitle.trim(), audio.title].join(' - ');

	if (audio.subtitle) {
		audioName += ` (${audio.subtitle})`;
	}

	try {
		const blob = await getAudioBlob({ audio, onProgress });

		const blobUrl = URL.createObjectURL(blob);

		await saveFileAs(blobUrl, `${audioName}.mp3`);

		URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error('Error downloading audio:', error);
		throw new Error('Failed to download audio');
	}
};

export default downloadAudio;
