import type { GetTrackDetailsResult } from '@vknext/audio-utils';
import { getTrackDetails } from '@vknext/audio-utils';
import type { AudioObject } from 'global';
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
		setTimeout(processQueue, 500); // задержка между вызовами
	}
};

const enqueueTask = (task: () => Promise<void>) => {
	queue.push(task);
	processQueue();
};

const getAudioBitrate = async (audioObj: AudioAudio | AudioObject): Promise<GetTrackDetailsResult | null> => {
	const audioKey = `${audioObj.owner_id}_${audioObj.id}`;

	if (bitrateCache.has(audioKey)) {
		return bitrateCache.get(audioKey)!;
	}

	if (bitrateCache.has(audioKey)) {
		return await bitrateCache.get(audioKey)!;
	}

	const { promise, resolve } = createPromise<GetTrackDetailsResult | null>();
	bitrateCache.set(audioKey, promise);

	enqueueTask(async () => {
		const audio = audioObj.url ? audioObj : await getAudioByObject(audioObj);

		if (!audio.url) {
			resolve(null);
			return;
		}

		const bitrateResult = await getTrackDetails({
			url: audio.url!,
		});

		resolve(bitrateResult);
	});

	return await promise;
};

export default getAudioBitrate;
