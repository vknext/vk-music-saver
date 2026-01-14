import type { AudioObject } from '@vknext/shared/vkcom/types';
import { vknextApi } from 'src/api';
import lang from 'src/lang';
import { abortStreamOnUnload } from 'src/lib/abortStreamOnUnload';
import { streamSaver } from 'src/lib/streamSaver';
import { type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';
import { prepareTrackStream } from 'src/musicUtils/prepareTrackStream';
import showSnackbar from 'src/react/showSnackbar';
import { AudioAudio } from 'src/schemas/objects';
import getAudioByObject from 'src/services/getAudioByObject';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import GlobalStorage from 'src/storages/GlobalStorage';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import { incrementDownloadedTracksCount } from './utils';

interface DownloadAudioParams extends Pick<GetAudioBlobParams, 'onProgress'> {
	audioObject: AudioObject | AudioAudio;
	size?: number;
}

const downloadAudio = async ({ audioObject, onProgress, size }: DownloadAudioParams) => {
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

	const [embedTags, enableLyricsTags, convertMethod] = await Promise.all([
		GlobalStorage.getValue('audio_write_id3_tags', true),
		GlobalStorage.getValue('audio_write_genius_lyrics', true),
		GlobalStorage.getValue('audio_convert_method', AUDIO_CONVERT_METHOD_DEFAULT_VALUE),
	]);

	const trackName = await formatDownloadedTrackName({ isPlaylist: false, audio });
	const filename = `${trackName}.mp3`;

	const fileStream = streamSaver.createWriteStream(filename, {
		size: size ? Math.round(size) : undefined,
	});

	const cleanup = abortStreamOnUnload(fileStream);

	const stream = prepareTrackStream({
		audio,
		embedTags,
		enableLyricsTags,
		convertMethod,
		onProgress: (current, total) => {
			onProgress?.(current, total);
		},
	});

	if (!stream) {
		await showSnackbar({ text: 'Audio url not found', type: 'error' });
		return;
	}

	await stream.pipeTo(fileStream);

	cleanup();

	await Promise.all([incrementDownloadedTracksCount(), vknextApi.call('vms.stat', { type: 'a', data: 1 })]);
};

export default downloadAudio;
