import { audioUnmaskSource } from '@vknext/audio-utils/audioUnmaskSource';
import type { AudioObject } from 'global';
import waitVkApi from 'src/globalVars/waitVkApi';
import { AudioAudio } from 'src/schemas/objects';
import { AudioGetByIdParams } from 'src/schemas/params';
import { AudioGetByIdResponse } from 'src/schemas/responses';

const getAudioByObject = async (audioObject: AudioAudio | AudioObject): Promise<AudioAudio | AudioObject> => {
	const audios = `${audioObject.owner_id}_${audioObject.id}`;

	await waitVkApi();

	const items = await window.vkApi.api<AudioGetByIdParams, AudioGetByIdResponse>('audio.getById', {
		audios,
		v: '5.204',
	});

	for (const item of items) {
		if (!item?.url) continue;

		item.url = audioUnmaskSource(item.url);

		return item;
	}

	const hashes = audioObject.hashes?.split('/');
	let actionHash = '';
	let urlHash = '';

	if (hashes) {
		actionHash = hashes[2];
		urlHash = hashes[5];
	} else {
		actionHash = audioObject.actionHash || '';
		urlHash = audioObject.urlHash || '';
	}

	// всегда возвращает m3u8
	const [response] = await window.ajax.promisifiedPost<any[]>('al_audio.php', {
		act: 'reload_audio',
		ids: `${audios}_${actionHash}_${urlHash}`,
		al: 1,
	});

	const webAudioObject = window.AudioUtils.audioTupleToAudioObject(response[0])!;

	webAudioObject.url = audioUnmaskSource(webAudioObject.url);

	return webAudioObject;
};

export default getAudioByObject;
