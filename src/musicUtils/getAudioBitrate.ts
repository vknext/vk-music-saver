import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { getTrackDetails, type GetTrackDetailsResult } from '@vknext/shared/vkcom/audio/getTrackDetails';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import createPromise from 'src/lib/createPromise';
import { AudioAudio } from 'src/schemas/objects';
import getAudioByObject from './getAudioByObject';

const bitrateCache = new Map<string, Promise<GetTrackDetailsResult | null>>();

const queue: (() => Promise<void>)[] = [];
let activePromises = 0;

const processQueue = async () => {
	if (activePromises >= 2 || queue.length === 0) return; // не больше двух параллельных вызовов

	activePromises++;
	const nextTask = queue.shift()!;
	await nextTask();
	activePromises--;

	if (queue.length > 0) {
		setTimeout(processQueue, 800); // задержка между вызовами
	}
};

const enqueueTask = (task: () => Promise<void>) => {
	queue.push(task);
	processQueue();
};

const getAudioBitrate = (audioObj: AudioAudio | AudioObject): Promise<GetTrackDetailsResult | null> => {
	const audioKey = `${audioObj.owner_id}_${audioObj.id}`;

	if (bitrateCache.has(audioKey)) {
		return bitrateCache.get(audioKey)!;
	}

	const { promise, resolve } = createPromise<GetTrackDetailsResult | null>();
	bitrateCache.set(audioKey, promise);

	enqueueTask(async () => {
		const audio = audioObj.url ? audioObj : await getAudioByObject(audioObj);

		if (!audio.url) {
			resolve(null);
			return;
		}

		try {
			const bitrateResult = await getTrackDetails({
				url: audioUnmaskSource(audio.url),
			});

			resolve(bitrateResult);
			return;
		} catch (e) {
			resolve(null);
			bitrateCache.delete(audioKey);
		}
	});

	return promise;
};

export default getAudioBitrate;
