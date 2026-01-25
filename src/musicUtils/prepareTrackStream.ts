import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { convertTrackToStream } from '@vknext/shared/vkcom/audio/convertTrackToStream';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import { OwnedIdentity } from 'src/lib/OwnedIdentity';
import type { AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import { PlaylistSource } from 'src/sources/PlaylistSource';
import { AudioConvertMethod } from 'src/storages/enums';
import getAlbumId from './getAlbumId';

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

	const identity = new OwnedIdentity({ id: albumId, ownerId, accessKey: albumAccessKey });

	const playlist = new PlaylistSource(identity);

	try {
		return await playlist.getMeta();
	} catch (error) {
		console.warn('[VK Music Saver/prepareTrackStream] Failed to fetch playlist for tags:', error);
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

	const { createId3TagBuffer } = await import('./createId3TagBuffer');

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
			} catch (error) {
				console.warn('[VK Music Saver/prepareTrackStream] Failed to fetch tags:', error);
			}

			try {
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
