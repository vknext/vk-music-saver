import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import { AudioAudio } from 'src/schemas/objects';
import { AudioGetByIdResponse } from 'src/schemas/responses';

const getAudioByObject = async (audioObject: AudioAudio | AudioObject): Promise<AudioAudio | AudioObject> => {
	const audio = [audioObject.owner_id, audioObject.id];
	if (audioObject.access_key) {
		audio.push(audioObject.access_key);
	} else if (audioObject.accessKey) {
		audio.push(audioObject.accessKey);
	}

	const vkApi = await waitVKApi();

	const items = await vkApi.api<AudioGetByIdResponse>('audio.getById', {
		audios: audio.join('_'),
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
		ids: [audioObject.owner_id, audioObject.id, actionHash, urlHash].join('_'),
		al: 1,
	});

	const webAudioObject = window.AudioUtils.audioTupleToAudioObject(response[0])!;

	webAudioObject.url = audioUnmaskSource(webAudioObject.url);

	return webAudioObject;
};

export default getAudioByObject;
