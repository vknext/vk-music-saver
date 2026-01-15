import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { convertTrackToStream } from '@vknext/shared/vkcom/audio/convertTrackToStream';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import type { AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import getAudioPlaylistById from 'src/services/getAudioPlaylistById';
import { createId3TagBuffer } from './createId3TagBuffer';
import getAlbumId from './getAlbumId';
import { AudioConvertMethod } from 'src/storages/enums';

interface PrepareTrackStreamOptions {
	audio: AudioAudio | AudioObject;
	playlist?: AudioPlaylist | null;
	signal?: AbortSignal;
	onProgress?: (current: number, total: number) => void;
	embedTags?: boolean;
	enableLyricsTags?: boolean;
	convertMethod?: AudioConvertMethod;
}

const resolvePlaylist = async (
	audio: AudioAudio | AudioObject,
	existingPlaylist?: AudioPlaylist | null
): Promise<AudioPlaylist | null> => {
	if (existingPlaylist) return existingPlaylist;

	const [ownerId, albumId, albumAccessKey] = getAlbumId(audio);
	if (!ownerId || !albumId) return null;

	try {
		return await getAudioPlaylistById({
			owner_id: ownerId,
			playlist_id: albumId,
			access_key: albumAccessKey,
			withTracks: false,
		});
	} catch (error) {
		console.warn('[VMS/prepareTrackStream] Failed to fetch playlist for tags:', error);
		return null;
	}
};

const prepareTagsBuffer = async ({
	audio,
	playlist: existingPlaylist,
	embedTags,
	enableLyricsTags,
	signal,
}: PrepareTrackStreamOptions): Promise<Uint8Array | null> => {
	if (!embedTags) return null;

	const playlist = await resolvePlaylist(audio, existingPlaylist);

	return createId3TagBuffer({
		audio,
		playlist,
		signal,
		enableLyrics: enableLyricsTags,
	});
};

/**
 * Взято из VK Next 14.8.0 с модификацией convertMethod
 * @see https://github.com/vknext/vknext
 */
export const prepareTrackStream = ({
	audio,
	playlist,
	signal,
	onProgress,
	embedTags = true,
	enableLyricsTags = true,
	convertMethod = AudioConvertMethod.HLS,
}: PrepareTrackStreamOptions): ReadableStream<Uint8Array> | null => {
	if (!audio.url) return null;

	const audioStreamPromise = convertTrackToStream({
		url: audioUnmaskSource(audio.url),
		onProgress(current) {
			if (onProgress) {
				onProgress(Math.round(current * 100), 100);
			}
		},
		forceHls: convertMethod === AudioConvertMethod.HLS,
	});

	const tagsPromise = prepareTagsBuffer({ audio, playlist, embedTags, enableLyricsTags, signal });

	let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
	let isCancelled = false;

	return new ReadableStream({
		async start(controller) {
			try {
				const tags = await tagsPromise;

				if (isCancelled) return;

				if (tags) {
					controller.enqueue(tags);
				}

				const audioStream = await audioStreamPromise;

				if (isCancelled) {
					await audioStream.cancel();
					return;
				}

				activeReader = audioStream.getReader();

				while (true) {
					const { done, value } = await activeReader.read();
					if (done) break;

					controller.enqueue(value);
				}

				controller.close();
			} catch (error) {
				if (!isCancelled) {
					controller.error(error);
				}
			}
		},
		async cancel(reason) {
			isCancelled = true;

			if (activeReader) {
				await activeReader.cancel(reason);
			} else {
				try {
					const stream = await audioStreamPromise;

					if (!stream.locked) {
						await stream.cancel(reason);
					}
				} catch {
					// игнор ошибки, если промис уже был отклонен
				}
			}
		},
	});
};
