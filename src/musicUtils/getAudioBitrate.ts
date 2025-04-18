import { createPromise } from '@vknext/shared/utils/createPromise';
import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { getTrackDetails, type GetTrackDetailsResult } from '@vknext/shared/vkcom/audio/getTrackDetails';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import { AudioAudio } from 'src/schemas/objects';
import TrackDetailsStorage from 'src/storages/TrackDetailsStorage';
import getAudioByObject from '../services/getAudioByObject';

const MAX_CONCURRENT_TASKS = 2;
const TASK_DELAY_MS = 800;

const queue: (() => Promise<void>)[] = [];
let activeTasks = 0;

const processQueue = async () => {
	if (activeTasks >= MAX_CONCURRENT_TASKS || queue.length === 0) return;

	activeTasks++;

	const task = queue.shift()!;

	try {
		await task();
	} catch (e) {
		console.error(e);
	}

	activeTasks--;

	if (queue.length > 0) {
		setTimeout(processQueue, TASK_DELAY_MS);
	}
};

const enqueueTask = (task: () => Promise<void>): void => {
	queue.push(task);
	processQueue();
};

const bitrateCache = new Map<string, Promise<GetTrackDetailsResult | null>>();

const getAudioBitrate = async (audioObj: AudioAudio | AudioObject): Promise<GetTrackDetailsResult | null> => {
	const audioKey = `${audioObj.owner_id}_${audioObj.id}`;

	if (bitrateCache.has(audioKey)) {
		return bitrateCache.get(audioKey)!;
	}

	const { promise, resolve } = createPromise<GetTrackDetailsResult | null>();
	bitrateCache.set(audioKey, promise);

	try {
		const cached = await TrackDetailsStorage.get(audioKey);
		if (cached) {
			resolve(cached);

			return promise;
		}
	} catch (e) {
		console.error(e);
	}

	enqueueTask(async () => {
		const audio = audioObj.url ? audioObj : await getAudioByObject(audioObj);
		if (!audio.url) return resolve(null);

		try {
			const result = await getTrackDetails({
				url: audioUnmaskSource(audio.url),
			});

			resolve(result);

			await TrackDetailsStorage.set(audioKey, result);
		} catch {
			bitrateCache.delete(audioKey);
			resolve(null);
		}
	});

	return promise;
};

export default getAudioBitrate;
