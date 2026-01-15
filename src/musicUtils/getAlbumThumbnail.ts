import type { AudioObject } from '@vknext/shared/vkcom/types';
import { AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import getAlbumId from './getAlbumId';

const albumThumbnailCache = new Map<string, Promise<ArrayBuffer>>();

export const getAlbumThumbUrl = (audio: AudioObject | AudioAudio | AudioPlaylist): string | null => {
	if (audio.coverUrl_l) return audio.coverUrl_l;
	if (audio.coverUrl_m) return audio.coverUrl_m;
	if (audio.coverUrl_s) return audio.coverUrl_s;

	if (Array.isArray(audio.album)) return null;

	const thumb = audio.album?.thumb || audio.photo;

	if (!thumb) return null;

	let maxSize = 0;
	let maxSizePhoto: string | null = null;

	for (const key of Object.keys(thumb)) {
		const [, size] = key.split('_');
		if (!size) continue;

		if (Number(size) > maxSize) {
			maxSize = +size;
			maxSizePhoto = thumb[key];
		}
	}

	return maxSizePhoto;
};

const getAlbumKey = (audio: AudioObject | AudioAudio) => {
	const [ownerId, albumId] = getAlbumId(audio);

	return [ownerId, albumId].join('_');
};

const getAlbumThumbnail = (audio: AudioObject | AudioAudio, signal?: AbortSignal): Promise<ArrayBuffer> | null => {
	const albumKey = getAlbumKey(audio);

	if (albumThumbnailCache.has(albumKey)) {
		return albumThumbnailCache.get(albumKey) as Promise<ArrayBuffer>;
	}

	const thumbUrl = getAlbumThumbUrl(audio);

	if (!thumbUrl) {
		return null;
	}

	const promise = fetch(thumbUrl, { signal }).then((r) => r.arrayBuffer());

	albumThumbnailCache.set(albumKey, promise);

	return promise;
};

export default getAlbumThumbnail;
